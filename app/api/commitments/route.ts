import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    const status = searchParams.get('status');

    const where: any = {};

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (status) {
      where.status = status;
    }

    const commitments = await prisma.volumeCommitment.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true,
            partnerType: true
          }
        },
        discountScheme: {
          select: {
            id: true,
            schemeName: true,
            discountType: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json({ commitments, count: commitments.length });

  } catch (error) {
    console.error('Error fetching commitments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commitments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      partnerId,
      destinationGroupId,
      commitmentType,
      committedVolumeMinutes,
      committedRevenueAmount,
      startDate,
      endDate,
      penaltyRate,
      discountSchemeId,
      status
    } = body;

    // Validation
    if (!partnerId || !commitmentType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: partnerId, commitmentType, startDate, endDate' },
        { status: 400 }
      );
    }

    if (!committedVolumeMinutes && !committedRevenueAmount) {
      return NextResponse.json(
        { error: 'Either committedVolumeMinutes or committedRevenueAmount must be provided' },
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

    const commitment = await prisma.volumeCommitment.create({
      data: {
        partnerId,
        destinationGroupId,
        commitmentType,
        committedVolumeMinutes: committedVolumeMinutes ? BigInt(committedVolumeMinutes) : null,
        committedRevenueAmount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        penaltyRate,
        discountSchemeId,
        status: status || 'ACTIVE'
      },
      include: {
        partner: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true
          }
        },
        discountScheme: true
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedCommitment = {
      ...commitment,
      committedVolumeMinutes: commitment.committedVolumeMinutes?.toString() || null
    };

    return NextResponse.json({ commitment: serializedCommitment }, { status: 201 });

  } catch (error) {
    console.error('Error creating commitment:', error);
    return NextResponse.json(
      { error: 'Failed to create commitment' },
      { status: 500 }
    );
  }
}
