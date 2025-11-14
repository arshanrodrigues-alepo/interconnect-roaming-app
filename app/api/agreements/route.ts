import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/agreements - Get all agreements with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get('partner_id');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (partnerId) where.partnerId = partnerId;
    if (status) where.status = status;

    // Fetch agreements with partner details
    const agreements = await prisma.agreement.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match API response format
    const formattedAgreements = agreements.map((a) => ({
      agreement_id: a.id,
      partner_id: a.partnerId,
      partner_name: a.partner.partnerName,
      agreement_name: a.agreementName,
      agreement_type: a.agreementType,
      start_date: a.startDate.toISOString().split('T')[0],
      end_date: a.endDate ? a.endDate.toISOString().split('T')[0] : null,
      status: a.status,
      policy_status: a.policyStatus,
      document_template: a.documentTemplate,
      contract_file_url: a.contractFileUrl,
      raex_form_url: a.raexFormUrl,
      currency: a.currency,
      billing_cycle: a.billingCycle,
      created_at: a.createdAt.toISOString(),
      updated_at: a.updatedAt.toISOString(),
    }));

    return NextResponse.json({ agreements: formattedAgreements });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agreements' },
      { status: 500 }
    );
  }
}

// POST /api/agreements - Create a new agreement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.partner_id || !body.agreement_type || !body.start_date || !body.currency || !body.billing_cycle) {
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
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Create agreement
    const newAgreement = await prisma.agreement.create({
      data: {
        partnerId: body.partner_id,
        agreementName: body.agreement_name || `${partner.partnerName} Agreement`,
        agreementType: body.agreement_type,
        startDate: new Date(body.start_date),
        endDate: body.end_date ? new Date(body.end_date) : null,
        status: 'DRAFT',
        policyStatus: 'DRAFT',
        currency: body.currency,
        billingCycle: body.billing_cycle,
        documentTemplate: body.document_template || null,
        contractFileUrl: body.contract_file_url || null,
      },
      include: {
        partner: {
          select: {
            partnerName: true,
          },
        },
      },
    });

    // Transform response
    const response = {
      agreement_id: newAgreement.id,
      partner_id: newAgreement.partnerId,
      partner_name: newAgreement.partner.partnerName,
      agreement_name: newAgreement.agreementName,
      agreement_type: newAgreement.agreementType,
      start_date: newAgreement.startDate.toISOString().split('T')[0],
      end_date: newAgreement.endDate ? newAgreement.endDate.toISOString().split('T')[0] : null,
      status: newAgreement.status,
      policy_status: newAgreement.policyStatus,
      currency: newAgreement.currency,
      billing_cycle: newAgreement.billingCycle,
      created_at: newAgreement.createdAt.toISOString(),
      updated_at: newAgreement.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating agreement:', error);

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create agreement' },
      { status: 500 }
    );
  }
}
