/**
 * Create sample LCR (Least Cost Routing) data for demo
 *
 * This script creates:
 * - 3 carrier partners
 * - Active pricelists for each carrier
 * - Sample rates for common destinations with different pricing
 */

import { PrismaClient } from './lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating sample LCR data...\n');

  // Create 3 carrier partners
  console.log('Creating carrier partners...');

  const carrierA = await prisma.partner.upsert({
    where: { partnerCode: 'CARRA' },
    update: {},
    create: {
      partnerCode: 'CARRA',
      partnerName: 'Global Carrier A',
      partnerType: 'VENDOR',
      countryCode: 'USA',
      status: 'ACTIVE',
      contactEmail: 'routes@carrier-a.example.com',
      contactPhone: '+1-555-0001',
    },
  });

  const carrierB = await prisma.partner.upsert({
    where: { partnerCode: 'CARRB' },
    update: {},
    create: {
      partnerCode: 'CARRB',
      partnerName: 'TelecomHub Carrier B',
      partnerType: 'VENDOR',
      countryCode: 'GBR',
      status: 'ACTIVE',
      contactEmail: 'wholesale@carrier-b.example.com',
      contactPhone: '+44-20-5550002',
    },
  });

  const carrierC = await prisma.partner.upsert({
    where: { partnerCode: 'CARRC' },
    update: {},
    create: {
      partnerCode: 'CARRC',
      partnerName: 'Asia-Pacific Carrier C',
      partnerType: 'VENDOR',
      countryCode: 'SGP',
      status: 'ACTIVE',
      contactEmail: 'pricing@carrier-c.example.com',
      contactPhone: '+65-6555-0003',
    },
  });

  console.log('✅ Created 3 carrier partners\n');

  // Create pricelists for each carrier
  console.log('Creating pricelists...');

  const pricelistA = await prisma.carrierPricelist.create({
    data: {
      carrierId: carrierA.id,
      effectiveDate: new Date('2025-01-01'),
      expiryDate: new Date('2025-12-31'),
      noticePeriodDays: 30,
      updateType: 'FULL',
      status: 'ACTIVE',
      confirmationSent: true,
    },
  });

  const pricelistB = await prisma.carrierPricelist.create({
    data: {
      carrierId: carrierB.id,
      effectiveDate: new Date('2025-01-01'),
      expiryDate: new Date('2025-12-31'),
      noticePeriodDays: 30,
      updateType: 'FULL',
      status: 'ACTIVE',
      confirmationSent: true,
    },
  });

  const pricelistC = await prisma.carrierPricelist.create({
    data: {
      carrierId: carrierC.id,
      effectiveDate: new Date('2025-01-01'),
      expiryDate: new Date('2025-12-31'),
      noticePeriodDays: 30,
      updateType: 'FULL',
      status: 'ACTIVE',
      confirmationSent: true,
    },
  });

  console.log('✅ Created 3 active pricelists\n');

  // Create sample rates with different pricing strategies
  console.log('Creating carrier rates...');

  // Carrier A - Good pricing for US, expensive for Asia
  const ratesA = await prisma.carrierRate.createMany({
    data: [
      // North America
      { pricelistId: pricelistA.id, destinationCode: '1', destinationName: 'USA & Canada', ratePerMinute: 0.0089, billingIncrement: 'PER_SECOND', asrPercentage: 92.5, acdSeconds: 180 },
      { pricelistId: pricelistA.id, destinationCode: '1212', destinationName: 'USA - New York', ratePerMinute: 0.0085, billingIncrement: 'PER_SECOND', asrPercentage: 94.0, acdSeconds: 200 },
      { pricelistId: pricelistA.id, destinationCode: '1310', destinationName: 'USA - Los Angeles', ratePerMinute: 0.0088, billingIncrement: 'PER_SECOND', asrPercentage: 93.2, acdSeconds: 190 },

      // Europe
      { pricelistId: pricelistA.id, destinationCode: '44', destinationName: 'United Kingdom', ratePerMinute: 0.0145, billingIncrement: 'PER_SECOND', asrPercentage: 89.0, acdSeconds: 150 },
      { pricelistId: pricelistA.id, destinationCode: '33', destinationName: 'France', ratePerMinute: 0.0160, billingIncrement: 'PER_SECOND', asrPercentage: 87.5, acdSeconds: 140 },
      { pricelistId: pricelistA.id, destinationCode: '49', destinationName: 'Germany', ratePerMinute: 0.0155, billingIncrement: 'PER_SECOND', asrPercentage: 88.0, acdSeconds: 145 },

      // Middle East
      { pricelistId: pricelistA.id, destinationCode: '971', destinationName: 'UAE', ratePerMinute: 0.0320, billingIncrement: 'PER_MINUTE', asrPercentage: 75.0, acdSeconds: 120 },
      { pricelistId: pricelistA.id, destinationCode: '966', destinationName: 'Saudi Arabia', ratePerMinute: 0.0340, billingIncrement: 'PER_MINUTE', asrPercentage: 73.0, acdSeconds: 110 },

      // Asia
      { pricelistId: pricelistA.id, destinationCode: '91', destinationName: 'India', ratePerMinute: 0.0280, billingIncrement: 'PER_MINUTE', asrPercentage: 82.0, acdSeconds: 160 },
      { pricelistId: pricelistA.id, destinationCode: '86', destinationName: 'China', ratePerMinute: 0.0380, billingIncrement: 'PER_MINUTE', asrPercentage: 68.0, acdSeconds: 90 },
      { pricelistId: pricelistA.id, destinationCode: '65', destinationName: 'Singapore', ratePerMinute: 0.0420, billingIncrement: 'PER_MINUTE', asrPercentage: 70.0, acdSeconds: 100 },
    ],
  });

  // Carrier B - Competitive on Europe, expensive on US
  const ratesB = await prisma.carrierRate.createMany({
    data: [
      // North America
      { pricelistId: pricelistB.id, destinationCode: '1', destinationName: 'USA & Canada', ratePerMinute: 0.0125, billingIncrement: 'PER_SECOND', asrPercentage: 88.0, acdSeconds: 170 },
      { pricelistId: pricelistB.id, destinationCode: '1212', destinationName: 'USA - New York', ratePerMinute: 0.0120, billingIncrement: 'PER_SECOND', asrPercentage: 89.5, acdSeconds: 180 },
      { pricelistId: pricelistB.id, destinationCode: '1310', destinationName: 'USA - Los Angeles', ratePerMinute: 0.0122, billingIncrement: 'PER_SECOND', asrPercentage: 88.8, acdSeconds: 175 },

      // Europe - BEST PRICING
      { pricelistId: pricelistB.id, destinationCode: '44', destinationName: 'United Kingdom', ratePerMinute: 0.0095, billingIncrement: 'PER_SECOND', asrPercentage: 95.0, acdSeconds: 210 },
      { pricelistId: pricelistB.id, destinationCode: '33', destinationName: 'France', ratePerMinute: 0.0098, billingIncrement: 'PER_SECOND', asrPercentage: 94.5, acdSeconds: 205 },
      { pricelistId: pricelistB.id, destinationCode: '49', destinationName: 'Germany', ratePerMinute: 0.0096, billingIncrement: 'PER_SECOND', asrPercentage: 94.8, acdSeconds: 208 },

      // Middle East
      { pricelistId: pricelistB.id, destinationCode: '971', destinationName: 'UAE', ratePerMinute: 0.0280, billingIncrement: 'PER_SECOND', asrPercentage: 80.0, acdSeconds: 140 },
      { pricelistId: pricelistB.id, destinationCode: '966', destinationName: 'Saudi Arabia', ratePerMinute: 0.0290, billingIncrement: 'PER_SECOND', asrPercentage: 78.0, acdSeconds: 135 },

      // Asia
      { pricelistId: pricelistB.id, destinationCode: '91', destinationName: 'India', ratePerMinute: 0.0240, billingIncrement: 'PER_SECOND', asrPercentage: 85.0, acdSeconds: 180 },
      { pricelistId: pricelistB.id, destinationCode: '86', destinationName: 'China', ratePerMinute: 0.0320, billingIncrement: 'PER_SECOND', asrPercentage: 72.0, acdSeconds: 110 },
      { pricelistId: pricelistB.id, destinationCode: '65', destinationName: 'Singapore', ratePerMinute: 0.0360, billingIncrement: 'PER_SECOND', asrPercentage: 75.0, acdSeconds: 120 },
    ],
  });

  // Carrier C - Best for Asia, competitive elsewhere
  const ratesC = await prisma.carrierRate.createMany({
    data: [
      // North America
      { pricelistId: pricelistC.id, destinationCode: '1', destinationName: 'USA & Canada', ratePerMinute: 0.0105, billingIncrement: 'PER_SECOND', asrPercentage: 90.0, acdSeconds: 185 },
      { pricelistId: pricelistC.id, destinationCode: '1212', destinationName: 'USA - New York', ratePerMinute: 0.0102, billingIncrement: 'PER_SECOND', asrPercentage: 91.0, acdSeconds: 190 },
      { pricelistId: pricelistC.id, destinationCode: '1310', destinationName: 'USA - Los Angeles', ratePerMinute: 0.0103, billingIncrement: 'PER_SECOND', asrPercentage: 90.5, acdSeconds: 188 },

      // Europe
      { pricelistId: pricelistC.id, destinationCode: '44', destinationName: 'United Kingdom', ratePerMinute: 0.0138, billingIncrement: 'PER_SECOND', asrPercentage: 86.0, acdSeconds: 155 },
      { pricelistId: pricelistC.id, destinationCode: '33', destinationName: 'France', ratePerMinute: 0.0142, billingIncrement: 'PER_SECOND', asrPercentage: 85.0, acdSeconds: 150 },
      { pricelistId: pricelistC.id, destinationCode: '49', destinationName: 'Germany', ratePerMinute: 0.0140, billingIncrement: 'PER_SECOND', asrPercentage: 85.5, acdSeconds: 152 },

      // Middle East
      { pricelistId: pricelistC.id, destinationCode: '971', destinationName: 'UAE', ratePerMinute: 0.0240, billingIncrement: 'PER_SECOND', asrPercentage: 88.0, acdSeconds: 170 },
      { pricelistId: pricelistC.id, destinationCode: '966', destinationName: 'Saudi Arabia', ratePerMinute: 0.0255, billingIncrement: 'PER_SECOND', asrPercentage: 85.0, acdSeconds: 165 },

      // Asia - BEST PRICING
      { pricelistId: pricelistC.id, destinationCode: '91', destinationName: 'India', ratePerMinute: 0.0180, billingIncrement: 'PER_SECOND', asrPercentage: 92.0, acdSeconds: 220 },
      { pricelistId: pricelistC.id, destinationCode: '86', destinationName: 'China', ratePerMinute: 0.0220, billingIncrement: 'PER_SECOND', asrPercentage: 88.0, acdSeconds: 195 },
      { pricelistId: pricelistC.id, destinationCode: '65', destinationName: 'Singapore', ratePerMinute: 0.0195, billingIncrement: 'PER_SECOND', asrPercentage: 96.0, acdSeconds: 240 },
    ],
  });

  console.log('✅ Created carrier rates:\n');
  console.log(`   - Carrier A (Global Carrier A): 11 rates - Best for US`);
  console.log(`   - Carrier B (TelecomHub Carrier B): 11 rates - Best for Europe`);
  console.log(`   - Carrier C (Asia-Pacific Carrier C): 11 rates - Best for Asia\n`);

  // Summary
  console.log('📊 Sample LCR Data Summary:');
  console.log('   ✓ 3 Active carrier partners');
  console.log('   ✓ 3 Active pricelists');
  console.log('   ✓ 33 Total rates across different destinations\n');

  console.log('💡 Demo Tips:');
  console.log('   - Try routing to "1" (USA) → Should recommend Carrier A ($0.0089)');
  console.log('   - Try routing to "44" (UK) → Should recommend Carrier B ($0.0095)');
  console.log('   - Try routing to "65" (Singapore) → Should recommend Carrier C ($0.0195)');
  console.log('   - Try routing to "91" (India) → Should recommend Carrier C ($0.0180)');
  console.log('   - Try routing to "971" (UAE) → Should recommend Carrier C ($0.0240)\n');

  console.log('✅ LCR demo data created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error creating sample data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
