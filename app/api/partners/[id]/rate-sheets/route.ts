import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/partners/[id]/rate-sheets
 * Fetch all rate sheets for a partner with their rates
 */
export async function GET(
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

    // Fetch rate sheets with their rates
    const rateSheets = await prisma.rateSheet.findMany({
      where: { partnerId: id },
      include: {
        rates: {
          orderBy: [
            { serviceType: 'asc' },
            { direction: 'asc' },
          ],
        },
      },
      orderBy: { effectiveDate: 'desc' },
    });

    // Transform to match API response format
    const formattedRateSheets = rateSheets.map((rs) => ({
      rate_sheet_id: rs.id,
      partner_id: rs.partnerId,
      rate_sheet_name: rs.rateSheetName,
      effective_date: rs.effectiveDate.toISOString().split('T')[0],
      expiry_date: rs.expiryDate ? rs.expiryDate.toISOString().split('T')[0] : null,
      is_active: rs.isActive,
      created_at: rs.createdAt.toISOString(),
      updated_at: rs.updatedAt.toISOString(),
      rates: rs.rates.map((r) => ({
        rate_id: r.id,
        rate_sheet_id: r.rateSheetId,
        service_type: r.serviceType,
        direction: r.direction,
        called_number_prefix: r.calledNumberPrefix,
        call_type: r.callType,
        rate_per_unit: parseFloat(r.ratePerUnit.toString()),
        currency: r.currency,
        minimum_charge: r.minimumCharge ? parseFloat(r.minimumCharge.toString()) : null,
        rounding_rule: r.roundingRule,
        tier_start: r.tierStart,
        tier_end: r.tierEnd,
      })),
    }));

    return NextResponse.json({
      rate_sheets: formattedRateSheets,
    });
  } catch (error) {
    console.error('Error fetching rate sheets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate sheets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partners/[id]/rate-sheets
 * Create a new rate sheet for a partner
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.rate_sheet_name || !body.effective_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if partner exists
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Create rate sheet (with optional rates)
    const newRateSheet = await prisma.rateSheet.create({
      data: {
        partnerId: id,
        rateSheetName: body.rate_sheet_name,
        effectiveDate: new Date(body.effective_date),
        expiryDate: body.expiry_date ? new Date(body.expiry_date) : null,
        isActive: body.is_active ?? true,
        rates: body.rates ? {
          create: body.rates.map((r: any) => ({
            serviceType: r.service_type,
            direction: r.direction,
            calledNumberPrefix: r.called_number_prefix || null,
            callType: r.call_type || null,
            ratePerUnit: r.rate_per_unit,
            currency: r.currency,
            minimumCharge: r.minimum_charge || null,
            roundingRule: r.rounding_rule,
            tierStart: r.tier_start || null,
            tierEnd: r.tier_end || null,
          })),
        } : undefined,
      },
      include: {
        rates: true,
      },
    });

    // Transform response
    const response = {
      rate_sheet_id: newRateSheet.id,
      partner_id: newRateSheet.partnerId,
      rate_sheet_name: newRateSheet.rateSheetName,
      effective_date: newRateSheet.effectiveDate.toISOString().split('T')[0],
      expiry_date: newRateSheet.expiryDate ? newRateSheet.expiryDate.toISOString().split('T')[0] : null,
      is_active: newRateSheet.isActive,
      created_at: newRateSheet.createdAt.toISOString(),
      updated_at: newRateSheet.updatedAt.toISOString(),
      rates: newRateSheet.rates.map((r) => ({
        rate_id: r.id,
        service_type: r.serviceType,
        direction: r.direction,
        rate_per_unit: parseFloat(r.ratePerUnit.toString()),
        currency: r.currency,
      })),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating rate sheet:', error);

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create rate sheet' },
      { status: 500 }
    );
  }
}
