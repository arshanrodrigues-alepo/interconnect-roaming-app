import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/partners/:id - Get partner by ID with agreement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch partner with related agreement
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        agreements: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Transform to match API response format
    const response = {
      partner: {
        partner_id: partner.id,
        partner_code: partner.partnerCode,
        partner_name: partner.partnerName,
        partner_type: partner.partnerType,
        country_code: partner.countryCode,
        status: partner.status,
        contact_email: partner.contactEmail,
        contact_phone: partner.contactPhone,
        created_at: partner.createdAt.toISOString(),
        updated_at: partner.updatedAt.toISOString(),
      },
      agreement: partner.agreements[0]
        ? {
            agreement_id: partner.agreements[0].id,
            partner_id: partner.agreements[0].partnerId,
            agreement_name: partner.agreements[0].agreementName,
            agreement_type: partner.agreements[0].agreementType,
            start_date: partner.agreements[0].startDate.toISOString(),
            end_date: partner.agreements[0].endDate?.toISOString() || null,
            status: partner.agreements[0].status,
            policy_status: partner.agreements[0].policyStatus,
            currency: partner.agreements[0].currency,
            billing_cycle: partner.agreements[0].billingCycle,
            created_at: partner.agreements[0].createdAt.toISOString(),
            updated_at: partner.agreements[0].updatedAt.toISOString(),
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

// PATCH /api/partners/:id - Update partner
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({ where: { id } });
    if (!existingPartner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    if (body.partner_name) updateData.partnerName = body.partner_name;
    if (body.partner_type) updateData.partnerType = body.partner_type;
    if (body.country_code) updateData.countryCode = body.country_code;
    if (body.status) updateData.status = body.status;
    if (body.contact_email) updateData.contactEmail = body.contact_email;
    if (body.contact_phone !== undefined) updateData.contactPhone = body.contact_phone;

    // Update partner
    const updatedPartner = await prisma.partner.update({
      where: { id },
      data: updateData,
    });

    // Transform to match API response format
    const response = {
      partner_id: updatedPartner.id,
      partner_code: updatedPartner.partnerCode,
      partner_name: updatedPartner.partnerName,
      partner_type: updatedPartner.partnerType,
      country_code: updatedPartner.countryCode,
      status: updatedPartner.status,
      contact_email: updatedPartner.contactEmail,
      contact_phone: updatedPartner.contactPhone,
      created_at: updatedPartner.createdAt.toISOString(),
      updated_at: updatedPartner.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/:id - Delete partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if partner exists
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Delete partner (cascade will handle related records)
    await prisma.partner.delete({ where: { id } });

    return NextResponse.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
