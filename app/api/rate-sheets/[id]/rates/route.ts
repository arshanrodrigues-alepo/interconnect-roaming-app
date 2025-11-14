import { NextRequest, NextResponse } from 'next/server';
import { Rate } from '@/lib/types';
import { mockRates } from '@/lib/mock-data';

/**
 * GET /api/rate-sheets/[id]/rates
 * Fetch all rates for a rate sheet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rates = mockRates.filter((r) => r.rate_sheet_id === id);

    return NextResponse.json({
      rates,
    });
  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rate-sheets/[id]/rates
 * Create a new rate for a rate sheet
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const newRate: Rate = {
      rate_id: `R-${Date.now()}`,
      rate_sheet_id: id,
      service_type: body.service_type,
      direction: body.direction,
      called_number_prefix: body.called_number_prefix,
      call_type: body.call_type,
      rate_per_unit: body.rate_per_unit,
      currency: body.currency || 'USD',
      minimum_charge: body.minimum_charge,
      rounding_rule: body.rounding_rule || 'UP',
      tier_start: body.tier_start,
      tier_end: body.tier_end,
    };

    mockRates.push(newRate);

    return NextResponse.json(newRate, { status: 201 });
  } catch (error) {
    console.error('Error creating rate:', error);
    return NextResponse.json(
      { error: 'Failed to create rate' },
      { status: 500 }
    );
  }
}
