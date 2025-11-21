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

    const profiles = await prisma.creditProfile.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true,
            partnerType: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ profiles, count: profiles.length });

  } catch (error) {
    console.error('Error fetching credit profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit profiles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      partnerId,
      creditLimit,
      paymentTermsDays,
      surchargeCategory,
      surchargeRate,
      surchargeTriggerDays,
      bankGuaranteeRequired,
      bankGuaranteeAmount,
      bankGuaranteeExpiry,
      status
    } = body;

    // Validation
    if (!partnerId || !creditLimit || !paymentTermsDays || !surchargeCategory ||
        surchargeRate === undefined || !surchargeTriggerDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if profile already exists for this partner
    const existingProfile = await prisma.creditProfile.findUnique({
      where: { partnerId }
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Credit profile already exists for this partner' },
        { status: 400 }
      );
    }

    const profile = await prisma.creditProfile.create({
      data: {
        partnerId,
        creditLimit,
        paymentTermsDays,
        surchargeCategory,
        surchargeRate,
        surchargeTriggerDays,
        bankGuaranteeRequired: bankGuaranteeRequired || false,
        bankGuaranteeAmount: bankGuaranteeAmount || null,
        bankGuaranteeExpiry: bankGuaranteeExpiry ? new Date(bankGuaranteeExpiry) : null,
        status: status || 'ACTIVE'
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

    return NextResponse.json({ profile }, { status: 201 });

  } catch (error) {
    console.error('Error creating credit profile:', error);
    return NextResponse.json(
      { error: 'Failed to create credit profile' },
      { status: 500 }
    );
  }
}
