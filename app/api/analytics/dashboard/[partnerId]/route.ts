import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { DashboardData } from '@/lib/types';

// GET /api/analytics/dashboard/:partnerId - Get dashboard data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';
    const fromDate = searchParams.get('from_date') || '2025-01-01';
    const toDate = searchParams.get('to_date') || '2025-01-31';

    // Check if partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Fetch TAP records for this partner within date range
    const partnerRecords = await prisma.tAPRecord.findMany({
      where: {
        partnerId,
        callDateTime: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      },
    });

    // Calculate traffic summary using aggregations
    const voiceStats = await prisma.tAPRecord.aggregate({
      where: {
        partnerId,
        serviceType: 'VOICE',
        callDateTime: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      },
      _sum: {
        durationSeconds: true,
        chargedAmount: true,
      },
    });

    const smsStats = await prisma.tAPRecord.aggregate({
      where: {
        partnerId,
        serviceType: 'SMS',
        callDateTime: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      },
      _sum: {
        messageCount: true,
        chargedAmount: true,
      },
    });

    const dataStats = await prisma.tAPRecord.aggregate({
      where: {
        partnerId,
        serviceType: 'DATA',
        callDateTime: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      },
      _sum: {
        dataVolumeMb: true,
        chargedAmount: true,
      },
    });

    // Calculate values
    const voiceMinutes = (voiceStats._sum.durationSeconds || 0) / 60;
    const smsCount = smsStats._sum.messageCount || 0;
    const dataMB = parseFloat((dataStats._sum.dataVolumeMb || 0).toString());

    const voiceRevenue = parseFloat((voiceStats._sum.chargedAmount || 0).toString());
    const smsRevenue = parseFloat((smsStats._sum.chargedAmount || 0).toString());
    const dataRevenue = parseFloat((dataStats._sum.chargedAmount || 0).toString());
    const totalCharges = voiceRevenue + smsRevenue + dataRevenue;

    const dashboardData: DashboardData = {
      partner_id: partnerId,
      period,
      from_date: fromDate,
      to_date: toDate,
      traffic_summary: {
        voice_minutes: Math.round(voiceMinutes),
        sms_count: smsCount,
        data_mb: Math.round(dataMB),
      },
      revenue_summary: {
        total_charges: totalCharges,
        voice_revenue: voiceRevenue,
        sms_revenue: smsRevenue,
        data_revenue: dataRevenue,
        margin_percentage: 25.5, // Mock margin - can be calculated from rate plans
      },
      sla_compliance: {
        availability_percentage: 99.97, // Mock SLA data
        average_success_rate: 98.5,
        average_latency_ms: 85,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
