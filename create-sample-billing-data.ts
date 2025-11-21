import prisma from './lib/db/prisma';

async function main() {
  console.log('🏗️  Creating sample billing cycles and TAP records...\n');

  // Get all partners
  const partners = await prisma.partner.findMany({
    where: { status: 'ACTIVE' },
    take: 3,
  });

  console.log(`Found ${partners.length} active partners\n`);

  for (const partner of partners) {
    console.log(`📊 Creating billing cycle for ${partner.partnerName}...`);

    // Create an open billing cycle for current month
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const cutOffDate = new Date(periodEnd);
    cutOffDate.setDate(cutOffDate.getDate() + 5);
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 30);

    const cycle = await prisma.billingCycle.create({
      data: {
        partnerId: partner.id,
        cycleNumber: 1,
        periodStart,
        periodEnd,
        cutOffDate,
        dueDate,
        status: 'OPEN',
        currency: 'USD',
        totalVoiceMinutes: 0,
        totalSmsCount: 0,
        totalDataMb: 0,
        totalCharges: 0,
        totalCost: 0,
        margin: 0,
      },
    });

    console.log(`  ✅ Created cycle ${cycle.id}`);

    // Create a TAP file
    const tapFile = await prisma.tAPFile.create({
      data: {
        partnerId: partner.id,
        filename: `TAP_${partner.partnerCode}_${now.toISOString().split('T')[0]}.json`,
        fileSizeBytes: 5000,
        direction: 'INBOUND',
        status: 'RATED',
        uploadTimestamp: new Date(),
        processedTimestamp: new Date(),
        recordsCount: 100,
        totalCharges: 450.75,
      },
    });

    console.log(`  ✅ Created TAP file ${tapFile.id}`);

    // Create TAP records
    const tapRecords = [];
    for (let i = 0; i < 100; i++) {
      const isVoice = i % 3 === 0;
      const isSms = i % 3 === 1;
      const isData = i % 3 === 2;

      const callDateTime = new Date(periodStart);
      callDateTime.setDate(callDateTime.getDate() + Math.floor(Math.random() * 28));
      callDateTime.setHours(Math.floor(Math.random() * 24));

      tapRecords.push({
        tapFileId: tapFile.id,
        partnerId: partner.id,
        serviceType: isVoice ? 'VOICE' : isSms ? 'SMS' : 'DATA',
        callDateTime,
        msisdn: `+1555${String(i).padStart(7, '0')}`,
        imsi: `310150${String(i).padStart(9, '0')}`,
        callingNumber: `+1555${String(i).padStart(7, '0')}`,
        calledNumber: `+44${String(1000000 + i)}`,
        durationSeconds: isVoice ? Math.floor(Math.random() * 600) + 60 : null,
        messageCount: isSms ? 1 : null,
        dataVolumeMb: isData ? Math.floor(Math.random() * 500) + 10 : null,
        chargedAmount: isVoice
          ? Math.random() * 5 + 0.5
          : isSms
          ? Math.random() * 0.5 + 0.1
          : Math.random() * 10 + 1,
        currency: 'USD',
        processingStatus: 'RATED',
      });
    }

    await prisma.tAPRecord.createMany({ data: tapRecords });
    console.log(`  ✅ Created ${tapRecords.length} TAP records`);

    // Calculate aggregates
    const voiceRecords = tapRecords.filter((r) => r.serviceType === 'VOICE');
    const smsRecords = tapRecords.filter((r) => r.serviceType === 'SMS');
    const dataRecords = tapRecords.filter((r) => r.serviceType === 'DATA');

    const totalVoiceMinutes =
      voiceRecords.reduce((sum, r) => sum + (r.durationSeconds || 0), 0) / 60;
    const totalSmsCount = smsRecords.reduce((sum, r) => sum + (r.messageCount || 0), 0);
    const totalDataMb = dataRecords.reduce((sum, r) => sum + (r.dataVolumeMb || 0), 0);
    const totalCharges = tapRecords.reduce((sum, r) => sum + (r.chargedAmount || 0), 0);
    const totalCost = totalCharges * 0.7; // 30% margin
    const margin = totalCharges - totalCost;

    // Update cycle
    await prisma.billingCycle.update({
      where: { id: cycle.id },
      data: {
        totalVoiceMinutes,
        totalSmsCount,
        totalDataMb,
        totalCharges,
        totalCost,
        margin,
      },
    });

    console.log(`  ✅ Updated cycle with aggregates:`);
    console.log(`     Voice: ${totalVoiceMinutes.toFixed(2)} minutes`);
    console.log(`     SMS: ${totalSmsCount} messages`);
    console.log(`     Data: ${totalDataMb.toFixed(2)} MB`);
    console.log(`     Charges: $${totalCharges.toFixed(2)}`);
    console.log(`     Margin: $${margin.toFixed(2)}\n`);
  }

  console.log('✨ Sample billing data created successfully!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
