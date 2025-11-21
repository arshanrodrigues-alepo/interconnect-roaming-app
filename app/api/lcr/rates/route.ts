import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pricelistId = searchParams.get('pricelistId');
    const destinationCode = searchParams.get('destinationCode');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    const where: any = {};

    if (pricelistId) {
      where.pricelistId = pricelistId;
    }

    if (destinationCode) {
      where.destinationCode = {
        startsWith: destinationCode
      };
    }

    const rates = await prisma.carrierRate.findMany({
      where,
      include: {
        pricelist: {
          include: {
            carrier: {
              select: {
                id: true,
                partnerName: true,
                partnerCode: true
              }
            }
          }
        }
      },
      take: limit,
      orderBy: {
        destinationCode: 'asc'
      }
    });

    return NextResponse.json({ rates, count: rates.length });

  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rates' },
      { status: 500 }
    );
  }
}
