import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { CDR } from '@/lib/types';

/**
 * Rating Engine API Endpoint
 *
 * Processes CDRs/EDRs and calculates charges based on:
 * - Partner status (must be ACTIVE)
 * - Rate sheets with effective dates
 * - Service type, direction, and called number prefix
 *
 * POST /api/rating-engine/rate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cdrs: CDR[] = Array.isArray(body) ? body : [body];

    if (cdrs.length === 0) {
      return NextResponse.json(
        { error: 'No CDRs provided' },
        { status: 400 }
      );
    }

    const results: CDR[] = [];

    for (const cdr of cdrs) {
      const ratedCDR = await processCDR(cdr);
      results.push(ratedCDR);
    }

    return NextResponse.json({
      success: true,
      processed_count: results.length,
      cdrs: results,
    });
  } catch (error) {
    console.error('Rating engine error:', error);
    return NextResponse.json(
      { error: 'Rating engine processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Process a single CDR and calculate charges
 */
async function processCDR(cdr: CDR): Promise<CDR> {
  // Step 1: Validate required fields
  const validationError = validateCDR(cdr);
  if (validationError) {
    return {
      ...cdr,
      processing_status: 'FAILED',
      error_message: validationError,
    };
  }

  // Step 2: Look up partner
  const partner = await getPartner(cdr.operator_id);
  if (!partner) {
    return {
      ...cdr,
      processing_status: 'FAILED',
      error_message: `Partner not found: ${cdr.operator_id}`,
    };
  }

  // Step 3: Check if partner is ACTIVE
  if (partner.status !== 'ACTIVE') {
    return {
      ...cdr,
      processing_status: 'FAILED',
      error_message: `Partner ${partner.partner_code} is not ACTIVE. Current status: ${partner.status}`,
    };
  }

  // Step 4: Get active rate sheet for partner
  const rateSheet = await getActiveRateSheet(partner.partner_id, cdr.date_of_event);
  if (!rateSheet) {
    return {
      ...cdr,
      processing_status: 'FAILED',
      error_message: `No active rate sheet found for partner ${partner.partner_code}`,
    };
  }

  // Step 5: Find applicable rate
  const rate = await findApplicableRate(
    rateSheet.rate_sheet_id,
    cdr.call_type,
    cdr.direction,
    cdr.called_number
  );

  if (!rate) {
    return {
      ...cdr,
      processing_status: 'FAILED',
      error_message: `No rate found for ${cdr.call_type} ${cdr.direction} to ${cdr.called_number}`,
    };
  }

  // Step 6: Calculate charge
  const charge = calculateCharge(cdr, rate);

  // Step 7: Return rated CDR
  return {
    ...cdr,
    charge: charge,
    currency: rate.currency,
    rate_applied: rate.rate_per_unit,
    processing_status: 'RATED',
  };
}

/**
 * Validate CDR has all required fields
 */
function validateCDR(cdr: CDR): string | null {
  if (!cdr.calling_number) return 'Missing calling_number';
  if (!cdr.called_number) return 'Missing called_number';
  if (!cdr.call_type) return 'Missing call_type';
  if (!cdr.direction) return 'Missing direction';
  if (!cdr.date_of_event) return 'Missing date_of_event';
  if (!cdr.operator_id) return 'Missing operator_id';

  // Validate duration for VOICE calls
  if (cdr.call_type === 'VOICE' && (cdr.duration === undefined || cdr.duration < 0)) {
    return 'Missing or invalid duration for VOICE call';
  }

  // Validate number_of_events for SMS
  if (cdr.call_type === 'SMS' && (cdr.number_of_events === undefined || cdr.number_of_events < 1)) {
    return 'Missing or invalid number_of_events for SMS';
  }

  return null;
}

/**
 * Get partner by operator_id
 */
async function getPartner(operatorId: string): Promise<any | null> {
  const partner = await prisma.partner.findUnique({
    where: { id: operatorId },
  });

  if (!partner) return null;

  // Transform to match expected format
  return {
    partner_id: partner.id,
    partner_code: partner.partnerCode,
    partner_name: partner.partnerName,
    status: partner.status,
  };
}

/**
 * Get active rate sheet for partner at given date
 */
