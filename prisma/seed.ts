/**
 * Database Seeding Script
 *
 * This script populates the database with sample data for development and testing
 */

import { PrismaClient } from '../lib/generated/prisma/index.js';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Clearing existing data...');
    try {
      await prisma.tAPRecord.deleteMany();
      await prisma.tAPFile.deleteMany();
      await prisma.testCall.deleteMany();
      await prisma.anomaly.deleteMany();
      await prisma.dispute.deleteMany();
      await prisma.invoice.deleteMany();
      await prisma.rate.deleteMany();
      await prisma.rateSheet.deleteMany();
      await prisma.ratePlan.deleteMany();
      await prisma.rAEXForm.deleteMany();
      await prisma.agreement.deleteMany();
      await prisma.user.deleteMany();
      await prisma.partner.deleteMany();
      await prisma.policyDocument.deleteMany();
      await prisma.billingCycle.deleteMany();
    } catch (error) {
      // Tables may not exist yet after reset, continue
      console.log('   (Skipping cleanup - fresh database)');
    }
  }

  // ============================================================================
  // PARTNERS
  // ============================================================================
  console.log('📞 Creating partners...');

  const verizon = await prisma.partner.create({
    data: {
      partnerCode: 'USAVZ1',
      partnerName: 'Verizon Wireless',
      partnerType: 'RECIPROCAL',
      countryCode: 'USA',
      status: 'ACTIVE',
      contactEmail: 'roaming@verizon.com',
      contactPhone: '+1-555-0100',
    },
  });

  const tmobileUK = await prisma.partner.create({
    data: {
      partnerCode: 'GBRTM1',
      partnerName: 'T-Mobile UK',
      partnerType: 'RECIPROCAL',
      countryCode: 'GBR',
      status: 'ACTIVE',
      contactEmail: 'wholesale@tmobile.uk',
      contactPhone: '+44-20-7946-0958',
    },
  });

  const deutscheTelekom = await prisma.partner.create({
    data: {
      partnerCode: 'DEUTE1',
      partnerName: 'Deutsche Telekom',
      partnerType: 'RECIPROCAL',
      countryCode: 'DEU',
      status: 'PENDING',
      contactEmail: 'roaming@telekom.de',
      contactPhone: '+49-30-1234567',
    },
  });

  const nttDocomo = await prisma.partner.create({
    data: {
      partnerCode: 'JPNDO1',
      partnerName: 'NTT Docomo',
      partnerType: 'RECIPROCAL',
      countryCode: 'JPN',
      status: 'ACTIVE',
      contactEmail: 'intl@nttdocomo.jp',
    },
  });

  const vodafoneFrance = await prisma.partner.create({
    data: {
      partnerCode: 'FRAVF1',
      partnerName: 'Vodafone France',
      partnerType: 'VENDOR',
      countryCode: 'FRA',
      status: 'SUSPENDED',
      contactEmail: 'roaming@vodafone.fr',
      contactPhone: '+33-1-2345-6789',
    },
  });

  console.log(`✅ Created ${5} partners`);

  // ============================================================================
  // USERS
  // ============================================================================
  console.log('👥 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@interconnect.local',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      email: 'finance@interconnect.local',
      password: hashedPassword,
      name: 'Finance Manager',
      role: 'FINANCE',
    },
  });

  const supportUser = await prisma.user.create({
    data: {
      email: 'support@interconnect.local',
      password: hashedPassword,
      name: 'Support Agent',
      role: 'SUPPORT',
    },
  });

  const verizonUser = await prisma.user.create({
    data: {
      email: 'contact@verizon.com',
      password: hashedPassword,
      name: 'Verizon Contact',
      role: 'PARTNER',
      partnerId: verizon.id,
    },
  });

  const tmobileUser = await prisma.user.create({
    data: {
      email: 'contact@tmobile.uk',
      password: hashedPassword,
      name: 'T-Mobile Contact',
      role: 'PARTNER',
      partnerId: tmobileUK.id,
    },
  });

  const docomoUser = await prisma.user.create({
    data: {
      email: 'contact@docomo.jp',
      password: hashedPassword,
      name: 'Docomo Contact',
      role: 'PARTNER',
      partnerId: nttDocomo.id,
    },
  });

  console.log(`✅ Created ${6} users`);

  // ============================================================================
  // AGREEMENTS
  // ============================================================================
  console.log('📄 Creating agreements...');

  const verizonAgreement = await prisma.agreement.create({
    data: {
      partnerId: verizon.id,
      agreementName: 'Verizon Interconnect & Roaming Agreement 2025',
      agreementType: 'BOTH',
      startDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      policyStatus: 'ACTIVE',
      currency: 'USD',
      billingCycle: 'MONTHLY',
      documentTemplate: 'Master Interconnect Agreement...',
    },
  });

  const tmobileAgreement = await prisma.agreement.create({
    data: {
      partnerId: tmobileUK.id,
      agreementName: 'T-Mobile UK Roaming Agreement',
      agreementType: 'ROAMING',
      startDate: new Date('2024-06-01'),
      status: 'ACTIVE',
      policyStatus: 'ACTIVE',
      currency: 'GBP',
      billingCycle: 'MONTHLY',
    },
  });

  const docomoAgreement = await prisma.agreement.create({
    data: {
      partnerId: nttDocomo.id,
      agreementName: 'NTT Docomo Interconnect Agreement',
      agreementType: 'INTERCONNECT',
      startDate: new Date('2024-12-01'),
      status: 'ACTIVE',
      policyStatus: 'APPROVED',
      currency: 'JPY',
      billingCycle: 'MONTHLY',
    },
  });

  console.log(`✅ Created ${3} agreements`);

  // ============================================================================
  // RATE SHEETS
  // ============================================================================
  console.log('💰 Creating rate sheets and rates...');

  const verizonRateSheet = await prisma.rateSheet.create({
    data: {
      partnerId: verizon.id,
      rateSheetName: 'Verizon 2025 Rate Card',
      effectiveDate: new Date('2025-01-01'),
      isActive: true,
      rates: {
        create: [
          {
            serviceType: 'VOICE',
            direction: 'INBOUND',
            calledNumberPrefix: '+1',
            ratePerUnit: 0.025,
            currency: 'USD',
            roundingRule: 'UP',
            minimumCharge: 0.01,
          },
          {
            serviceType: 'VOICE',
            direction: 'OUTBOUND',
            calledNumberPrefix: '+1',
            ratePerUnit: 0.030,
            currency: 'USD',
            roundingRule: 'UP',
            minimumCharge: 0.01,
          },
          {
            serviceType: 'SMS',
            direction: 'INBOUND',
            ratePerUnit: 0.005,
            currency: 'USD',
            roundingRule: 'NONE',
          },
          {
            serviceType: 'SMS',
            direction: 'OUTBOUND',
            ratePerUnit: 0.008,
            currency: 'USD',
            roundingRule: 'NONE',
          },
        ],
      },
    },
  });

  const tmobileRateSheet = await prisma.rateSheet.create({
    data: {
      partnerId: tmobileUK.id,
      rateSheetName: 'T-Mobile UK 2025 Rates',
      effectiveDate: new Date('2025-01-01'),
      isActive: true,
      rates: {
        create: [
          {
            serviceType: 'VOICE',
            direction: 'INBOUND',
            calledNumberPrefix: '+44',
            ratePerUnit: 0.020,
            currency: 'GBP',
            roundingRule: 'UP',
            minimumCharge: 0.01,
          },
          {
            serviceType: 'VOICE',
            direction: 'OUTBOUND',
            calledNumberPrefix: '+44',
            ratePerUnit: 0.025,
            currency: 'GBP',
            roundingRule: 'UP',
            minimumCharge: 0.01,
          },
          {
            serviceType: 'SMS',
            direction: 'INBOUND',
            ratePerUnit: 0.004,
            currency: 'GBP',
            roundingRule: 'NONE',
          },
          {
            serviceType: 'SMS',
            direction: 'OUTBOUND',
            ratePerUnit: 0.006,
            currency: 'GBP',
            roundingRule: 'NONE',
          },
        ],
      },
    },
  });

  const docomoRateSheet = await prisma.rateSheet.create({
    data: {
      partnerId: nttDocomo.id,
      rateSheetName: 'Docomo 2025 Pricing',
      effectiveDate: new Date('2025-01-01'),
      isActive: true,
      rates: {
        create: [
          {
            serviceType: 'VOICE',
            direction: 'INBOUND',
            calledNumberPrefix: '+81',
            ratePerUnit: 3.5,
            currency: 'JPY',
            roundingRule: 'NEAREST',
            minimumCharge: 1.0,
          },
          {
            serviceType: 'SMS',
            direction: 'INBOUND',
            ratePerUnit: 0.5,
            currency: 'JPY',
            roundingRule: 'NONE',
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${3} rate sheets with rates`);

  // ============================================================================
  // TAP FILES
  // ============================================================================
  console.log('📁 Creating sample TAP files...');

  const tapFile1 = await prisma.tAPFile.create({
    data: {
      partnerId: verizon.id,
      filename: 'USAVZ1_202501_001.TAP',
      fileSizeBytes: 524288,
      direction: 'INBOUND',
      status: 'RATED',
      recordsCount: 150,
      totalCharges: 45.75,
      processedTimestamp: new Date(),
    },
  });

  const tapFile2 = await prisma.tAPFile.create({
    data: {
      partnerId: tmobileUK.id,
      filename: 'GBRTM1_202501_001.TAP',
      fileSizeBytes: 312421,
      direction: 'OUTBOUND',
      status: 'RATED',
      recordsCount: 89,
      totalCharges: 28.30,
      processedTimestamp: new Date(),
    },
  });

  console.log(`✅ Created ${2} TAP files`);

  // ============================================================================
  // INVOICES
  // ============================================================================
  console.log('🧾 Creating invoices...');

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-001',
      partnerId: verizon.id,
      billingPeriodStart: new Date('2025-01-01'),
      billingPeriodEnd: new Date('2025-01-31'),
      subtotal: 12543.50,
      taxAmount: 1254.35,
      totalAmount: 13797.85,
      currency: 'USD',
      status: 'ISSUED',
      invoiceDate: new Date('2025-02-01'),
      dueDate: new Date('2025-03-03'),
      lineItems: [
        {
          serviceType: 'VOICE',
          direction: 'INBOUND',
          totalUnits: 125430,
          rate: 0.025,
          amount: 3135.75,
        },
        {
          serviceType: 'VOICE',
          direction: 'OUTBOUND',
          totalUnits: 98245,
          rate: 0.030,
          amount: 2947.35,
        },
        {
          serviceType: 'SMS',
          direction: 'INBOUND',
          totalUnits: 45678,
          rate: 0.005,
          amount: 228.39,
        },
      ],
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-002',
      partnerId: tmobileUK.id,
      billingPeriodStart: new Date('2025-01-01'),
      billingPeriodEnd: new Date('2025-01-31'),
      subtotal: 8745.20,
      taxAmount: 1749.04,
      totalAmount: 10494.24,
      currency: 'GBP',
      status: 'PAID',
      invoiceDate: new Date('2025-02-01'),
      dueDate: new Date('2025-03-03'),
      paidDate: new Date('2025-02-15'),
    },
  });

  console.log(`✅ Created ${2} invoices`);

  // ============================================================================
  // DISPUTES
  // ============================================================================
  console.log('⚠️  Creating disputes...');

  const dispute1 = await prisma.dispute.create({
    data: {
      disputeNumber: 'DSP-2025-001',
      invoiceId: invoice1.id,
      partnerId: verizon.id,
      disputeType: 'BILLING',
      status: 'OPEN',
      priority: 'HIGH',
      description: 'Discrepancy in voice call charges for 2025-01 period',
      disputedAmount: 250.00,
      createdById: verizonUser.id,
      assignedToId: financeUser.id,
    },
  });

  console.log(`✅ Created ${1} dispute`);

  // ============================================================================
  // ANOMALIES
  // ============================================================================
  console.log('🛡️  Creating fraud anomalies...');

  const anomaly1 = await prisma.anomaly.create({
    data: {
      partnerId: verizon.id,
      anomalyType: 'UNUSUAL_TRAFFIC_VOLUME',
      severity: 'HIGH',
      description: 'Traffic spike of 350% detected for SMS services',
      affectedServices: ['SMS'],
      metrics: {
        normalVolume: 5000,
        detectedVolume: 17500,
        percentageIncrease: 250,
      },
      status: 'OPEN',
      recommendedAction: 'Review traffic patterns and contact partner',
      investigatedById: supportUser.id,
    },
  });

  const anomaly2 = await prisma.anomaly.create({
    data: {
      partnerId: tmobileUK.id,
      anomalyType: 'HIGH_COST_DESTINATION',
      severity: 'CRITICAL',
      description: 'Unusual calls to premium rate destinations detected',
      affectedServices: ['VOICE'],
      metrics: {
        destinationPrefix: '+248',
        callCount: 127,
        estimatedCost: 4500,
      },
      status: 'INVESTIGATING',
      recommendedAction: 'Block premium rate destinations immediately',
      investigatedById: supportUser.id,
      investigationNotes: 'Coordinating with partner security team',
    },
  });

  console.log(`✅ Created ${2} anomalies`);

  // ============================================================================
  // RAEX FORMS
  // ============================================================================
  console.log('📋 Creating RAEX forms...');

  const raexForm1 = await prisma.rAEXForm.create({
    data: {
      agreementId: verizonAgreement.id,
      networkName: 'Verizon Wireless',
      tadigCode: 'USAVZ1',
      mcc: '310',
      mnc: '012',
      supportedTechnologies: ['4G', '5G'],
      volteCapable: true,
      vowifiCapable: true,
      rcsCapable: false,
      sccpAddress: '1234567890123',
      diameterEndpoint: 'diameter.verizon.com:3868',
      tapVersion: '3.12',
      fileExchangeProtocol: 'SFTP',
    },
  });

  console.log(`✅ Created ${1} RAEX form`);

  // ============================================================================
  // TEST CALLS
  // ============================================================================
  console.log('📞 Creating test calls...');

  const testCall1 = await prisma.testCall.create({
    data: {
      partnerId: verizon.id,
      testType: 'VOICE_CALL',
      direction: 'MO',
      sourceMsisdn: '+447700900123',
      destinationMsisdn: '+14155551234',
      scheduledTime: new Date('2025-01-16T10:00:00Z'),
      executedAt: new Date('2025-01-16T10:00:15Z'),
      status: 'COMPLETED',
      result: 'SUCCESS',
      qualityMetrics: {
        mosScore: 4.2,
        packetLossPercentage: 0.5,
        jitterMs: 15,
        latencyMs: 120,
      },
      details: {
        callSetupTimeMs: 2500,
        ringTimeSeconds: 3,
        conversationTimeSeconds: 40,
      },
    },
  });

  console.log(`✅ Created ${1} test call`);

  // ============================================================================
  // POLICY DOCUMENTS
  // ============================================================================
  console.log('📜 Creating policy documents...');

  const policyDoc1 = await prisma.policyDocument.create({
    data: {
      policyType: 'AGREEMENT_TEMPLATE',
      policyName: 'Master Interconnect Agreement Template',
      content: '# Master Interconnect Agreement\n\nThis agreement is entered into...',
      version: '1.0',
      status: 'ACTIVE',
      createdBy: 'System',
    },
  });

  console.log(`✅ Created ${1} policy document`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • ${5} Partners`);
  console.log(`   • ${6} Users`);
  console.log(`   • ${3} Agreements`);
  console.log(`   • ${3} Rate Sheets with rates`);
  console.log(`   • ${2} TAP Files`);
  console.log(`   • ${2} Invoices`);
  console.log(`   • ${1} Dispute`);
  console.log(`   • ${2} Fraud Anomalies`);
  console.log(`   • ${1} RAEX Form`);
  console.log(`   • ${1} Test Call`);
  console.log(`   • ${1} Policy Document`);
  console.log('\n🔐 Login Credentials (all use password: password123):');
  console.log('   • admin@interconnect.local (Admin)');
  console.log('   • finance@interconnect.local (Finance)');
  console.log('   • support@interconnect.local (Support)');
  console.log('   • contact@verizon.com (Partner - Verizon)');
  console.log('   • contact@tmobile.uk (Partner - T-Mobile)');
  console.log('   • contact@docomo.jp (Partner - Docomo)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
