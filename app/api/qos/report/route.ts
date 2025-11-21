import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const carrierId = searchParams.get('carrierId');

    if (!carrierId) {
      return NextResponse.json(
        { error: 'Carrier ID is required' },
        { status: 400 }
      );
    }

    // Get carrier details
    const carrier = await prisma.partner.findUnique({
      where: { id: carrierId },
      select: {
        id: true,
        partnerName: true,
        partnerCode: true,
        status: true
      }
    });

    if (!carrier) {
      return NextResponse.json(
        { error: 'Carrier not found' },
        { status: 404 }
      );
    }

    // Get latest metrics by destination
    const latestMetrics = await prisma.qoSMetric.findMany({
      where: {
        carrierId
      },
      orderBy: {
        windowStart: 'desc'
      },
      take: 100
    });

    // Group by destination code and calculate averages
    const destinationMetrics: Record<string, any> = {};

    latestMetrics.forEach(metric => {
      const code = metric.destinationCode;
      if (!destinationMetrics[code]) {
        destinationMetrics[code] = {
          destinationCode: code,
          metrics: [],
          avgAsr: 0,
          avgAcd: 0,
          avgNer: 0,
          avgPdd: 0,
          totalCalls: BigInt(0)
        };
      }
      destinationMetrics[code].metrics.push(metric);
    });

    // Calculate averages for each destination
    Object.keys(destinationMetrics).forEach(code => {
      const dest = destinationMetrics[code];
      const metrics = dest.metrics;
      const count = metrics.length;

      dest.avgAsr = metrics.reduce((sum: number, m: any) => sum + Number(m.asr), 0) / count;
      dest.avgAcd = metrics.reduce((sum: number, m: any) => sum + Number(m.acdSeconds), 0) / count;

      const nerMetrics = metrics.filter((m: any) => m.ner !== null);
      if (nerMetrics.length > 0) {
        dest.avgNer = nerMetrics.reduce((sum: number, m: any) => sum + Number(m.ner), 0) / nerMetrics.length;
      }

      const pddMetrics = metrics.filter((m: any) => m.pddMs !== null);
      if (pddMetrics.length > 0) {
        dest.avgPdd = pddMetrics.reduce((sum: number, m: any) => sum + Number(m.pddMs), 0) / pddMetrics.length;
      }

      dest.totalCalls = metrics.reduce((sum: bigint, m: any) => sum + m.totalCalls, BigInt(0));

      // Round averages
      dest.avgAsr = parseFloat(dest.avgAsr.toFixed(2));
      dest.avgAcd = parseFloat(dest.avgAcd.toFixed(2));
      dest.avgNer = parseFloat(dest.avgNer.toFixed(2));
      dest.avgPdd = parseFloat(dest.avgPdd.toFixed(2));
      dest.totalCalls = dest.totalCalls.toString();

      // Remove raw metrics array
      delete dest.metrics;
    });

    // Calculate overall carrier performance
    const overallAsr = latestMetrics.length > 0
      ? latestMetrics.reduce((sum, m) => sum + Number(m.asr), 0) / latestMetrics.length
      : 0;

    const overallAcd = latestMetrics.length > 0
      ? latestMetrics.reduce((sum, m) => sum + Number(m.acdSeconds), 0) / latestMetrics.length
      : 0;

    const nerMetrics = latestMetrics.filter(m => m.ner !== null);
    const overallNer = nerMetrics.length > 0
      ? nerMetrics.reduce((sum, m) => sum + Number(m.ner), 0) / nerMetrics.length
      : 0;

    const pddMetrics = latestMetrics.filter(m => m.pddMs !== null);
    const overallPdd = pddMetrics.length > 0
      ? pddMetrics.reduce((sum, m) => sum + Number(m.pddMs), 0) / pddMetrics.length
      : 0;

    const totalCalls = latestMetrics.reduce((sum, m) => sum + m.totalCalls, BigInt(0));

    // Determine quality rating
    let qualityRating = 'EXCELLENT';
    if (overallAsr < 50 || overallAcd < 60) {
      qualityRating = 'POOR';
    } else if (overallAsr < 70 || overallAcd < 120) {
      qualityRating = 'FAIR';
    } else if (overallAsr < 85 || overallAcd < 180) {
      qualityRating = 'GOOD';
    }

    return NextResponse.json({
      carrier,
      summary: {
        overallAsr: parseFloat(overallAsr.toFixed(2)),
        overallAcd: parseFloat(overallAcd.toFixed(2)),
        overallNer: parseFloat(overallNer.toFixed(2)),
        overallPdd: parseFloat(overallPdd.toFixed(2)),
        totalCalls: totalCalls.toString(),
        qualityRating,
        destinationCount: Object.keys(destinationMetrics).length
      },
      byDestination: Object.values(destinationMetrics)
    });

  } catch (error) {
    console.error('Error generating QoS report:', error);
    return NextResponse.json(
      { error: 'Failed to generate QoS report' },
      { status: 500 }
    );
  }
}
