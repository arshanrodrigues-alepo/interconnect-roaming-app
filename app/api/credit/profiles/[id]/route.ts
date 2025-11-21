import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
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

    const updateData: any = {};

    if (creditLimit !== undefined) updateData.creditLimit = creditLimit;
    if (paymentTermsDays !== undefined) updateData.paymentTermsDays = paymentTermsDays;
    if (surchargeCategory) updateData.surchargeCategory = surchargeCategory;
    if (surchargeRate !== undefined) updateData.surchargeRate = surchargeRate;
    if (surchargeTriggerDays !== undefined) updateData.surchargeTriggerDays = surchargeTriggerDays;
    if (bankGuaranteeRequired !== undefined) updateData.bankGuaranteeRequired = bankGuaranteeRequired;
    if (bankGuaranteeAmount !== undefined) updateData.bankGuaranteeAmount = bankGuaranteeAmount;
    if (bankGuaranteeExpiry) updateData.bankGuaranteeExpiry = new Date(bankGuaranteeExpiry);
    if (status) updateData.status = status;

    const profile = await prisma.creditProfile.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Error updating credit profile:', error);
    return NextResponse.json(
      { error: 'Failed to update credit profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.creditProfile.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Credit profile deleted' });

  } catch (error) {
    console.error('Error deleting credit profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete credit profile' },
      { status: 500 }
    );
  }
}
