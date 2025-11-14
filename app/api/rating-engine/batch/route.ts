import { NextRequest, NextResponse } from 'next/server';
import { CDR } from '@/lib/types';

/**
 * Batch CDR Processing Endpoint
 *
 * Processes large batches of CDRs (up to 10,000 per request)
 * Provides detailed statistics and error reporting
 *
 * POST /api/rating-engine/batch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cdrs: CDR[] = Array.isArray(body.cdrs) ? body.cdrs : [];

    if (cdrs.length === 0) {
      return NextResponse.json(
        { error: 'No CDRs provided in request body' },
        { status: 400 }
      );
    }

    if (cdrs.length > 10000) {
      return NextResponse.json(
        {
          error: 'Batch size exceeds maximum limit of 10,000 CDRs',
          provided: cdrs.length,
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Process CDRs by calling the rating engine
    const response = await fetch(
      `${request.nextUrl.origin}/api/rating-engine/rate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cdrs),
      }
    );

    if (!response.ok) {
      throw new Error('Rating engine processing failed');
    }

    const ratingResult = await response.json();
    const processedCDRs: CDR[] = ratingResult.cdrs;

    const endTime = Date.now();
    const processingTimeMs = endTime - startTime;

    // Calculate statistics
    const stats = {
      total: processedCDRs.length,
      rated: processedCDRs.filter((c) => c.processing_status === 'RATED').length,
      failed: processedCDRs.filter((c) => c.processing_status === 'FAILED').length,
      pending: processedCDRs.filter((c) => c.processing_status === 'PENDING').length,
    };

    // Group errors by message
    const errors: Record<string, number> = {};
    const failedCDRs = processedCDRs.filter((c) => c.processing_status === 'FAILED');
    failedCDRs.forEach((cdr) => {
      const errorMsg = cdr.error_message || 'Unknown error';
      errors[errorMsg] = (errors[errorMsg] || 0) + 1;
    });

    // Calculate total revenue
    let totalRevenue = 0;
    let currencyCounts: Record<string, number> = {};
    processedCDRs
      .filter((c) => c.processing_status === 'RATED' && c.charge)
      .forEach((cdr) => {
        totalRevenue += cdr.charge || 0;
        const currency = cdr.currency || 'USD';
        currencyCounts[currency] = (currencyCounts[currency] || 0) + (cdr.charge || 0);
      });

    // Group by service type
    const byServiceType: Record<string, number> = {};
    processedCDRs.forEach((cdr) => {
      const serviceType = cdr.call_type;
      byServiceType[serviceType] = (byServiceType[serviceType] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      batch_id: `BATCH-${Date.now()}`,
      processing_time_ms: processingTimeMs,
      processing_time_seconds: (processingTimeMs / 1000).toFixed(2),
      statistics: {
        ...stats,
        success_rate: ((stats.rated / stats.total) * 100).toFixed(2) + '%',
        by_service_type: byServiceType,
      },
      revenue: {
        total: totalRevenue.toFixed(4),
        by_currency: Object.entries(currencyCounts).map(([currency, amount]) => ({
          currency,
          amount: amount.toFixed(4),
        })),
      },
      errors:
        Object.keys(errors).length > 0
          ? Object.entries(errors).map(([message, count]) => ({
              message,
              count,
            }))
          : [],
      cdrs: processedCDRs,
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      {
        error: 'Batch processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for batch processing status
 */
export async function GET() {
  return NextResponse.json({
    service: 'Batch CDR Processing',
    status: 'operational',
    version: '1.0.0',
    limits: {
      max_batch_size: 10000,
      recommended_batch_size: 1000,
    },
    supported_formats: ['CDR', 'EDR'],
    capabilities: [
      'Bulk CDR rating',
      'Detailed statistics',
      'Error grouping',
      'Revenue calculation',
      'Multi-currency support',
    ],
  });
}
