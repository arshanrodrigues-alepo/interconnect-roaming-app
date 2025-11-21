import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// POST /api/billing-cycles/:id/generate-invoice - Generate invoice from billing cycle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if cycle exists and is closed
    const cycle = await prisma.billingCycle.findUnique({
      where: { id },
      include: {
        partner: true,
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Billing cycle not found' }, { status: 404 });
    }

    if (cycle.status !== 'CLOSED') {
      return NextResponse.json(
        { error: 'Billing cycle must be closed before generating invoice' },
        { status: 400 }
      );
    }

    if (cycle.invoiceId) {
      return NextResponse.json(
        { error: 'Invoice already generated for this billing cycle' },
        { status: 400 }
      );
    }

    // Get the latest invoice number for this year
    const currentYear = new Date().getFullYear();
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${currentYear}-`,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
      select: {
        invoiceNumber: true,
      },
    });

    let invoiceSequence = 1;
    if (latestInvoice) {
      const match = latestInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match) {
        invoiceSequence = parseInt(match[1]) + 1;
      }
    }

    const invoiceNumber = `INV-${currentYear}-${invoiceSequence.toString().padStart(3, '0')}`;

    // Get TAP records for line items
    const tapRecords = await prisma.tAPRecord.findMany({
      where: {
        partnerId: cycle.partnerId,
        callDateTime: {
          gte: cycle.periodStart,
          lte: cycle.periodEnd,
        },
        processingStatus: 'RATED',
      },
      select: {
        serviceType: true,
        durationSeconds: true,
        messageCount: true,
        dataVolumeMb: true,
        chargedAmount: true,
      },
    });

    // Aggregate line items by service type and direction
    const lineItemsMap = new Map<string, any>();

    for (const record of tapRecords) {
      const key = `${record.serviceType}`;

      if (!lineItemsMap.has(key)) {
        lineItemsMap.set(key, {
          service_type: record.serviceType,
          direction: 'INBOUND', // Default - should be tracked per record
          total_units: 0,
          rate: 0,
          amount: 0,
        });
      }

      const lineItem = lineItemsMap.get(key)!;

      if (record.serviceType === 'VOICE' && record.durationSeconds) {
        lineItem.total_units += Math.ceil(record.durationSeconds / 60);
      } else if (record.serviceType === 'SMS' && record.messageCount) {
        lineItem.total_units += record.messageCount;
      } else if (record.serviceType === 'DATA' && record.dataVolumeMb) {
        lineItem.total_units += Number(record.dataVolumeMb);
      }

      if (record.chargedAmount) {
        lineItem.amount += Number(record.chargedAmount);
      }
    }

    // Calculate rate per unit for each line item
    const lineItems = Array.from(lineItemsMap.values()).map((item) => ({
      service_type: item.service_type,
      direction: item.direction,
      total_units: item.total_units,
      rate: item.total_units > 0 ? item.amount / item.total_units : 0,
      amount: item.amount,
    }));

    const subtotal = Number(cycle.totalCharges) || 0;
    const taxAmount = subtotal * 0.1; // 10% tax - should come from partner/country config
    const totalAmount = subtotal + taxAmount;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        partnerId: cycle.partnerId,
        billingPeriodStart: cycle.periodStart,
        billingPeriodEnd: cycle.periodEnd,
        subtotal,
        taxAmount,
        totalAmount,
        currency: cycle.currency || 'USD',
        status: 'DRAFT',
        invoiceDate: new Date(),
        dueDate: cycle.dueDate,
        lineItems,
      },
    });

    // Update billing cycle with invoice reference
    await prisma.billingCycle.update({
      where: { id },
      data: {
        invoiceId: invoice.id,
        status: 'INVOICED',
      },
    });

    // Transform response
    const response = {
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      partner_id: invoice.partnerId,
      billing_cycle_id: id,
      billing_period_start: invoice.billingPeriodStart.toISOString(),
      billing_period_end: invoice.billingPeriodEnd.toISOString(),
      subtotal: Number(invoice.subtotal),
      tax_amount: Number(invoice.taxAmount),
      total_amount: Number(invoice.totalAmount),
      currency: invoice.currency,
      status: invoice.status,
      invoice_date: invoice.invoiceDate.toISOString(),
      due_date: invoice.dueDate.toISOString(),
      line_items: lineItems,
      created_at: invoice.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Failed to generate invoice:', error);
    return NextResponse.json(
      { error: `Failed to generate invoice: ${error.message}` },
      { status: 500 }
    );
  }
}
