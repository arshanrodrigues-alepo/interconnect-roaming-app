import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const carrierId = searchParams.get('carrierId');
    const status = searchParams.get('status');
    const includeRates = searchParams.get('includeRates') === 'true';

    const where: any = {};

    if (carrierId) {
      where.carrierId = carrierId;
    }

    if (status) {
      where.status = status;
    }

    const pricelists = await prisma.carrierPricelist.findMany({
      where,
      include: {
        carrier: {
          select: {
            id: true,
            partnerName: true,
            partnerCode: true
          }
        },
        rates: includeRates
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    });

    return NextResponse.json({ pricelists });

  } catch (error) {
    console.error('Error fetching pricelists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricelists' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { pricelistId, status, confirmationSent } = body;

    if (!pricelistId) {
      return NextResponse.json(
        { error: 'Pricelist ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (confirmationSent !== undefined) {
      updateData.confirmationSent = confirmationSent;
    }

    const pricelist = await prisma.carrierPricelist.update({
      where: { id: pricelistId },
      data: updateData
    });

    return NextResponse.json({ pricelist });

  } catch (error) {
    console.error('Error updating pricelist:', error);
    return NextResponse.json(
      { error: 'Failed to update pricelist' },
      { status: 500 }
    );
  }
}
