import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    // Get credit profile
    const creditProfile = await prisma.creditProfile.findUnique({
      where: { partnerId },
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

    if (!creditProfile) {
      return NextResponse.json(
        { error: 'Credit profile not found for this partner' },
        { status: 404 }
      );
    }

    // Calculate outstanding invoices
    const outstandingInvoices = await prisma.invoice.findMany({
      where: {
        partnerId,
        status: {
          in: ['PENDING', 'OVERDUE']
        }
      },
      select: {
        invoiceId: true,
        totalAmount: true,
        dueDate: true,
        status: true
      }
    });

    const totalOutstanding = outstandingInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0
    );

    // Calculate overdue amount
    const now = new Date();
    const overdueInvoices = outstandingInvoices.filter(
      inv => inv.dueDate && new Date(inv.dueDate) < now
    );

    const totalOverdue = overdueInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0
    );

    // Calculate credit utilization
    const creditLimit = Number(creditProfile.creditLimit);
    const creditUtilization = creditLimit > 0 ? (totalOutstanding / creditLimit) * 100 : 0;
    const availableCredit = Math.max(0, creditLimit - totalOutstanding);

    // Calculate surcharge if applicable
    let surchargeAmount = 0;
    const triggerDays = creditProfile.surchargeTriggerDays;
    const surchargeRate = Number(creditProfile.surchargeRate);

    overdueInvoices.forEach(inv => {
      if (inv.dueDate) {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysOverdue > triggerDays) {
          surchargeAmount += Number(inv.totalAmount) * (surchargeRate / 100);
        }
      }
    });

    return NextResponse.json({
      partner: creditProfile.partner,
      creditProfile: {
        creditLimit: creditProfile.creditLimit,
        paymentTermsDays: creditProfile.paymentTermsDays,
        status: creditProfile.status,
        surchargeCategory: creditProfile.surchargeCategory,
        surchargeRate: creditProfile.surchargeRate,
        surchargeTriggerDays: creditProfile.surchargeTriggerDays
      },
      exposure: {
        totalOutstanding,
        totalOverdue,
        creditUtilization: parseFloat(creditUtilization.toFixed(2)),
        availableCredit,
        surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
        outstandingInvoiceCount: outstandingInvoices.length,
        overdueInvoiceCount: overdueInvoices.length
      },
      riskLevel: creditUtilization > 90 ? 'HIGH' : creditUtilization > 70 ? 'MEDIUM' : 'LOW'
    });

  } catch (error) {
    console.error('Error calculating credit exposure:', error);
    return NextResponse.json(
      { error: 'Failed to calculate credit exposure' },
      { status: 500 }
    );
  }
}
