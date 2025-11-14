import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/fraud/anomalies - Get anomalies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const partnerId = searchParams.get('partner_id');

    // Build where clause
    const where: any = {};
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (partnerId) where.partnerId = partnerId;

    // Fetch anomalies with partner details
    const anomalies = await prisma.anomaly.findMany({
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
      orderBy: { detectedAt: 'desc' },
    });

    // Transform to match API response format
    const formattedAnomalies = anomalies.map((a) => ({
      anomaly_id: a.id,
      partner_id: a.partnerId,
      partner_name: a.partner.partnerName,
      partner_code: a.partner.partnerCode,
      detected_at: a.detectedAt.toISOString(),
      anomaly_type: a.anomalyType,
      severity: a.severity,
      description: a.description,
      affected_services: a.affectedServices,
      metrics: a.metrics,
      status: a.status,
      recommended_action: a.recommendedAction,
      investigated_by: a.investigatedById,
      investigation_notes: a.investigationNotes,
      resolved_at: a.resolvedAt?.toISOString() || null,
    }));

    return NextResponse.json({ anomalies: formattedAnomalies });
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
}
