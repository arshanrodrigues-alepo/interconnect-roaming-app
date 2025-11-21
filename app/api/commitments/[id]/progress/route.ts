import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get commitment details
    const commitment = await prisma.volumeCommitment.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true
          }
        },
        discountScheme: {
          include: {
            tiers: true
          }
        }
      }
    });

    if (!commitment) {
      return NextResponse.json(
        { error: 'Commitment not found' },
        { status: 404 }
      );
    }

    // Calculate actual traffic within the commitment period
    const actualTraffic = await prisma.tapRecord.aggregate({
      where: {
        partnerId: commitment.partnerId,
        callDate: {
          gte: commitment.startDate,
          lte: commitment.endDate
        }
      },
      _sum: {
        duration: true,
        chargeAmount: true
      }
    });

    const actualMinutes = actualTraffic._sum.duration
      ? Math.floor(Number(actualTraffic._sum.duration) / 60)
      : 0;

    const actualRevenue = actualTraffic._sum.chargeAmount
      ? Number(actualTraffic._sum.chargeAmount)
      : 0;

    // Calculate progress percentages
    let volumeProgress = 0;
    let revenueProgress = 0;
    let shortfall = 0;
    let penaltyAmount = 0;

    if (commitment.committedVolumeMinutes) {
      const committedMinutes = Number(commitment.committedVolumeMinutes);
      volumeProgress = (actualMinutes / committedMinutes) * 100;

      if (actualMinutes < committedMinutes) {
        shortfall = committedMinutes - actualMinutes;
        if (commitment.penaltyRate) {
          penaltyAmount = shortfall * Number(commitment.penaltyRate);
        }
      }
    }

    if (commitment.committedRevenueAmount) {
      const committedRevenue = Number(commitment.committedRevenueAmount);
      revenueProgress = (actualRevenue / committedRevenue) * 100;

      if (actualRevenue < committedRevenue) {
        const revenueShortfall = committedRevenue - actualRevenue;
        if (commitment.penaltyRate && revenueShortfall > shortfall) {
          penaltyAmount = revenueShortfall * Number(commitment.penaltyRate) / 100;
        }
      }
    }

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(commitment.endDate);
    const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate applicable discount tier if scheme exists
    let applicableDiscount = null;
    if (commitment.discountScheme && commitment.discountScheme.tiers.length > 0) {
      const checkValue = commitment.discountScheme.appliesTo === 'REVENUE'
        ? actualRevenue
        : actualMinutes;

      for (const tier of commitment.discountScheme.tiers) {
        const fromVal = tier.fromVolume ? Number(tier.fromVolume) : 0;
        const toVal = tier.toVolume ? Number(tier.toVolume) : Infinity;

        if (checkValue >= fromVal && checkValue < toVal) {
          applicableDiscount = {
            tierId: tier.id,
            discountPercentage: tier.discountPercentage,
            rateAdjustment: tier.rateAdjustment
          };
          break;
        }
      }
    }

    return NextResponse.json({
      commitment: {
        id: commitment.id,
        commitmentType: commitment.commitmentType,
        startDate: commitment.startDate,
        endDate: commitment.endDate,
        status: commitment.status,
        committedVolumeMinutes: commitment.committedVolumeMinutes?.toString() || null,
        committedRevenueAmount: commitment.committedRevenueAmount
      },
      partner: commitment.partner,
      progress: {
        actualMinutes,
        actualRevenue,
        volumeProgress: parseFloat(volumeProgress.toFixed(2)),
        revenueProgress: parseFloat(revenueProgress.toFixed(2)),
        shortfall,
        penaltyAmount: parseFloat(penaltyAmount.toFixed(2)),
        daysRemaining
      },
      applicableDiscount,
      discountScheme: commitment.discountScheme ? {
        id: commitment.discountScheme.id,
        name: commitment.discountScheme.schemeName,
        type: commitment.discountScheme.discountType
      } : null
    });

  } catch (error) {
    console.error('Error fetching commitment progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commitment progress' },
      { status: 500 }
    );
  }
}
