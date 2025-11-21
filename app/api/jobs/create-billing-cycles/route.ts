import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * POST /api/jobs/create-billing-cycles
 *
 * Automatically creates billing cycles for all active partners
 * for the current month if they don't already exist.
 *
 * This endpoint should be called by a cron job at the start of each month.
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthOffset = parseInt(searchParams.get('month_offset') || '0');

    // Calculate the period dates
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

    const periodStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const periodEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    const cutOffDate = new Date(periodEnd);
    cutOffDate.setDate(periodEnd.getDate() + 5); // 5 days after period end
    const dueDate = new Date(periodEnd);
    dueDate.setDate(periodEnd.getDate() + 30); // 30 days after period end

    console.log('Creating billing cycles for period:', {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
    });

    // Get all active partners
    const activePartners = await prisma.partner.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        agreements: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            currency: true,
            billingCycle: true,
          },
        },
      },
    });

    console.log(`Found ${activePartners.length} active partners`);

    const createdCycles = [];
    const skippedPartners = [];
    const errors = [];

    for (const partner of activePartners) {
      try {
        // Check if partner has active agreement
        if (partner.agreements.length === 0) {
          skippedPartners.push({
            partner_id: partner.id,
            partner_name: partner.partnerName,
            reason: 'No active agreement',
          });
          continue;
        }

        // Check if cycle already exists for this period
        const existingCycle = await prisma.billingCycle.findFirst({
          where: {
            partnerId: partner.id,
            periodStart: periodStart,
            periodEnd: periodEnd,
          },
        });

        if (existingCycle) {
          skippedPartners.push({
            partner_id: partner.id,
            partner_name: partner.partnerName,
            reason: 'Cycle already exists',
          });
          continue;
        }

        // Get the latest cycle number for this partner
        const latestCycle = await prisma.billingCycle.findFirst({
          where: { partnerId: partner.id },
          orderBy: { cycleNumber: 'desc' },
          select: { cycleNumber: true },
        });

        const cycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;

        // Get currency from agreement
        const agreement = partner.agreements[0];
        const currency = agreement.currency || 'USD';

        // Create billing cycle
        const cycle = await prisma.billingCycle.create({
          data: {
            partnerId: partner.id,
            cycleNumber,
            periodStart,
            periodEnd,
            cutOffDate,
            dueDate,
            currency,
            status: 'OPEN',
          },
        });

        createdCycles.push({
          cycle_id: cycle.id,
          partner_id: partner.id,
          partner_name: partner.partnerName,
          cycle_number: cycleNumber,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
        });

        console.log(`✅ Created cycle #${cycleNumber} for ${partner.partnerName}`);
      } catch (error) {
        console.error(`Error creating cycle for ${partner.partnerName}:`, error);
        errors.push({
          partner_id: partner.id,
          partner_name: partner.partnerName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const summary = {
      period: {
        start: periodStart.toISOString().split('T')[0],
        end: periodEnd.toISOString().split('T')[0],
      },
      total_partners: activePartners.length,
      cycles_created: createdCycles.length,
      partners_skipped: skippedPartners.length,
      errors: errors.length,
    };

    console.log('Billing cycle creation summary:', summary);

    return NextResponse.json({
      success: true,
      summary,
      created_cycles: createdCycles,
      skipped_partners: skippedPartners,
      errors,
    });
  } catch (error: any) {
    console.error('Billing cycle creation job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Billing cycle creation failed: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs/create-billing-cycles
 *
 * Preview what cycles would be created without actually creating them
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthOffset = parseInt(searchParams.get('month_offset') || '0');

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

    const periodStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const periodEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    // Get all active partners
    const activePartners = await prisma.partner.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        agreements: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    const preview = [];

    for (const partner of activePartners) {
      // Check if cycle already exists
      const existingCycle = await prisma.billingCycle.findFirst({
        where: {
          partnerId: partner.id,
          periodStart: periodStart,
          periodEnd: periodEnd,
        },
      });

      const latestCycle = await prisma.billingCycle.findFirst({
        where: { partnerId: partner.id },
        orderBy: { cycleNumber: 'desc' },
        select: { cycleNumber: true },
      });

      const nextCycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;

      preview.push({
        partner_id: partner.id,
        partner_name: partner.partnerName,
        partner_code: partner.partnerCode,
        has_active_agreement: partner.agreements.length > 0,
        cycle_exists: !!existingCycle,
        next_cycle_number: nextCycleNumber,
        would_create: !existingCycle && partner.agreements.length > 0,
      });
    }

    return NextResponse.json({
      period: {
        start: periodStart.toISOString().split('T')[0],
        end: periodEnd.toISOString().split('T')[0],
      },
      total_partners: activePartners.length,
      will_create: preview.filter((p) => p.would_create).length,
      preview,
    });
  } catch (error: any) {
    console.error('Preview failed:', error);
    return NextResponse.json(
      { error: `Preview failed: ${error.message}` },
      { status: 500 }
    );
  }
}
