import { NextRequest, NextResponse } from 'next/server';
import { PartnerStatus } from '@/lib/types';
import prisma from '@/lib/db/prisma';

// PATCH /api/partners/:id/status - Update partner status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reason } = body as { status: PartnerStatus; reason?: string };

    // Validate status
    if (!status || !['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Check if partner exists
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Update status
    const updatedPartner = await prisma.partner.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      partner_id: updatedPartner.id,
      status: updatedPartner.status,
      updated_at: updatedPartner.updatedAt.toISOString(),
      reason,
    });
  } catch (error) {
    console.error('Error updating partner status:', error);
    return NextResponse.json(
      { error: 'Failed to update partner status' },
      { status: 500 }
    );
  }
}
