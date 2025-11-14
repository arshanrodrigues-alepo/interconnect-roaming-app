import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/disputes - Get disputes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get('partner_id');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (partnerId) where.partnerId = partnerId;
    if (status) where.status = status;

    // Fetch disputes with partner and invoice details
    const disputes = await prisma.dispute.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            currency: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match API response format
    const formattedDisputes = disputes.map((d) => ({
      dispute_id: d.id,
      dispute_number: d.disputeNumber,
      partner_id: d.partnerId,
      partner_name: d.partner.partnerName,
      partner_code: d.partner.partnerCode,
      invoice_id: d.invoiceId,
      invoice_number: d.invoice?.invoiceNumber || null,
      dispute_type: d.disputeType,
      status: d.status,
      priority: d.priority,
      description: d.description,
      disputed_amount: d.disputedAmount ? parseFloat(d.disputedAmount.toString()) : null,
      resolved_amount: d.resolvedAmount ? parseFloat(d.resolvedAmount.toString()) : null,
      created_at: d.createdAt.toISOString(),
      created_by: d.createdBy ? {
        id: d.createdBy.id,
        name: d.createdBy.name,
        email: d.createdBy.email,
      } : null,
      assigned_to: d.assignedTo ? {
        id: d.assignedTo.id,
        name: d.assignedTo.name,
        email: d.assignedTo.email,
      } : null,
      resolved_at: d.resolvedAt?.toISOString() || null,
      resolution_notes: d.resolutionNotes,
    }));

    return NextResponse.json({ disputes: formattedDisputes });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

// POST /api/disputes - Create a new dispute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.partner_id || !body.dispute_type || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: body.partner_id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Check if invoice exists (if provided)
    if (body.invoice_id) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: body.invoice_id },
      });

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
    }

    // Generate dispute number
    const disputeNumber = `DSP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`;

    // Create dispute in database
    const newDispute = await prisma.dispute.create({
      data: {
        disputeNumber,
        partnerId: body.partner_id,
        invoiceId: body.invoice_id || null,
        disputeType: body.dispute_type,
        status: 'OPEN',
        priority: body.priority || 'MEDIUM',
        description: body.description,
        disputedAmount: body.disputed_amount || null,
        createdById: body.created_by || null,
      },
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });

    // Format response
    const response = {
      dispute_id: newDispute.id,
      dispute_number: newDispute.disputeNumber,
      partner_id: newDispute.partnerId,
      partner_name: newDispute.partner.partnerName,
      invoice_id: newDispute.invoiceId,
      invoice_number: newDispute.invoice?.invoiceNumber || null,
      dispute_type: newDispute.disputeType,
      status: newDispute.status,
      priority: newDispute.priority,
      description: newDispute.description,
      disputed_amount: newDispute.disputedAmount ? parseFloat(newDispute.disputedAmount.toString()) : null,
      created_at: newDispute.createdAt.toISOString(),
      created_by: newDispute.createdById,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating dispute:', error);

    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Invalid partner or invoice ID' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}
