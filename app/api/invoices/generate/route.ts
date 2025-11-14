import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { CDR } from '@/lib/types';

/**
 * Invoice Generation Endpoint
 *
 * Generates invoices from rated CDRs for a specific partner and billing period
 *
 * POST /api/invoices/generate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id, start_date, end_date, cdrs } = body;

    // Validate required fields
    if (!partner_id) {
      return NextResponse.json(
        { error: 'partner_id is required' },
        { status: 400 }
      );
    }

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    if (!cdrs || !Array.isArray(cdrs) || cdrs.length === 0) {
      return NextResponse.json(
        { error: 'CDRs array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Get partner details
    const partner = await prisma.partner.findUnique({
      where: { id: partner_id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get agreement for currency and billing details
    const agreement = await prisma.agreement.findFirst({
      where: { partnerId: partner_id },
      orderBy: { createdAt: 'desc' },
    });

    const currency = agreement?.currency || 'USD';

    // Filter only rated CDRs
    const ratedCDRs: CDR[] = cdrs.filter(
      (cdr: CDR) => cdr.processing_status === 'RATED'
    );

    if (ratedCDRs.length === 0) {
      return NextResponse.json(
        { error: 'No rated CDRs found for invoice generation' },
        { status: 400 }
      );
    }

    // Group CDRs by service type and direction
    interface LineItem {
      service_type: string;
      direction: string;
      quantity: number;
      unit: string;
      rate: number;
      amount: number;
    }

    const lineItems: Record<string, LineItem> = {};

    ratedCDRs.forEach((cdr) => {
      const key = `${cdr.call_type}-${cdr.direction}`;

      if (!lineItems[key]) {
        lineItems[key] = {
          service_type: cdr.call_type,
          direction: cdr.direction,
          quantity: 0,
          unit: cdr.call_type === 'VOICE' ? 'seconds' : 'messages',
          rate: cdr.rate_applied || 0,
          amount: 0,
        };
      }

      // Add quantity
      if (cdr.call_type === 'VOICE') {
        lineItems[key].quantity += cdr.duration || 0;
      } else if (cdr.call_type === 'SMS') {
        lineItems[key].quantity += cdr.number_of_events || 1;
      }

      // Add charge
      lineItems[key].amount += cdr.charge || 0;
    });

    // Calculate totals
    const subtotal = Object.values(lineItems).reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const tax_rate = 0.0; // Can be configured based on partner/country
    const tax_amount = subtotal * tax_rate;
    const total = subtotal + tax_amount;

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 10000)
    ).padStart(4, '0')}`;

    // Prepare line items for database
    const lineItemsForDb = Object.values(lineItems).map((item) => ({
      description: `${item.service_type} ${item.direction}`,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate.toFixed(4),
      amount: item.amount.toFixed(4),
    }));

    // Create invoice in database
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        partnerId: partner_id,
        billingPeriodStart: new Date(start_date),
        billingPeriodEnd: new Date(end_date),
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        currency,
        subtotal,
        taxAmount: tax_amount,
        totalAmount: total,
        status: 'PENDING',
        lineItems: lineItemsForDb,
      },
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
          },
        },
      },
    });

    // Prepare detailed summary
    const summary = {
      partner: {
        partner_id: partner.id,
        partner_code: partner.partnerCode,
        partner_name: partner.partnerName,
      },
      billing_period: {
        start: start_date,
        end: end_date,
        days: Math.ceil(
          (new Date(end_date).getTime() - new Date(start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
      cdr_summary: {
        total_cdrs: cdrs.length,
        rated_cdrs: ratedCDRs.length,
        failed_cdrs: cdrs.length - ratedCDRs.length,
      },
      line_items: lineItemsForDb,
      totals: {
        subtotal: subtotal.toFixed(4),
        tax: tax_amount.toFixed(4),
        total: total.toFixed(4),
        currency: currency,
      },
    };

    // Format invoice response
    const invoiceResponse = {
      invoice_id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      partner_id: invoice.partnerId,
      invoice_date: invoice.invoiceDate.toISOString(),
      billing_period_start: invoice.billingPeriodStart.toISOString().split('T')[0],
      billing_period_end: invoice.billingPeriodEnd.toISOString().split('T')[0],
      due_date: invoice.dueDate?.toISOString().split('T')[0] || null,
      currency: invoice.currency,
      subtotal: parseFloat(invoice.subtotal.toString()),
      tax_amount: parseFloat(invoice.taxAmount.toString()),
      total_amount: parseFloat(invoice.totalAmount.toString()),
      status: invoice.status,
      created_at: invoice.createdAt.toISOString(),
      updated_at: invoice.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        invoice: invoiceResponse,
        summary: summary,
        message: `Invoice ${invoice.invoiceNumber} generated successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      {
        error: 'Invoice generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for service info
 */
export async function GET() {
  return NextResponse.json({
    service: 'Invoice Generation',
    status: 'operational',
    version: '1.0.0',
    description: 'Generate invoices from rated CDRs',
    required_fields: ['partner_id', 'start_date', 'end_date', 'cdrs'],
    features: [
      'Automatic line item grouping',
      'Tax calculation',
      'Due date calculation (30 days)',
      'Multi-currency support',
      'CDR validation',
    ],
  });
}
