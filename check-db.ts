import prisma from './lib/db/prisma.js';

async function main() {
  const partners = await prisma.partner.count();
  const cycles = await prisma.billingCycle.count();
  const tapFiles = await prisma.tAPFile.count();

  console.log('Database status:');
  console.log('  Partners:', partners);
  console.log('  Billing Cycles:', cycles);
  console.log('  TAP Files:', tapFiles);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
