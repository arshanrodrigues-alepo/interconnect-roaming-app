import prisma from './lib/db/prisma.js';

async function createSampleCycles() {
  console.log('📅 Creating sample billing cycles...\n');

  // Clear existing cycles
  await prisma.billingCycle.deleteMany();
  console.log('✨ Cleared existing billing cycles\n');

  // Get partners
  const verizon = await prisma.partner.findFirst({
    where: { partnerCode: 'USAVZ1' },
  });

  const tmobile = await prisma.partner.findFirst({
    where: { partnerCode: 'GBRTM1' },
  });

  const docomo = await prisma.partner.findFirst({
    where: { partnerCode: 'JPNDO1' },
  });

  if (!verizon || !tmobile || !docomo) {
    throw new Error('Partners not found');
  }

  // Create January 2025 cycle for Verizon (OPEN)
  const verizonCycle = await prisma.billingCycle.create({
    data: {
      partnerId: verizon.id,
      cycleNumber: 1,
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-01-31'),
      cutOffDate: new Date('2025-02-05'),
      dueDate: new Date('2025-03-02'),
      currency: 'USD',
      status: 'OPEN',
    },
  });

  console.log('✅ Created Verizon January cycle');
  console.log('   Cycle #:', verizonCycle.cycleNumber);
  console.log('   Status:', verizonCycle.status);

  // Create December 2024 cycle for T-Mobile UK (CLOSED with data)
  const tmobileCycle = await prisma.billingCycle.create({
    data: {
      partnerId: tmobile.id,
      cycleNumber: 1,
      periodStart: new Date('2024-12-01'),
      periodEnd: new Date('2024-12-31'),
      cutOffDate: new Date('2025-01-05'),
      dueDate: new Date('2025-01-30'),
      currency: 'GBP',
      status: 'CLOSED',
      totalMinutes: 125430,
      totalSMS: 45678,
      totalDataMB: 98234,
      subtotal: 12543.50,
      totalAmount: 12543.50,
      closedAt: new Date('2025-01-05'),
    },
  });

  console.log('✅ Created T-Mobile December cycle (closed)');
  console.log('   Cycle #:', tmobileCycle.cycleNumber);
  console.log('   Status:', tmobileCycle.status);
  console.log('   Total Amount: £', tmobileCycle.totalAmount);

  // Create November 2024 cycle for Docomo (INVOICED)
  const docomoCycle = await prisma.billingCycle.create({
    data: {
      partnerId: docomo.id,
      cycleNumber: 1,
      periodStart: new Date('2024-11-01'),
      periodEnd: new Date('2024-11-30'),
      cutOffDate: new Date('2024-12-05'),
      dueDate: new Date('2025-01-04'),
      currency: 'JPY',
      status: 'INVOICED',
      totalMinutes: 89245,
      totalSMS: 23456,
      totalDataMB: 67890,
      subtotal: 456789,
      totalAmount: 456789,
      closedAt: new Date('2024-12-05'),
    },
  });

  console.log('✅ Created Docomo November cycle (invoiced)');
  console.log('   Cycle #:', docomoCycle.cycleNumber);
  console.log('   Status:', docomoCycle.status);
  console.log('   Total Amount: ¥', docomoCycle.totalAmount);

  // Create February 2025 cycle for Verizon (OPEN)
  const verizonFebCycle = await prisma.billingCycle.create({
    data: {
      partnerId: verizon.id,
      cycleNumber: 2,
      periodStart: new Date('2025-02-01'),
      periodEnd: new Date('2025-02-28'),
      cutOffDate: new Date('2025-03-05'),
      dueDate: new Date('2025-04-01'),
      currency: 'USD',
      status: 'OPEN',
    },
  });

  console.log('✅ Created Verizon February cycle');
  console.log('   Cycle #:', verizonFebCycle.cycleNumber);
  console.log('   Status:', verizonFebCycle.status);

  console.log('\n📊 Summary:');
  const totalCycles = await prisma.billingCycle.count();
  console.log('   Total billing cycles:', totalCycles);

  const cyclesByStatus = await prisma.billingCycle.groupBy({
    by: ['status'],
    _count: true,
  });

  cyclesByStatus.forEach((group) => {
    console.log(`   ${group.status}:`, group._count);
  });

  console.log('\n✨ Sample billing cycles created successfully!\n');
}

createSampleCycles()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
