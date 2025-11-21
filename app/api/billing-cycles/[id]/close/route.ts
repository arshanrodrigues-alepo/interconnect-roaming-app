import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// POST /api/billing-cycles/:id/close - Close a billing cycle and calculate totals
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {

    // Check if cycle exists
    const cycle = await prisma.billingCycle.findUnique({
      where: { id },
      include: {
        partner: true,
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Billing cycle not found' }, { status: 404 });
    }

    // Check if already closed
    if (cycle.status === 'CLOSED' || cycle.status === 'INVOICED') {
      return NextResponse.json(
        { error: `Billing cycle already ${cycle.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update status to PROCESSING while we calculate
    await prisma.billingCycle.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    // Calculate traffic and financial totals from TAP files and CDRs
    // Note: We use uploadTimestamp since processedTimestamp can be null
    const tapFiles = await prisma.tAPFile.findMany({
      where: {
        partnerId: cycle.partnerId,
        uploadTimestamp: {
          gte: cycle.periodStart,
          lte: cycle.periodEnd,
        },
        status: 'RATED',
      },
      include: {
        records: {
          where: {
            processingStatus: 'RATED',
          },
        },
      },
    });

    let totalVoiceMinutes = 0;
    let totalSmsCount = 0;
    let totalDataMb = 0;
    let totalCharges = 0;

    // Sum up from TAP records
    for (const tapFile of tapFiles) {
      for (const record of tapFile.records) {
        if (record.serviceType === 'VOICE' && record.durationSeconds) {
          totalVoiceMinutes += Math.ceil(record.durationSeconds / 60);
        } else if (record.serviceType === 'SMS' && record.messageCount) {
          totalSmsCount += record.messageCount;
        } else if (record.serviceType === 'DATA' && record.dataVolumeMb) {
          totalDataMb += Number(record.dataVolumeMb);
        }

        if (record.chargedAmount) {
          totalCharges += Number(record.chargedAmount);
        }
      }
    }

    // Calculate margin (assuming 20% cost, 80% margin for now - this should come from rate sheets)
    const totalCost = totalCharges * 0.2;
    const margin = totalCharges - totalCost;

    // Update cycle with calculated totals
    const updatedCycle = await prisma.billingCycle.update({
      where: { id },
      data: {
        status: 'CLOSED',
        totalVoiceMinutes,
        totalSmsCount,
        totalDataMb,
        totalCharges,
        totalCost,
        margin,
        closedAt: new Date(),
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
      id: updatedCycle.id,
      partner_id: updatedCycle.partnerId,
      partner: {
        partner_code: updatedCycle.partner.partnerCode,
        partner_name: updatedCycle.partner.partnerName,
        country_code: updatedCycle.partner.countryCode,
      },
      cycle_number: updatedCycle.cycleNumber,
      period_start: updatedCycle.periodStart.toISOString(),
      period_end: updatedCycle.periodEnd.toISOString(),
      cut_off_date: updatedCycle.cutOffDate.toISOString(),
      due_date: updatedCycle.dueDate.toISOString(),
      status: updatedCycle.status,
      total_voice_minutes: Number(updatedCycle.totalVoiceMinutes),
      total_sms_count: Number(updatedCycle.totalSmsCount),
      total_data_mb: Number(updatedCycle.totalDataMb),
      total_charges: Number(updatedCycle.totalCharges),
      total_cost: Number(updatedCycle.totalCost),
      margin: Number(updatedCycle.margin),
      currency: updatedCycle.currency,
      closed_at: updatedCycle.closedAt?.toISOString(),
      updated_at: updatedCycle.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Failed to close billing cycle:', error);

    // Revert status to OPEN on error
    try {
      await prisma.billingCycle.update({
        where: { id },
        data: { status: 'OPEN' },
      });
    } catch (revertError) {
      console.error('Failed to revert cycle status:', revertError);
    }

    return NextResponse.json(
      { error: `Failed to close billing cycle: ${error.message}` },
      { status: 500 }
    );
  }
}
