import prisma from './lib/db/prisma.js';

async function testBillingCycleAPI() {
  console.log('🧪 Testing Billing Cycle API...\n');

  // Get Verizon partner
  const verizon = await prisma.partner.findFirst({
    where: { partnerCode: 'USAVZ1' },
  });

  if (!verizon) {
    throw new Error('Verizon partner not found');
  }

  console.log('✅ Found partner:', verizon.partnerName);
  console.log('   Partner ID:', verizon.id);

  // Create a billing cycle for January 2025
  const cycleData = {
    partner_id: verizon.id,
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    currency: 'USD',
  };

  console.log('\n📝 Creating billing cycle...');
  console.log('   Period: January 1-31, 2025');

  const createResponse = await fetch('http://localhost:3000/api/billing-cycles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cycleData),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Failed to create cycle: ${error.error}`);
  }

  const createdCycle = await createResponse.json();
  console.log('✅ Billing cycle created:');
  console.log('   Cycle ID:', createdCycle.id);
  console.log('   Cycle Number:', createdCycle.cycle_number);
  console.log('   Status:', createdCycle.status);
  console.log('   Cut-off Date:', createdCycle.cut_off_date);
  console.log('   Due Date:', createdCycle.due_date);

  // Test GET endpoint
  console.log('\n📖 Fetching billing cycle details...');
  const getResponse = await fetch(`http://localhost:3000/api/billing-cycles/${createdCycle.id}`);

  if (!getResponse.ok) {
    throw new Error('Failed to fetch cycle');
  }

  const fetchedCycle = await getResponse.json();
  console.log('✅ Cycle fetched successfully');
  console.log('   Partner:', fetchedCycle.partner.partner_name);
  console.log('   Status:', fetchedCycle.status);

  // Test LIST endpoint
  console.log('\n📋 Listing all billing cycles...');
  const listResponse = await fetch(`http://localhost:3000/api/billing-cycles`);

  if (!listResponse.ok) {
    throw new Error('Failed to list cycles');
  }

  const listData = await listResponse.json();
  console.log('✅ Found', listData.total, 'billing cycle(s)');

  // Test CLOSE endpoint (this will calculate totals from TAP files)
  console.log('\n🔒 Closing billing cycle...');
  const closeResponse = await fetch(
    `http://localhost:3000/api/billing-cycles/${createdCycle.id}/close`,
    {
      method: 'POST',
    }
  );

  if (!closeResponse.ok) {
    const error = await closeResponse.json();
    console.log('⚠️  Close failed (expected - no TAP files in period):', error.error);
  } else {
    const closedCycle = await closeResponse.json();
    console.log('✅ Cycle closed successfully');
    console.log('   Status:', closedCycle.status);
    console.log('   Total Voice Minutes:', closedCycle.total_voice_minutes);
    console.log('   Total SMS Count:', closedCycle.total_sms_count);
    console.log('   Total Charges:', closedCycle.total_charges);
    console.log('   Margin:', closedCycle.margin);

    // Test GENERATE INVOICE endpoint
    console.log('\n🧾 Generating invoice...');
    const invoiceResponse = await fetch(
      `http://localhost:3000/api/billing-cycles/${createdCycle.id}/generate-invoice`,
      {
        method: 'POST',
      }
    );

    if (!invoiceResponse.ok) {
      const error = await invoiceResponse.json();
      console.log('⚠️  Invoice generation failed:', error.error);
    } else {
      const invoice = await invoiceResponse.json();
      console.log('✅ Invoice generated successfully');
      console.log('   Invoice Number:', invoice.invoice_number);
      console.log('   Subtotal:', invoice.subtotal);
      console.log('   Tax:', invoice.tax_amount);
      console.log('   Total:', invoice.total_amount);
    }
  }

  console.log('\n✨ API testing completed!\n');
}

testBillingCycleAPI()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
