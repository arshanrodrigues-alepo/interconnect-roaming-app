import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/tap/[id]/records - Get all records for a TAP file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if TAP file exists
    const tapFile = await prisma.tAPFile.findUnique({
      where: { id },
    });

    if (!tapFile) {
      return NextResponse.json({ error: 'TAP file not found' }, { status: 404 });
    }

    // Fetch TAP records for this file
    const tapRecords = await prisma.tAPRecord.findMany({
      where: { tapFileId: id },
      orderBy: { callDateTime: 'desc' },
    });

    // Transform to match API response format
    const formattedRecords = tapRecords.map((r) => ({
      record_id: r.id,
      tap_file_id: r.tapFileId,
      partner_id: r.partnerId,
      service_type: r.serviceType,
      call_date_time: r.callDateTime.toISOString(),
      msisdn: r.msisdn,
      imsi: r.imsi,
      duration_seconds: r.durationSeconds,
      data_volume_mb: r.dataVolumeMb ? parseFloat(r.dataVolumeMb.toString()) : null,
      message_count: r.messageCount,
      charged_amount: r.chargedAmount ? parseFloat(r.chargedAmount.toString()) : null,
      currency: r.currency,
      processing_status: r.processingStatus,
      error_message: r.errorMessage,
      raw_tap_data: r.rawTapData,
    }));

    return NextResponse.json({
      records: formattedRecords,
      total: formattedRecords.length,
    });
  } catch (error) {
    console.error('Error fetching TAP records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TAP records' },
      { status: 500 }
    );
  }
}
