import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/billing-cycles/:id/diagnose - Diagnose issues with a billing cycle
export async function GET(
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
            id: true,
            partnerCode: true,
            partnerName: true,
          }
        }
      }
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Billing cycle not found' }, { status: 404 });
    }

    // Find TAP files for this partner in the billing period
    // Note: We use uploadTimestamp since processedTimestamp can be null
    const tapFiles = await prisma.tAPFile.findMany({
      where: {
        partnerId: cycle.partnerId,
        uploadTimestamp: {
          gte: cycle.periodStart,
          lte: cycle.periodEnd,
        },
      },
      select: {
        id: true,
        filename: true,
        status: true,
        recordsCount: true,
        totalCharges: true,
        uploadTimestamp: true,
        processedTimestamp: true,
      },
      orderBy: {
        uploadTimestamp: 'desc'
      }
    });

    // Get TAP records breakdown
    const tapRecords = await prisma.tAPRecord.findMany({
      where: {
        partnerId: cycle.partnerId,
        callDateTime: {
          gte: cycle.periodStart,
          lte: cycle.periodEnd,
        },
      },
      select: {
        processingStatus: true,
        serviceType: true,
        chargedAmount: true,
        durationSeconds: true,
        messageCount: true,
        dataVolumeMb: true,
      }
    });

    // Calculate statistics
    const recordsByStatus = tapRecords.reduce((acc: any, record) => {
      acc[record.processingStatus] = (acc[record.processingStatus] || 0) + 1;
      return acc;
    }, {});

    const recordsByService = tapRecords.reduce((acc: any, record) => {
      acc[record.serviceType] = (acc[record.serviceType] || 0) + 1;
      return acc;
    }, {});

    const ratedRecords = tapRecords.filter(r => r.processingStatus === 'RATED');
    const totalCharges = ratedRecords.reduce((sum, r) => sum + (Number(r.chargedAmount) || 0), 0);

    // Check for issues
    const issues = [];

    if (tapFiles.length === 0) {
      issues.push('No TAP files found in this billing period');
    }

    if (tapFiles.some(f => f.status === 'ERROR')) {
      issues.push(`${tapFiles.filter(f => f.status === 'ERROR').length} TAP file(s) have errors`);
    }

    if (tapFiles.some(f => f.status === 'PARSING' || f.status === 'UPLOADED')) {
      issues.push(`${tapFiles.filter(f => ['PARSING', 'UPLOADED'].includes(f.status)).length} TAP file(s) still processing`);
    }

    if (ratedRecords.length === 0 && tapRecords.length > 0) {
      issues.push('No records have been rated yet');
    }

    if (cycle.status === 'PROCESSING') {
      issues.push('Billing cycle is stuck in PROCESSING status - use /reset endpoint to fix');
    }

    return NextResponse.json({
      billing_cycle: {
        id: cycle.id,
        cycle_number: cycle.cycleNumber,
        partner: cycle.partner.partnerName,
        partner_code: cycle.partner.partnerCode,
        status: cycle.status,
        period_start: cycle.periodStart.toISOString().split('T')[0],
        period_end: cycle.periodEnd.toISOString().split('T')[0],
        current_totals: {
          total_charges: Number(cycle.totalCharges) || 0,
          total_voice_minutes: Number(cycle.totalVoiceMinutes) || 0,
          total_sms_count: Number(cycle.totalSmsCount) || 0,
          total_data_mb: Number(cycle.totalDataMb) || 0,
        }
      },
      tap_files: {
        count: tapFiles.length,
        by_status: tapFiles.reduce((acc: any, file) => {
          acc[file.status] = (acc[file.status] || 0) + 1;
          return acc;
        }, {}),
        files: tapFiles.map(f => ({
          id: f.id,
          filename: f.filename,
          status: f.status,
          records: f.recordsCount,
          charges: Number(f.totalCharges) || 0,
          uploaded: f.uploadTimestamp.toISOString(),
          processed: f.processedTimestamp?.toISOString() || null,
        }))
      },
      tap_records: {
        total_count: tapRecords.length,
        by_status: recordsByStatus,
        by_service: recordsByService,
        rated_count: ratedRecords.length,
        calculated_charges: totalCharges.toFixed(2),
      },
      issues: issues.length > 0 ? issues : ['No issues found'],
      recommendations: issues.length > 0 ? [
        cycle.status === 'PROCESSING' ? 'Call POST /api/billing-cycles/' + id + '/reset to reset the cycle' : null,
        tapFiles.some(f => f.status === 'ERROR') ? 'Check TAP file errors and re-upload if needed' : null,
        ratedRecords.length === 0 ? 'Wait for TAP files to be rated before closing the cycle' : null,
      ].filter(Boolean) : ['You can close this billing cycle']
    });

  } catch (error: any) {
    console.error('Failed to diagnose billing cycle:', error);
    return NextResponse.json(
      { error: `Failed to diagnose billing cycle: ${error.message}` },
      { status: 500 }
    );
  }
}
