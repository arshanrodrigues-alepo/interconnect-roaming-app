import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// POST /api/billing-cycles/:id/reset - Reset a stuck billing cycle back to OPEN
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get the billing cycle
    const cycle = await prisma.billingCycle.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            partnerCode: true,
            partnerName: true,
          }
        }
      }
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Billing cycle not found' }, { status: 404 });
    }

    // Only allow resetting if stuck in PROCESSING
    if (cycle.status !== 'PROCESSING') {
      return NextResponse.json(
        {
          error: `Cannot reset billing cycle with status ${cycle.status}. Only PROCESSING cycles can be reset.`,
          current_status: cycle.status
        },
        { status: 400 }
      );
    }

    // Reset to OPEN
    const updatedCycle = await prisma.billingCycle.update({
      where: { id },
      data: {
        status: 'OPEN',
        // Clear any calculated values
        totalVoiceMinutes: null,
        totalSmsCount: null,
        totalDataMb: null,
        totalCharges: null,
        totalCost: null,
        margin: null,
        closedAt: null,
      },
    });

    return NextResponse.json({
      message: 'Billing cycle reset successfully',
      billing_cycle: {
        id: updatedCycle.id,
        cycle_number: updatedCycle.cycleNumber,
        partner: cycle.partner.partnerName,
        status: updatedCycle.status,
        period_start: updatedCycle.periodStart,
        period_end: updatedCycle.periodEnd,
      }
    });

  } catch (error: any) {
    console.error('Failed to reset billing cycle:', error);
    return NextResponse.json(
      { error: `Failed to reset billing cycle: ${error.message}` },
      { status: 500 }
    );
  }
}
