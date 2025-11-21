'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BillingCycle, Partner, BillingCycleStatus } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils/helpers';

export default function BillingCyclesPage() {
  const searchParams = useSearchParams();
  const [cycles, setCycles] = useState<BillingCycle[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    searchParams.get('partner') || ''
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get('status') || ''
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Form state for creating new cycle
  const [newCycle, setNewCycle] = useState({
    partner_id: '',
    period_start: '',
    period_end: '',
    cut_off_date: '',
    due_date: '',
    currency: 'USD',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    fetchCycles();
  }, [selectedPartnerId, selectedStatus]);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners || []);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    }
  };

  const fetchCycles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedPartnerId) params.append('partner_id', selectedPartnerId);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/billing-cycles?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch billing cycles');
      }

      const data = await response.json();
      setCycles(data.cycles || []);
    } catch (error) {
      console.error('Failed to fetch billing cycles:', error);
      setError(error instanceof Error ? error.message : 'Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const response = await fetch('/api/billing-cycles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCycle),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create billing cycle');
      }

      setShowCreateModal(false);
      setNewCycle({
        partner_id: '',
        period_start: '',
        period_end: '',
        cut_off_date: '',
        due_date: '',
        currency: 'USD',
      });
      fetchCycles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create billing cycle');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCloseCycle = async (cycleId: string) => {
    if (!confirm('Are you sure you want to close this billing cycle? This will calculate final totals.')) {
      return;
    }

    try {
      const response = await fetch(`/api/billing-cycles/${cycleId}/close`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close cycle');
      }

      fetchCycles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to close cycle');
    }
  };

  const handleGenerateInvoice = async (cycleId: string) => {
    if (!confirm('Generate invoice for this billing cycle?')) {
      return;
    }

    try {
      const response = await fetch(`/api/billing-cycles/${cycleId}/generate-invoice`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate invoice');
      }

      const invoice = await response.json();
      alert(`Invoice ${invoice.invoice_number} generated successfully!`);
      fetchCycles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate invoice');
    }
  };

  const handleDeleteCycle = async (cycleId: string, cycleNumber: number) => {
    if (!confirm(`Are you sure you want to delete billing cycle #${cycleNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/billing-cycles/${cycleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete billing cycle');
      }

      alert('Billing cycle deleted successfully');
      fetchCycles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete billing cycle');
    }
  };

  const getStatusBadgeColor = (status: BillingCycleStatus) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      CLOSED: 'bg-green-100 text-green-800',
      INVOICED: 'bg-blue-100 text-blue-800',
      DISPUTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && cycles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading billing cycles...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing Cycles</h1>
            <p className="text-gray-600 mt-2">
              Manage billing periods and generate wholesale invoices
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + Create Billing Cycle
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Partner
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">All Partners</option>
              {partners.map((p) => (
                <option key={p.partner_id} value={p.partner_id}>
                  {p.partner_name} ({p.partner_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="PROCESSING">Processing</option>
              <option value="CLOSED">Closed</option>
              <option value="INVOICED">Invoiced</option>
              <option value="DISPUTED">Disputed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Billing Cycles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cycle #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Charges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cycles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No billing cycles found. Create one to get started.
                  </td>
                </tr>
              ) : (
                cycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{cycle.cycle_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cycle.partner?.partner_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cycle.partner?.partner_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(cycle.period_start).toLocaleDateString()} -{' '}
                        {new Date(cycle.period_end).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {new Date(cycle.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          cycle.status
                        )}`}
                      >
                        {cycle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cycle.total_charges
                        ? formatCurrency(cycle.total_charges)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {cycle.margin ? formatCurrency(cycle.margin) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cycle.invoice ? (
                        <a
                          href={`/invoices/${cycle.invoice_id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {cycle.invoice.invoice_number}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {cycle.status === 'OPEN' && (
                          <button
                            onClick={() => handleCloseCycle(cycle.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Close
                          </button>
                        )}
                        {cycle.status === 'CLOSED' && !cycle.invoice_id && (
                          <button
                            onClick={() => handleGenerateInvoice(cycle.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Generate Invoice
                          </button>
                        )}
                        <a
                          href={`/billing-cycles/${cycle.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                        {(cycle.status === 'OPEN' || cycle.status === 'PROCESSING') && !cycle.invoice_id && (
                          <button
                            onClick={() => handleDeleteCycle(cycle.id, cycle.cycle_number)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Billing Cycle</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCycle}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner *
                  </label>
                  <select
                    required
                    value={newCycle.partner_id}
                    onChange={(e) => setNewCycle({ ...newCycle, partner_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Partner</option>
                    {partners.map((p) => (
                      <option key={p.partner_id} value={p.partner_id}>
                        {p.partner_name} ({p.partner_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period Start *
                    </label>
                    <input
                      type="date"
                      required
                      value={newCycle.period_start}
                      onChange={(e) =>
                        setNewCycle({ ...newCycle, period_start: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period End *
                    </label>
                    <input
                      type="date"
                      required
                      value={newCycle.period_end}
                      onChange={(e) =>
                        setNewCycle({ ...newCycle, period_end: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cut-off Date (optional)
                    </label>
                    <input
                      type="date"
                      value={newCycle.cut_off_date}
                      onChange={(e) =>
                        setNewCycle({ ...newCycle, cut_off_date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Defaults to 5 days after period end
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date (optional)
                    </label>
                    <input
                      type="date"
                      value={newCycle.due_date}
                      onChange={(e) =>
                        setNewCycle({ ...newCycle, due_date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Defaults to 30 days after period end
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={newCycle.currency}
                    onChange={(e) => setNewCycle({ ...newCycle, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Billing Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
