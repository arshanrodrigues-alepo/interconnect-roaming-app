import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/billing-cycles - List billing cycles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (status) {
      where.status = status;
    }

    const [cycles, total] = await Promise.all([
      prisma.billingCycle.findMany({
        where,
        include: {
          partner: {
            select: {
              id: true,
              partnerCode: true,
              partnerName: true,
              countryCode: true,
            },
          },
        },
        orderBy: [
          { periodStart: 'desc' },
          { cycleNumber: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.billingCycle.count({ where }),
    ]);

    // Transform to snake_case for API response
    const transformedCycles = cycles.map((cycle) => ({
      id: cycle.id,
      partner_id: cycle.partnerId,
      partner: {
        partner_code: cycle.partner.partnerCode,
        partner_name: cycle.partner.partnerName,
        country_code: cycle.partner.countryCode,
      },
      cycle_number: cycle.cycleNumber,
      period_start: cycle.periodStart.toISOString(),
      period_end: cycle.periodEnd.toISOString(),
      cut_off_date: cycle.cutOffDate.toISOString(),
      due_date: cycle.dueDate.toISOString(),
      status: cycle.status,
      total_voice_minutes: cycle.totalVoiceMinutes ? Number(cycle.totalVoiceMinutes) : null,
      total_sms_count: cycle.totalSmsCount ? Number(cycle.totalSmsCount) : null,
      total_data_mb: cycle.totalDataMb ? Number(cycle.totalDataMb) : null,
      total_charges: cycle.totalCharges ? Number(cycle.totalCharges) : null,
      total_cost: cycle.totalCost ? Number(cycle.totalCost) : null,
      margin: cycle.margin ? Number(cycle.margin) : null,
      currency: cycle.currency,
      invoice_id: cycle.invoiceId,
      closed_at: cycle.closedAt?.toISOString() || null,
      created_at: cycle.createdAt.toISOString(),
      updated_at: cycle.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      cycles: transformedCycles,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch billing cycles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing cycles' },
      { status: 500 }
    );
  }
}

// POST /api/billing-cycles - Create a new billing cycle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      partner_id,
      period_start,
      period_end,
      cut_off_date,
      due_date,
      currency = 'USD',
    } = body;

    // Validate required fields
    if (!partner_id || !period_start || !period_end) {
      return NextResponse.json(
        { error: 'Missing required fields: partner_id, period_start, period_end' },
        { status: 400 }
      );
    }

    // Check if partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: partner_id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get the latest cycle number for this partner
    const latestCycle = await prisma.billingCycle.findFirst({
      where: { partnerId: partner_id },
      orderBy: { cycleNumber: 'desc' },
      select: { cycleNumber: true },
    });

    const cycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;

    // Calculate cut-off and due dates if not provided
    const periodEndDate = new Date(period_end);
    const cutOffDateFinal = cut_off_date
      ? new Date(cut_off_date)
      : new Date(periodEndDate.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days after period end

    const dueDateFinal = due_date
      ? new Date(due_date)
      : new Date(periodEndDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after period end

    // Create billing cycle
    const cycle = await prisma.billingCycle.create({
      data: {
        partnerId: partner_id,
        cycleNumber,
        periodStart: new Date(period_start),
        periodEnd: periodEndDate,
        cutOffDate: cutOffDateFinal,
        dueDate: dueDateFinal,
        currency,
        status: 'OPEN',
      },
      include: {
        partner: {
          select: {
            partnerCode: true,
            partnerName: true,
            countryCode: true,
          },
        },
      },
    });

    // Transform response
    const response = {
      id: cycle.id,
      partner_id: cycle.partnerId,
      partner: {
        partner_code: cycle.partner.partnerCode,
        partner_name: cycle.partner.partnerName,
        country_code: cycle.partner.countryCode,
      },
      cycle_number: cycle.cycleNumber,
      period_start: cycle.periodStart.toISOString(),
      period_end: cycle.periodEnd.toISOString(),
      cut_off_date: cycle.cutOffDate.toISOString(),
      due_date: cycle.dueDate.toISOString(),
      status: cycle.status,
      currency: cycle.currency,
      created_at: cycle.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create billing cycle:', error);
    return NextResponse.json(
      { error: `Failed to create billing cycle: ${error.message}` },
      { status: 500 }
    );
  }
}
