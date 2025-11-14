import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/tap - List TAP files with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const direction = searchParams.get('direction');
    const partnerId = searchParams.get('partner_id');

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (direction) where.direction = direction;
    if (partnerId) where.partnerId = partnerId;

    // Fetch TAP files with partner details
    const tapFiles = await prisma.tAPFile.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
          },
        },
      },
      orderBy: { uploadTimestamp: 'desc' },
    });

    // Transform to match API response format
    const formattedFiles = tapFiles.map((f) => ({
      tap_file_id: f.id,
      partner_id: f.partnerId,
      partner_name: f.partner.partnerName,
      partner_code: f.partner.partnerCode,
      filename: f.filename,
      file_size_bytes: Number(f.fileSizeBytes), // Convert BigInt to Number
      direction: f.direction,
      status: f.status,
      upload_timestamp: f.uploadTimestamp.toISOString(),
      processed_timestamp: f.processedTimestamp?.toISOString() || null,
      records_count: f.recordsCount,
      total_charges: f.totalCharges ? Number(f.totalCharges) : null,
      error_message: f.errorMessage,
    }));

    return NextResponse.json({
      files: formattedFiles,
      total: formattedFiles.length,
    });
  } catch (error) {
    console.error('Error fetching TAP files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TAP files' },
      { status: 500 }
    );
  }
}
