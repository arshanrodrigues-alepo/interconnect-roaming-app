import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// POST /api/invoices/:id/payments - Record a payment for an invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.amount || !body.payment_date || !body.payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, payment_date, payment_method' },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Calculate total paid so far
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0
    );

    const paymentAmount = parseFloat(body.amount);
    const invoiceTotal = parseFloat(invoice.totalAmount.toString());
    const newTotalPaid = totalPaid + paymentAmount;

    // Validate payment amount
    if (newTotalPaid > invoiceTotal) {
      return NextResponse.json(
        {
          error: 'Payment amount exceeds outstanding balance',
          outstanding_balance: invoiceTotal - totalPaid,
          attempted_payment: paymentAmount
        },
        { status: 400 }
      );
    }

    // Generate payment number
    const currentYear = new Date().getFullYear();
    const lastPayment = await prisma.payment.findFirst({
      where: {
        paymentNumber: {
          startsWith: `PAY-${currentYear}-`
        }
      },
      orderBy: { paymentNumber: 'desc' }
    });

    let paymentSequence = 1;
    if (lastPayment) {
      const match = lastPayment.paymentNumber.match(/PAY-\d{4}-(\d+)/);
      if (match) {
        paymentSequence = parseInt(match[1]) + 1;
      }
    }

    const paymentNumber = `PAY-${currentYear}-${paymentSequence.toString().padStart(4, '0')}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        invoiceId,
        amount: paymentAmount,
        currency: body.currency || invoice.currency,
        paymentDate: new Date(body.payment_date),
        paymentMethod: body.payment_method,
        referenceNumber: body.reference_number || null,
        status: body.status || 'CONFIRMED',
        notes: body.notes || null,
        createdBy: body.created_by || null,
      }
    });

    // Update invoice status based on payment
    let newInvoiceStatus = invoice.status;
    if (newTotalPaid >= invoiceTotal) {
      newInvoiceStatus = 'PAID';
    } else if (newTotalPaid > 0 && invoice.status === 'ISSUED') {
      newInvoiceStatus = 'PARTIALLY_PAID';
    }

    // Update invoice with new status and paid date
    const updateData: any = {
      status: newInvoiceStatus
    };

    if (newTotalPaid >= invoiceTotal) {
      updateData.paidDate = new Date(body.payment_date);
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData
    });

    // Transform response
    const response = {
      payment_id: payment.id,
      payment_number: payment.paymentNumber,
      invoice_id: payment.invoiceId,
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      payment_date: payment.paymentDate.toISOString().split('T')[0],
      payment_method: payment.paymentMethod,
      reference_number: payment.referenceNumber,
      status: payment.status,
      notes: payment.notes,
      created_at: payment.createdAt.toISOString(),
      invoice_status: newInvoiceStatus,
      total_paid: newTotalPaid,
      outstanding_balance: invoiceTotal - newTotalPaid
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: `Failed to record payment: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET /api/invoices/:id/payments - Get all payments for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' }
    });

    // Calculate totals
    const totalPaid = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0
    );
    const invoiceTotal = parseFloat(invoice.totalAmount.toString());

    const formattedPayments = payments.map(p => ({
      payment_id: p.id,
      payment_number: p.paymentNumber,
      amount: parseFloat(p.amount.toString()),
      currency: p.currency,
      payment_date: p.paymentDate.toISOString().split('T')[0],
      payment_method: p.paymentMethod,
      reference_number: p.referenceNumber,
      status: p.status,
      notes: p.notes,
      created_at: p.createdAt.toISOString(),
    }));

    return NextResponse.json({
      payments: formattedPayments,
      total_paid: totalPaid,
      outstanding_balance: invoiceTotal - totalPaid,
      invoice_total: invoiceTotal,
      invoice_status: invoice.status
    });
  } catch (error) {
    console.error('Error fetching invoice payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
