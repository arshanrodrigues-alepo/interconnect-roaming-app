import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const carrierId = searchParams.get('carrierId');
    const destinationCode = searchParams.get('destinationCode');
    const window = searchParams.get('window');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {};

    if (carrierId) {
      where.carrierId = carrierId;
    }

    if (destinationCode) {
      where.destinationCode = {
        startsWith: destinationCode
      };
    }

    if (window) {
      where.window = window;
    }

    if (fromDate || toDate) {
      where.windowStart = {};
      if (fromDate) {
        where.windowStart.gte = new Date(fromDate);
      }
      if (toDate) {
        where.windowStart.lte = new Date(toDate);
      }
    }

    const metrics = await prisma.qoSMetric.findMany({
      where,
      include: {
        carrier: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true
          }
        }
      },
      orderBy: {
        windowStart: 'desc'
      },
      take: 500
    });

    // Convert BigInt fields to strings for JSON serialization
    const serializedMetrics = metrics.map(metric => ({
      ...metric,
      totalCalls: metric.totalCalls.toString(),
      successfulCalls: metric.successfulCalls.toString()
    }));

    return NextResponse.json({ metrics: serializedMetrics, count: serializedMetrics.length });

  } catch (error) {
    console.error('Error fetching QoS metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QoS metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      carrierId,
      destinationCode,
      asr,
      acdSeconds,
      ner,
      pddMs,
      totalCalls,
      successfulCalls,
      window,
      windowStart,
      windowEnd
    } = body;

    // Validation
    if (!carrierId || !destinationCode || asr === undefined || !acdSeconds ||
        !window || !windowStart || !windowEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify carrier exists
    const carrier = await prisma.partner.findUnique({
      where: { id: carrierId }
    });

    if (!carrier) {
      return NextResponse.json(
        { error: 'Carrier not found' },
        { status: 404 }
      );
    }

    const metric = await prisma.qoSMetric.create({
      data: {
        carrierId,
        destinationCode,
        asr,
        acdSeconds,
        ner,
        pddMs,
        totalCalls: totalCalls ? BigInt(totalCalls) : BigInt(0),
        successfulCalls: successfulCalls ? BigInt(successfulCalls) : BigInt(0),
        window,
        windowStart: new Date(windowStart),
        windowEnd: new Date(windowEnd)
      },
      include: {
        carrier: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true
          }
        }
      }
    });

    // Serialize BigInt fields
    const serializedMetric = {
      ...metric,
      totalCalls: metric.totalCalls.toString(),
      successfulCalls: metric.successfulCalls.toString()
    };

    return NextResponse.json({ metric: serializedMetric }, { status: 201 });

  } catch (error) {
    console.error('Error creating QoS metric:', error);
    return NextResponse.json(
      { error: 'Failed to create QoS metric' },
      { status: 500 }
    );
  }
}
