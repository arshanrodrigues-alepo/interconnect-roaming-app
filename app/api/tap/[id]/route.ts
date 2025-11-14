import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/tap/[id] - Get TAP file details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tapFile = await prisma.tAPFile.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            id: true,
            partnerCode: true,
            partnerName: true,
          },
        },
      },
    });

    if (!tapFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Transform to match API response format
    const formattedFile = {
      tap_file_id: tapFile.id,
      partner_id: tapFile.partnerId,
      partner_name: tapFile.partner.partnerName,
      partner_code: tapFile.partner.partnerCode,
      filename: tapFile.filename,
      file_size_bytes: Number(tapFile.fileSizeBytes),
      direction: tapFile.direction,
      status: tapFile.status,
      upload_timestamp: tapFile.uploadTimestamp.toISOString(),
      processed_timestamp: tapFile.processedTimestamp?.toISOString() || null,
      records_count: tapFile.recordsCount,
      total_charges: tapFile.totalCharges ? Number(tapFile.totalCharges) : null,
      error_message: tapFile.errorMessage,
    };

    return NextResponse.json({ file: formattedFile });
  } catch (error) {
    console.error('Error fetching TAP file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TAP file' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tap/[id] - Delete TAP file and its records
 */
export async function DELETE(
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

    // Delete TAP file (records will be cascade deleted due to onDelete: Cascade in schema)
    await prisma.tAPFile.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'TAP file deleted successfully',
      deleted_id: id,
    });
  } catch (error) {
    console.error('Error deleting TAP file:', error);
    return NextResponse.json(
      { error: 'Failed to delete TAP file' },
      { status: 500 }
    );
  }
}
