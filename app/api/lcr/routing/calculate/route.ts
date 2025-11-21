import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destinationCode, timestamp } = body;

    if (!destinationCode) {
      return NextResponse.json(
        { error: 'Destination code is required' },
        { status: 400 }
      );
    }

    const effectiveDate = timestamp ? new Date(timestamp) : new Date();

    // Find all active pricelists for the destination
    const matchingRates = await prisma.carrierRate.findMany({
      where: {
        destinationCode: {
          startsWith: destinationCode
        },
        pricelist: {
          status: 'ACTIVE',
          effectiveDate: {
            lte: effectiveDate
          },
          OR: [
            { expiryDate: null },
            { expiryDate: { gte: effectiveDate } }
          ]
        }
      },
      include: {
        pricelist: {
          include: {
            carrier: {
              select: {
                id: true,
                partnerName: true,
                partnerCode: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        destinationCode: 'desc' // Longest prefix match first
      }
    });

    if (matchingRates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No routes found for destination',
        destinationCode
      });
    }

    // Calculate quality score for each route
    const routesWithScores = matchingRates.map((rate) => {
      let qualityScore = 100;

      // Deduct points for low ASR
      if (rate.asrPercentage && rate.asrPercentage < 50) {
        qualityScore -= (50 - Number(rate.asrPercentage));
      }

      // Add points for good ASR
      if (rate.asrPercentage && rate.asrPercentage > 80) {
        qualityScore += (Number(rate.asrPercentage) - 80);
      }

      // Deduct points if carrier is not active
      if (rate.pricelist.carrier.status !== 'ACTIVE') {
        qualityScore -= 50;
      }

      return {
        carrierId: rate.pricelist.carrier.id,
        carrierName: rate.pricelist.carrier.partnerName,
        carrierCode: rate.pricelist.carrier.partnerCode,
        destinationCode: rate.destinationCode,
        destinationName: rate.destinationName,
        ratePerMinute: rate.ratePerMinute,
        billingIncrement: rate.billingIncrement,
        asrPercentage: rate.asrPercentage,
        acdSeconds: rate.acdSeconds,
        peakRate: rate.peakRate,
        offpeakRate: rate.offpeakRate,
        qualityScore,
        pricelistId: rate.pricelist.id
      };
    });

    // Sort by rate (lowest cost first), then by quality score
    const sortedRoutes = routesWithScores.sort((a, b) => {
      const rateA = Number(a.ratePerMinute);
      const rateB = Number(b.ratePerMinute);

      if (rateA !== rateB) {
        return rateA - rateB; // Lowest rate first
      }

      return b.qualityScore - a.qualityScore; // Higher quality first
    });

    return NextResponse.json({
      success: true,
      destinationCode,
      totalRoutes: sortedRoutes.length,
      recommendedRoute: sortedRoutes[0],
      alternativeRoutes: sortedRoutes.slice(1, 5) // Top 5 alternatives
    });

  } catch (error) {
    console.error('Error calculating LCR routing:', error);
    return NextResponse.json(
      { error: 'Failed to calculate routing' },
      { status: 500 }
    );
  }
}
