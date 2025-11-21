import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destinationCode = searchParams.get('destinationCode');
    const country = searchParams.get('country');
    const status = searchParams.get('status');
    const fraudRisk = searchParams.get('fraudRisk');

    const where: any = {};

    if (destinationCode) {
      where.destinationCode = {
        startsWith: destinationCode
      };
    }

    if (country) {
      where.country = {
        contains: country,
        mode: 'insensitive'
      };
    }

    if (status) {
      where.status = status;
    }

    if (fraudRisk !== null && fraudRisk !== undefined) {
      where.fraudRisk = fraudRisk === 'true';
    }

    const numberingPlans = await prisma.numberingPlan.findMany({
      where,
      orderBy: {
        destinationCode: 'asc'
      }
    });

    return NextResponse.json({ numberingPlans, count: numberingPlans.length });

  } catch (error) {
    console.error('Error fetching numbering plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch numbering plans' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      destinationCode,
      country,
      region,
      description,
      effectiveFrom,
      effectiveTo,
      status,
      fraudRisk,
      notes
    } = body;

    // Validation
    if (!destinationCode || !country || !effectiveFrom) {
      return NextResponse.json(
        { error: 'Missing required fields: destinationCode, country, effectiveFrom' },
        { status: 400 }
      );
    }

    // Check for conflicts with existing plans
    const existingPlan = await prisma.numberingPlan.findFirst({
      where: {
        destinationCode,
        status: 'ACTIVE',
        effectiveFrom: {
          lte: new Date(effectiveFrom)
        },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date(effectiveFrom) } }
        ]
      }
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'A conflicting active numbering plan already exists for this destination code' },
        { status: 400 }
      );
    }

    const numberingPlan = await prisma.numberingPlan.create({
      data: {
        destinationCode,
        country,
        region,
        description,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        status: status || 'ACTIVE',
        fraudRisk: fraudRisk || false,
        notes
      }
    });

    return NextResponse.json({ numberingPlan }, { status: 201 });

  } catch (error) {
    console.error('Error creating numbering plan:', error);
    return NextResponse.json(
      { error: 'Failed to create numbering plan' },
      { status: 500 }
    );
  }
}
