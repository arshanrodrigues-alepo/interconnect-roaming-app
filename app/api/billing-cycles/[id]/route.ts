import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/billing-cycles/:id - Get billing cycle details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cycle = await prisma.billingCycle.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
            countryCode: true,
            contactEmail: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
            invoiceDate: true,
            dueDate: true,
            paidDate: true,
          },
        },
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Billing cycle not found' }, { status: 404 });
    }

    // Transform response
    const response = {
      id: cycle.id,
      partner_id: cycle.partnerId,
      partner: {
        partner_code: cycle.partner.partnerCode,
        partner_name: cycle.partner.partnerName,
        country_code: cycle.partner.countryCode,
        contact_email: cycle.partner.contactEmail,
      },
      cycle_number: cycle.cycleNumber,
      period_start: cycle.periodStart.toISOString(),
      period_end: cycle.periodEnd.toISOString(),
      cut_off_date: cycle.cutOffDate.toISOString(),
      due_date: cycle.dueDate.toISOString(),
      status: cycle.status,
      total_voice_minutes: cycle.totalVoiceMinutes ? Number(cycle.totalVoiceMinutes) : null,
      total_sms_count: cycle.totalSmsCount ? Number(cycle.totalSmsCount) : null,
      total_data_mb: cycle.totalDataMb ? Number(cycle.totalDataMb) : null,
      total_charges: cycle.totalCharges ? Number(cycle.totalCharges) : null,
      total_cost: cycle.totalCost ? Number(cycle.totalCost) : null,
      margin: cycle.margin ? Number(cycle.margin) : null,
      currency: cycle.currency,
      invoice_id: cycle.invoiceId,
      invoice: cycle.invoice
        ? {
            invoice_number: cycle.invoice.invoiceNumber,
            status: cycle.invoice.status,
            total_amount: Number(cycle.invoice.totalAmount),
            invoice_date: cycle.invoice.invoiceDate.toISOString(),
            due_date: cycle.invoice.dueDate.toISOString(),
            paid_date: cycle.invoice.paidDate?.toISOString() || null,
          }
        : null,
      closed_at: cycle.closedAt?.toISOString() || null,
      created_at: cycle.createdAt.toISOString(),
      updated_at: cycle.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch billing cycle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing cycle' },
      { status: 500 }
    );
  }
}

// PATCH /api/billing-cycles/:id - Update billing cycle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if cycle exists
    const existingCycle = await prisma.billingCycle.findUnique({
      where: { id },
    });

    if (!existingCycle) {
      return NextResponse.json({ error: 'Billing cycle not found' }, { status: 404 });
    }

    // Prevent updates to closed cycles
    if (existingCycle.status === 'CLOSED' && body.status !== 'DISPUTED') {
      return NextResponse.json(
        { error: 'Cannot update closed billing cycle' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.period_start) updateData.periodStart = new Date(body.period_start);
    if (body.period_end) updateData.periodEnd = new Date(body.period_end);
    if (body.cut_off_date) updateData.cutOffDate = new Date(body.cut_off_date);
    if (body.due_date) updateData.dueDate = new Date(body.due_date);
    if (body.status) updateData.status = body.status;
    if (body.currency) updateData.currency = body.currency;
    if (body.invoice_id) updateData.invoiceId = body.invoice_id;

    // Update traffic and financial data if provided
    if (body.total_voice_minutes !== undefined)
      updateData.totalVoiceMinutes = body.total_voice_minutes;
    if (body.total_sms_count !== undefined) updateData.totalSmsCount = body.total_sms_count;
    if (body.total_data_mb !== undefined) updateData.totalDataMb = body.total_data_mb;
    if (body.total_charges !== undefined) updateData.totalCharges = body.total_charges;
    if (body.total_cost !== undefined) updateData.totalCost = body.total_cost;
    if (body.margin !== undefined) updateData.margin = body.margin;

    // If closing the cycle, set closedAt timestamp
    if (body.status === 'CLOSED' && existingCycle.status !== 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const cycle = await prisma.billingCycle.update({
      where: { id },
      data: updateData,
      include: {
        partner: {
          select: {
            partnerCode: true,
            partnerName: true,
            countryCode: true,
          },
        },
      },
    });

    // Transform response
    const response = {
      id: cycle.id,
      partner_id: cycle.partnerId,
      partner: {
        partner_code: cycle.partner.partnerCode,
        partner_name: cycle.partner.partnerName,
        country_code: cycle.partner.countryCode,
      },
      cycle_number: cycle.cycleNumber,
      period_start: cycle.periodStart.toISOString(),
      period_end: cycle.periodEnd.toISOString(),
      cut_off_date: cycle.cutOffDate.toISOString(),
      due_date: cycle.dueDate.toISOString(),
      status: cycle.status,
      total_voice_minutes: cycle.totalVoiceMinutes ? Number(cycle.totalVoiceMinutes) : null,
      total_sms_count: cycle.totalSmsCount ? Number(cycle.totalSmsCount) : null,
      total_data_mb: cycle.totalDataMb ? Number(cycle.totalDataMb) : null,
      total_charges: cycle.totalCharges ? Number(cycle.totalCharges) : null,
      total_cost: cycle.totalCost ? Number(cycle.totalCost) : null,
      margin: cycle.margin ? Number(cycle.margin) : null,
      currency: cycle.currency,
      invoice_id: cycle.invoiceId,
      closed_at: cycle.closedAt?.toISOString() || null,
      updated_at: cycle.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Failed to update billing cycle:', error);
    return NextResponse.json(
      { error: `Failed to update billing cycle: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/billing-cycles/:id - Delete billing cycle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if cycle exists and can be deleted
    const cycle = await prisma.billingCycle.findUnique({
      where: { id },
      select: { status: true, invoiceId: true },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Billing cycle not found' }, { status: 404 });
    }

    // Prevent deletion of cycles with invoices
    if (cycle.invoiceId) {
      return NextResponse.json(
        { error: 'Cannot delete billing cycle with associated invoice' },
        { status: 400 }
      );
    }

    // Prevent deletion of closed or invoiced cycles
    if (cycle.status === 'CLOSED' || cycle.status === 'INVOICED') {
      return NextResponse.json(
        { error: 'Cannot delete closed or invoiced billing cycle' },
        { status: 400 }
      );
    }

    await prisma.billingCycle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Billing cycle deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete billing cycle:', error);
    return NextResponse.json(
      { error: `Failed to delete billing cycle: ${error.message}` },
      { status: 500 }
    );
  }
}
