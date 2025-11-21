/**
 * Test script for automatic billing cycle creation job
 */

async function testCycleCreationJob() {
  console.log('🧪 Testing Automatic Billing Cycle Creation Job\n');

  // Test 1: Preview what would be created
  console.log('📋 Step 1: Preview billing cycles that would be created...\n');

  const previewResponse = await fetch('http://localhost:3000/api/jobs/create-billing-cycles');

  if (!previewResponse.ok) {
    throw new Error('Preview request failed');
  }

  const preview = await previewResponse.json();

  console.log('Period:', preview.period.start, 'to', preview.period.end);
  console.log('Total Active Partners:', preview.total_partners);
  console.log('Cycles to Create:', preview.will_create);
  console.log('\nPartner Preview:');

  preview.preview.forEach((p: any) => {
    const status = p.would_create
      ? '✅ Will create'
      : p.cycle_exists
      ? '⏭️  Already exists'
      : '⚠️  No active agreement';

    console.log(
      `  ${status} - ${p.partner_name} (${p.partner_code}) - Next cycle #${p.next_cycle_number}`
    );
  });

  // Test 2: Create cycles for next month (offset = 1)
  console.log('\n\n🚀 Step 2: Creating billing cycles for next month...\n');

  const createResponse = await fetch(
    'http://localhost:3000/api/jobs/create-billing-cycles?month_offset=1',
    {
      method: 'POST',
    }
  );

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Creation failed: ${error.error}`);
  }

  const result = await createResponse.json();

  console.log('Summary:');
  console.log('  Period:', result.summary.period.start, 'to', result.summary.period.end);
  console.log('  Total Partners:', result.summary.total_partners);
  console.log('  Cycles Created:', result.summary.cycles_created);
  console.log('  Partners Skipped:', result.summary.partners_skipped);
  console.log('  Errors:', result.summary.errors);

  if (result.created_cycles.length > 0) {
    console.log('\n✅ Created Cycles:');
    result.created_cycles.forEach((c: any) => {
      console.log(
        `  - ${c.partner_name}: Cycle #${c.cycle_number} (${c.period_start} to ${c.period_end})`
      );
    });
  }

  if (result.skipped_partners.length > 0) {
    console.log('\n⏭️  Skipped Partners:');
    result.skipped_partners.forEach((p: any) => {
      console.log(`  - ${p.partner_name}: ${p.reason}`);
    });
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((e: any) => {
      console.log(`  - ${e.partner_name}: ${e.error}`);
    });
  }

  // Test 3: Try creating again (should skip all as they already exist)
  console.log('\n\n🔄 Step 3: Running job again (should skip existing cycles)...\n');

  const retryResponse = await fetch(
    'http://localhost:3000/api/jobs/create-billing-cycles?month_offset=1',
    {
      method: 'POST',
    }
  );

  if (!retryResponse.ok) {
    throw new Error('Retry request failed');
  }

  const retryResult = await retryResponse.json();

  console.log('Retry Summary:');
  console.log('  Cycles Created:', retryResult.summary.cycles_created);
  console.log('  Partners Skipped:', retryResult.summary.partners_skipped);
  console.log('  (All should be skipped as cycles already exist)');

  console.log('\n✨ Automatic Billing Cycle Job tested successfully!\n');
}

testCycleCreationJob().catch((e) => {
  console.error('\n❌ Error:', e.message);
  console.error(e);
  process.exit(1);
});
