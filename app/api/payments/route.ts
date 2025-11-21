import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/payments - List all payments with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceId = searchParams.get('invoice_id');
    const partnerId = searchParams.get('partner_id');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // Build where clause
    const where: any = {};

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) where.paymentDate.gte = new Date(fromDate);
      if (toDate) where.paymentDate.lte = new Date(toDate);
    }

    // If partnerId filter, need to join through invoice
    if (partnerId) {
      where.invoice = {
        partnerId: partnerId
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            partnerId: true,
            totalAmount: true,
            currency: true,
            partner: {
              select: {
                partnerName: true,
                partnerCode: true,
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    // Transform response
    const formattedPayments = payments.map(p => ({
      payment_id: p.id,
      payment_number: p.paymentNumber,
      invoice_id: p.invoiceId,
      invoice_number: p.invoice.invoiceNumber,
      partner_id: p.invoice.partnerId,
      partner_name: p.invoice.partner.partnerName,
      partner_code: p.invoice.partner.partnerCode,
      amount: parseFloat(p.amount.toString()),
      currency: p.currency,
      payment_date: p.paymentDate.toISOString().split('T')[0],
      payment_method: p.paymentMethod,
      reference_number: p.referenceNumber,
      status: p.status,
      notes: p.notes,
      created_at: p.createdAt.toISOString(),
      created_by: p.createdBy,
    }));

    return NextResponse.json({
      payments: formattedPayments,
      total: formattedPayments.length
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
