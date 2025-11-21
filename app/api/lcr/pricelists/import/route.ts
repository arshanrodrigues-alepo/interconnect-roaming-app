import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      carrierId,
      effectiveDate,
      expiryDate,
      noticePeriodDays,
      updateType,
      sourceFileUrl,
      rates
    } = body;

    // Validation
    if (!carrierId || !effectiveDate || !noticePeriodDays || !updateType) {
      return NextResponse.json(
        { error: 'Missing required fields: carrierId, effectiveDate, noticePeriodDays, updateType' },
        { status: 400 }
      );
    }

    // Verify carrier exists
    const carrier = await prisma.partner.findUnique({
      where: { id: carrierId }
    });

    if (!carrier) {
      return NextResponse.json(
        { error: 'Carrier not found' },
        { status: 404 }
      );
    }

    // Create pricelist with rates in a transaction
    const pricelist = await prisma.$transaction(async (tx) => {
      const newPricelist = await tx.carrierPricelist.create({
        data: {
          carrierId,
          effectiveDate: new Date(effectiveDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          noticePeriodDays,
          updateType,
          sourceFileUrl,
          status: 'PENDING',
          confirmationSent: false
        }
      });

      // If rates are provided, create them
      if (rates && Array.isArray(rates) && rates.length > 0) {
        await tx.carrierRate.createMany({
          data: rates.map((rate: any) => ({
            pricelistId: newPricelist.id,
            destinationCode: rate.destinationCode,
            destinationName: rate.destinationName,
            ratePerMinute: rate.ratePerMinute,
            billingIncrement: rate.billingIncrement || 'PER_SECOND',
            asrPercentage: rate.asrPercentage || null,
            acdSeconds: rate.acdSeconds || null,
            peakRate: rate.peakRate || null,
            offpeakRate: rate.offpeakRate || null
          }))
        });
      }

      return newPricelist;
    });

    return NextResponse.json({
      success: true,
      pricelistId: pricelist.id,
      message: 'Pricelist imported successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error importing pricelist:', error);
    return NextResponse.json(
      {
        error: 'Failed to import pricelist',
        details: error.message || 'Unknown error',
        code: error.code
      },
      { status: 500 }
    );
  }
}
