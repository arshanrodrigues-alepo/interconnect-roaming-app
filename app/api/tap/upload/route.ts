import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { parseTAPFile, validateFileSize, validateFileFormat } from '@/lib/services/tap-parser';
import { batchMapToCDR } from '@/lib/services/edr-mapper';

// POST /api/tap/upload - Upload and process TAP file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const partnerId = formData.get('partner_id') as string;
    const direction = formData.get('direction') as 'INBOUND' | 'OUTBOUND';
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!partnerId || !direction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // Validate file format
    const formatValidation = validateFileFormat(file.name);
    if (!formatValidation.valid) {
      return NextResponse.json({ error: formatValidation.error }, { status: 400 });
    }

    // Create TAP file record in database
    const tapFile = await prisma.tAPFile.create({
      data: {
        partnerId,
        filename: file.name,
        fileSizeBytes: file.size,
        direction,
        status: 'PARSING',
        uploadTimestamp: new Date(),
      },
    });

    // Process file asynchronously
    processFileAsync(file, tapFile.id, partnerId, direction);

    // Transform response
    const response = {
      file_id: tapFile.id,
      partner_id: tapFile.partnerId,
      filename: tapFile.filename,
      file_size_bytes: Number(tapFile.fileSizeBytes), // Convert BigInt to Number
      direction: tapFile.direction,
      status: tapFile.status,
      upload_timestamp: tapFile.uploadTimestamp.toISOString(),
    };

    return NextResponse.json(response, { status: 202 });
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
    }

    return NextResponse.json(
      { error: `Failed to upload TAP file: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Process TAP file asynchronously
 */
async function processFileAsync(
  file: File,
  tapFileId: string,
  partnerId: string,
  direction: 'INBOUND' | 'OUTBOUND'
) {
  try {
    // Update status to processing
    await prisma.tAPFile.update({
      where: { id: tapFileId },
      data: {
        status: 'PARSING',
      },
    });

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse file
    const parseResult = await parseTAPFile(buffer, file.name);

    if (!parseResult.success || parseResult.records.length === 0) {
      await prisma.tAPFile.update({
        where: { id: tapFileId },
        data: {
          status: 'ERROR',
          errorMessage: parseResult.errors.join('; ') || 'No records found in file',
          processedTimestamp: new Date(),
        },
      });
      return;
    }

    // Map to CDRs - convert INBOUND/OUTBOUND to INCOMING/OUTGOING for mapper
    const mapperDirection = direction === 'INBOUND' ? 'INCOMING' : 'OUTGOING';
    const mappingResult = batchMapToCDR(parseResult.records, partnerId, mapperDirection);

    // Create TAP records in database
    const tapRecordsData = mappingResult.cdrs.map((cdr: any, index: number) => ({
      tapFileId,
      partnerId,
      serviceType: cdr.call_type,
      callDateTime: new Date(cdr.date_of_event),
      msisdn: cdr.calling_number,
      imsi: parseResult.records[index].imsi || null,
      callingNumber: cdr.calling_number,
      calledNumber: cdr.called_number,
      durationSeconds: cdr.duration || null,
      messageCount: cdr.number_of_events || null,
      processingStatus: 'PENDING',
      rawTapData: parseResult.records[index],
    }));

    await prisma.tAPRecord.createMany({
      data: tapRecordsData,
    });

    // Update TAP file with results
    await prisma.tAPFile.update({
      where: { id: tapFileId },
      data: {
        status: 'PARSED',
        processedTimestamp: new Date(),
        recordsCount: mappingResult.successCount,
      },
    });

    // If there are CDRs, send to rating engine
    if (mappingResult.cdrs.length > 0) {
      await rateCDRs(tapFileId, mappingResult.cdrs);
    }
  } catch (error) {
    console.error('Processing error:', error);
    console.error('Processing error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });

    await prisma.tAPFile.update({
      where: { id: tapFileId },
      data: {
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Processing failed',
        processedTimestamp: new Date(),
      },
    });
  }
}

/**
 * Send CDRs to rating engine
 */
async function rateCDRs(tapFileId: string, cdrs: any[]) {
  try {
    const response = await fetch('http://localhost:3000/api/rating-engine/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cdrs }),
    });

    if (!response.ok) {
      throw new Error('Rating failed');
    }

    const result = await response.json();

    // Update TAP records with rated charges
    let totalCharges = 0;
    if (result.cdrs && Array.isArray(result.cdrs)) {
      const tapRecords = await prisma.tAPRecord.findMany({
        where: { tapFileId },
        orderBy: { callDateTime: 'asc' },
      });

      for (let i = 0; i < result.cdrs.length && i < tapRecords.length; i++) {
        const ratedCDR = result.cdrs[i];
        const tapRecord = tapRecords[i];

        await prisma.tAPRecord.update({
          where: { id: tapRecord.id },
          data: {
            chargedAmount: ratedCDR.charge || null,
            currency: ratedCDR.currency || null,
            processingStatus: ratedCDR.processing_status || 'RATED',
          },
        });

        // Sum up total charges
        if (ratedCDR.charge) {
          totalCharges += ratedCDR.charge;
        }
      }
    }

    // Update TAP file with total charges and status
    await prisma.tAPFile.update({
      where: { id: tapFileId },
      data: {
        status: 'RATED',
        totalCharges: totalCharges,
      },
    });
  } catch (error) {
    console.error('Rating error:', error);
  }
}
