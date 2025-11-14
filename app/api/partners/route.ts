import { NextRequest, NextResponse } from 'next/server';
import { PartnerStatus, PartnerType } from '@/lib/types';
import prisma from '@/lib/db/prisma';

// GET /api/partners - Get all partners with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as PartnerStatus | null;
    const partnerType = searchParams.get('partner_type') as PartnerType | null;
    const countryCode = searchParams.get('country_code');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Build where clause for filters
    const where: any = {};
    if (status) where.status = status;
    if (partnerType) where.partnerType = partnerType;
    if (countryCode) where.countryCode = countryCode;

    // Get total count for pagination
    const totalRecords = await prisma.partner.count({ where });
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch partners with pagination
    const partners = await prisma.partner.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match API response format
    const formattedPartners = partners.map((p) => ({
      partner_id: p.id,
      partner_code: p.partnerCode,
      partner_name: p.partnerName,
      partner_type: p.partnerType,
      country_code: p.countryCode,
      status: p.status,
      contact_email: p.contactEmail,
      contact_phone: p.contactPhone,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      partners: formattedPartners,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_records: totalRecords,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST /api/partners - Create a new partner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.partner_code || !body.partner_name || !body.partner_type || !body.country_code || !body.contact_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create partner in database
    const newPartner = await prisma.partner.create({
      data: {
        partnerCode: body.partner_code,
        partnerName: body.partner_name,
        partnerType: body.partner_type,
        countryCode: body.country_code,
        status: 'PENDING',
        contactEmail: body.contact_email,
        contactPhone: body.contact_phone || null,
      },
    });

    // Transform to match API response format
    const response = {
      partner_id: newPartner.id,
      partner_code: newPartner.partnerCode,
      partner_name: newPartner.partnerName,
      partner_type: newPartner.partnerType,
      country_code: newPartner.countryCode,
      status: newPartner.status,
      contact_email: newPartner.contactEmail,
      contact_phone: newPartner.contactPhone,
      created_at: newPartner.createdAt.toISOString(),
      updated_at: newPartner.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating partner:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Partner code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
