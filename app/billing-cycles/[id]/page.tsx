'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BillingCycle } from '@/lib/types';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils/helpers';
import Link from 'next/link';

export default function BillingCycleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.id as string;

  const [cycle, setCycle] = useState<BillingCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (cycleId) {
      fetchCycleDetails();
    }
  }, [cycleId]);

  const fetchCycleDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/billing-cycles/${cycleId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch billing cycle: ${response.status}`);
      }

      const data = await response.json();
      setCycle(data);
    } catch (error) {
      console.error('Failed to fetch billing cycle:', error);
      setError(error instanceof Error ? error.message : 'Failed to load billing cycle');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCycle = async () => {
    if (!confirm('Are you sure you want to close this billing cycle? This will calculate all totals from TAP records.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/billing-cycles/${cycleId}/close`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to close cycle');
      }

      await fetchCycleDetails();
      alert('Billing cycle closed successfully!');
    } catch (error) {
      console.error('Failed to close cycle:', error);
      alert(error instanceof Error ? error.message : 'Failed to close cycle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!confirm('Generate invoice from this billing cycle?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/billing-cycles/${cycleId}/generate-invoice`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const data = await response.json();
      alert('Invoice generated successfully!');
      router.push(`/invoices`);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate invoice');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading billing cycle...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Billing Cycle</h3>
          <p className="text-red-700 mb-4">{error || 'Billing cycle not found'}</p>
          <Link
            href="/billing-cycles"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Billing Cycles
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      case 'INVOICED':
        return 'bg-purple-100 text-purple-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/billing-cycles"
              className="text-purple-600 hover:text-purple-800"
            >
              ← Back to Billing Cycles
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {cycle.status === 'OPEN' && (
              <button
                onClick={handleCloseCycle}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Closing...' : 'Close Cycle'}
              </button>
            )}
            {cycle.status === 'CLOSED' && !cycle.invoice_id && (
              <button
                onClick={handleGenerateInvoice}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Generating...' : 'Generate Invoice'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing Cycle #{cycle.cycle_number}</h1>
            <p className="text-gray-600 mt-2">
              {cycle.partner?.partner_name} ({cycle.partner?.partner_code})
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(cycle.status)}`}>
            {cycle.status}
          </span>
        </div>
      </div>

      {/* Period Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Billing Period</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Period Start</div>
            <div className="text-lg font-semibold text-gray-900">{formatDate(cycle.period_start)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Period End</div>
            <div className="text-lg font-semibold text-gray-900">{formatDate(cycle.period_end)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Cut-off Date</div>
            <div className="text-lg font-semibold text-gray-900">{formatDate(cycle.cut_off_date)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Due Date</div>
            <div className="text-lg font-semibold text-gray-900">{formatDate(cycle.due_date)}</div>
          </div>
        </div>
      </div>

      {/* Traffic Summary */}
      {(cycle.status === 'CLOSED' || cycle.status === 'INVOICED') && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">Voice Minutes</div>
              <div className="text-3xl font-bold text-blue-900">
                {formatNumber(cycle.total_voice_minutes || 0)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">SMS Count</div>
              <div className="text-3xl font-bold text-green-900">
                {formatNumber(cycle.total_sms_count || 0)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">Data (MB)</div>
              <div className="text-3xl font-bold text-purple-900">
                {formatNumber(cycle.total_data_mb || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {(cycle.status === 'CLOSED' || cycle.status === 'INVOICED') && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Charges</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(cycle.total_charges || 0, cycle.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Cost</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(cycle.total_cost || 0, cycle.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Margin</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(cycle.margin || 0, cycle.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Currency</div>
              <div className="text-2xl font-bold text-gray-900">{cycle.currency}</div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Information */}
      {cycle.invoice && (
        <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl border border-purple-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Associated Invoice</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-purple-900 mb-2">
                {cycle.invoice.invoice_number}
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <div>Status: <span className="font-semibold">{cycle.invoice.status}</span></div>
                <div>Total: <span className="font-semibold">{formatCurrency(cycle.invoice.total_amount, cycle.currency)}</span></div>
                <div>Invoice Date: <span className="font-semibold">{formatDate(cycle.invoice.invoice_date)}</span></div>
                <div>Due Date: <span className="font-semibold">{formatDate(cycle.invoice.due_date)}</span></div>
              </div>
            </div>
            <Link
              href={`/invoices`}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              View Invoice
            </Link>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Created</span>
            <span className="font-semibold text-gray-900">{formatDate(cycle.created_at)}</span>
          </div>
          {cycle.closed_at && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Closed</span>
              <span className="font-semibold text-gray-900">{formatDate(cycle.closed_at)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-semibold text-gray-900">{formatDate(cycle.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
