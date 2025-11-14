import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/invoices - Get invoices
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get('partner_id');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (partnerId) where.partnerId = partnerId;
    if (status) where.status = status;

    // Fetch invoices with partner details
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
          },
        },
        disputes: {
          where: { status: 'OPEN' },
        },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    // Transform to match API response format
    const formattedInvoices = invoices.map((i) => ({
      invoice_id: i.id,
      invoice_number: i.invoiceNumber,
      partner_id: i.partnerId,
      partner_name: i.partner.partnerName,
      partner_code: i.partner.partnerCode,
      billing_period_start: i.billingPeriodStart.toISOString().split('T')[0],
      billing_period_end: i.billingPeriodEnd.toISOString().split('T')[0],
      invoice_date: i.invoiceDate.toISOString().split('T')[0],
      due_date: i.dueDate?.toISOString().split('T')[0] || null,
      subtotal: parseFloat(i.subtotal.toString()),
      tax_amount: parseFloat(i.taxAmount.toString()),
      total_amount: parseFloat(i.totalAmount.toString()),
      currency: i.currency,
      status: i.status,
      payment_date: i.paymentDate?.toISOString().split('T')[0] || null,
      line_items: i.lineItems,
      notes: i.notes,
      created_at: i.createdAt.toISOString(),
      updated_at: i.updatedAt.toISOString(),
      has_disputes: i.disputes.length > 0,
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