async function getActiveRateSheet(
  partnerId: string,
  eventDate: string
): Promise<any | null> {
  const eventDateTime = new Date(eventDate);

  // Find active rate sheets for this partner
  const rateSheets = await prisma.rateSheet.findMany({
    where: {
      partnerId,
      isActive: true,
      effectiveDate: {
        lte: eventDateTime,
      },
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: eventDateTime } },
      ],
    },
    orderBy: {
      effectiveDate: 'desc',
    },
    take: 1,
  });

  if (rateSheets.length === 0) {
    return null;
  }

  const rateSheet = rateSheets[0];

  // Transform to match expected format
  return {
    rate_sheet_id: rateSheet.id,
    partner_id: rateSheet.partnerId,
    rate_sheet_name: rateSheet.rateSheetName,
    effective_date: rateSheet.effectiveDate.toISOString().split('T')[0],
    expiry_date: rateSheet.expiryDate?.toISOString().split('T')[0] || null,
    is_active: rateSheet.isActive,
  };
}

/**
 * Find applicable rate based on service type, direction, and destination prefix
 */
async function findApplicableRate(
  rateSheetId: string,
  callType: 'VOICE' | 'SMS',
  direction: 'INCOMING' | 'OUTGOING',
  calledNumber: string
): Promise<any | null> {
  // Convert direction to match Rate type
  const rateDirection = direction === 'INCOMING' ? 'INBOUND' : 'OUTBOUND';

  // Find all rates for this rate sheet that match service type and direction
  const matchingRates = await prisma.rate.findMany({
    where: {
      rateSheetId,
      serviceType: callType,
      direction: rateDirection,
    },
  });

  if (matchingRates.length === 0) {
    return null;
  }

  // Find the best matching rate by prefix (longest match first)
  const prefixMatches = matchingRates.filter(
    (r) => r.calledNumberPrefix && calledNumber.startsWith(r.calledNumberPrefix)
  );

  if (prefixMatches.length > 0) {
    // Sort by prefix length (longest first)
    prefixMatches.sort(
      (a, b) => (b.calledNumberPrefix?.length || 0) - (a.calledNumberPrefix?.length || 0)
    );

    const rate = prefixMatches[0];
    return {
      rate_id: rate.id,
      rate_sheet_id: rate.rateSheetId,
      service_type: rate.serviceType,
      direction: rate.direction,
      called_number_prefix: rate.calledNumberPrefix,
      rate_per_unit: parseFloat(rate.ratePerUnit.toString()),
      currency: rate.currency,
      minimum_charge: rate.minimumCharge ? parseFloat(rate.minimumCharge.toString()) : null,
      rounding_rule: rate.roundingRule,
    };
  }

  // Return first matching rate as fallback
  const rate = matchingRates[0];
  return {
    rate_id: rate.id,
    rate_sheet_id: rate.rateSheetId,
    service_type: rate.serviceType,
    direction: rate.direction,
    called_number_prefix: rate.calledNumberPrefix,
    rate_per_unit: parseFloat(rate.ratePerUnit.toString()),
    currency: rate.currency,
    minimum_charge: rate.minimumCharge ? parseFloat(rate.minimumCharge.toString()) : null,
    rounding_rule: rate.roundingRule,
  };
}

/**
 * Calculate charge based on CDR and rate
 */
function calculateCharge(cdr: CDR, rate: any): number {
  let charge = 0;

  if (cdr.call_type === 'VOICE') {
    // Calculate based on duration (in seconds)
    const duration = cdr.duration || 0;

    // Apply rounding rule
    let billableDuration = duration;
    if (rate.rounding_rule === 'UP' && duration > 0) {
      // Round up to next 60 seconds (1 minute)
      billableDuration = Math.ceil(duration / 60) * 60;
    } else if (rate.rounding_rule === 'DOWN') {
      billableDuration = Math.floor(duration / 60) * 60;
    } else if (rate.rounding_rule === 'NEAREST') {
      billableDuration = Math.round(duration / 60) * 60;
    }

    charge = billableDuration * rate.rate_per_unit;
  } else if (cdr.call_type === 'SMS') {
    // Calculate based on number of messages
    const messages = cdr.number_of_events || 1;
    charge = messages * rate.rate_per_unit;
  }

  // Apply minimum charge if applicable
  if (rate.minimum_charge && charge < rate.minimum_charge) {
    charge = rate.minimum_charge;
  }

  // Round to 4 decimal places
  return Math.round(charge * 10000) / 10000;
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    service: 'Rating Engine',
    status: 'operational',
    version: '1.0.0',
    capabilities: [
      'Voice call rating',
      'SMS rating',
      'Prefix-based routing',
      'Minimum charge enforcement',
      'Duration rounding',
      'Partner status validation',
    ],
  });
}
