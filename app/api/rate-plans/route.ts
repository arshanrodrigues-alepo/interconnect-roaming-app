import { NextRequest, NextResponse } from 'next/server';
import { mockRatePlans, mockServices } from '@/lib/mock-data';
import { RatePlan } from '@/lib/types';
import { generateId } from '@/lib/utils/helpers';

// GET /api/rate-plans - Get rate plans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agreementId = searchParams.get('agreement_id');

    let filteredRatePlans = [...mockRatePlans];

    if (agreementId) {
      filteredRatePlans = filteredRatePlans.filter((r) => r.agreement_id === agreementId);
    }

    // Enrich with service info
    const enrichedRatePlans = filteredRatePlans.map((rp) => {
      const service = mockServices.find((s) => s.service_id === rp.service_id);
      return {
        ...rp,
        service_type: service?.service_type,
      };
    });

    return NextResponse.json({ rate_plans: enrichedRatePlans });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rate plans' },
      { status: 500 }
    );
  }
}

// POST /api/rate-plans - Create a new rate plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newRatePlan: RatePlan = {
      rate_plan_id: generateId(),
      agreement_id: body.agreement_id,
      service_id: body.service_id,
      service_type: body.service_type,
      direction: body.direction,
      rate_per_unit: body.rate_per_unit,
      currency: body.currency,
      effective_from: body.effective_from,
      effective_to: body.effective_to,
      rounding_rule: body.rounding_rule,
      minimum_charge: body.minimum_charge,
    };

    mockRatePlans.push(newRatePlan);

    return NextResponse.json(newRatePlan, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create rate plan' },
      { status: 500 }
    );
  }
}
