import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    const reconciliationType = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (reconciliationType) {
      where.reconciliationType = reconciliationType;
    }

    if (status) {
      where.status = status;
    }

    const batches = await prisma.reconciliationBatch.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true
          }
        },
        results: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Serialize BigInt fields in results
    const serializedBatches = batches.map(batch => ({
      ...batch,
      results: batch.results.map(result => ({
        ...result,
        expectedCount: result.expectedCount.toString(),
        receivedCount: result.receivedCount.toString(),
        matchedCount: result.matchedCount.toString(),
        mismatchedCount: result.mismatchedCount.toString(),
        missingRecords: result.missingRecords.toString()
      }))
    }));

    return NextResponse.json({ batches: serializedBatches, count: serializedBatches.length });

  } catch (error) {
    console.error('Error fetching reconciliation batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reconciliation batches' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      partnerId,
      reconciliationType,
      periodStart,
      periodEnd
    } = body;

    // Validation
    if (!partnerId || !reconciliationType || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: partnerId, reconciliationType, periodStart, periodEnd' },
        { status: 400 }
      );
    }

    // Verify partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId }
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Create reconciliation batch
    const batch = await prisma.reconciliationBatch.create({
      data: {
        partnerId,
        reconciliationType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'PENDING'
      },
      include: {
        partner: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true
          }
        }
      }
    });

    return NextResponse.json({ batch }, { status: 201 });

  } catch (error) {
    console.error('Error creating reconciliation batch:', error);
    return NextResponse.json(
      { error: 'Failed to create reconciliation batch' },
      { status: 500 }
    );
  }
}
