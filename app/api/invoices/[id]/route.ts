import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/invoices/:id - Get a single invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            partnerName: true,
            partnerCode: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
        disputes: {
          select: {
            id: true,
            disputeNumber: true,
            status: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Parse line items if stored as JSON
    let lineItems = [];
    if (invoice.lineItemsJson) {
      try {
        lineItems = JSON.parse(invoice.lineItemsJson as string);
      } catch (e) {
        console.error('Failed to parse line items:', e);
      }
    }

    // Calculate total paid
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0
    );

    // Format response
    const response = {
      invoice_id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      partner_id: invoice.partnerId,
      partner_name: invoice.partner.partnerName,
      partner_code: invoice.partner.partnerCode,
      billing_period_start: invoice.billingPeriodStart.toISOString().split('T')[0],
      billing_period_end: invoice.billingPeriodEnd.toISOString().split('T')[0],
      subtotal: parseFloat(invoice.subtotal.toString()),
      tax_amount: parseFloat(invoice.taxAmount.toString()),
      total_amount: parseFloat(invoice.totalAmount.toString()),
      currency: invoice.currency,
      status: invoice.status,
      invoice_date: invoice.invoiceDate.toISOString().split('T')[0],
      due_date: invoice.dueDate?.toISOString().split('T')[0] || null,
      payment_date: invoice.paidDate?.toISOString().split('T')[0] || null,
      pdf_url: invoice.pdfUrl,
      line_items: lineItems,
      notes: invoice.notes,
      created_at: invoice.createdAt.toISOString(),
      updated_at: invoice.updatedAt.toISOString(),
      has_disputes: invoice.disputes.length > 0,
      total_paid: totalPaid,
      outstanding_balance: parseFloat(invoice.totalAmount.toString()) - totalPaid,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: `Failed to fetch invoice: ${error.message}` },
      { status: 500 }
    );
  }
}

// PATCH /api/invoices/:id - Update an invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.due_date) updateData.dueDate = new Date(body.due_date);
    if (body.payment_date) updateData.paidDate = new Date(body.payment_date);

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      invoice_id: updatedInvoice.id,
      invoice_number: updatedInvoice.invoiceNumber,
      status: updatedInvoice.status,
      updated_at: updatedInvoice.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: `Failed to update invoice: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/:id - Delete/Cancel an invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion if payments exist
    if (invoice.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with payments. Cancel it instead.' },
        { status: 400 }
      );
    }

    // For invoices with no payments, we can mark as cancelled instead of deleting
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      message: 'Invoice cancelled successfully',
      invoice_id: updatedInvoice.id,
      status: updatedInvoice.status,
    });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: `Failed to delete invoice: ${error.message}` },
      { status: 500 }
    );
  }
}
