import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const countryCode = searchParams.get('countryCode');
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (name) {
      where.name = name;
    }

    if (countryCode) {
      where.countryCode = countryCode;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const timebands = await prisma.ratingTimeband.findMany({
      where,
      orderBy: [
        { countryCode: 'asc' },
        { name: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json({ timebands, count: timebands.length });

  } catch (error) {
    console.error('Error fetching timebands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timebands' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      startTime,
      endTime,
      appliesOn,
      countryCode,
      isActive
    } = body;

    // Validation
    if (!name || !startTime || !endTime || !appliesOn) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startTime, endTime, appliesOn' },
        { status: 400 }
      );
    }

    const timeband = await prisma.ratingTimeband.create({
      data: {
        name,
        description,
        startTime,
        endTime,
        appliesOn,
        countryCode,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({ timeband }, { status: 201 });

  } catch (error) {
    console.error('Error creating timeband:', error);
    return NextResponse.json(
      { error: 'Failed to create timeband' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { timebandId, isActive } = body;

    if (!timebandId) {
      return NextResponse.json(
        { error: 'Timeband ID is required' },
        { status: 400 }
      );
    }

    const timeband = await prisma.ratingTimeband.update({
      where: { id: timebandId },
      data: { isActive }
    });

    return NextResponse.json({ timeband });

  } catch (error) {
    console.error('Error updating timeband:', error);
    return NextResponse.json(
      { error: 'Failed to update timeband' },
      { status: 500 }
    );
  }
}
