'use client';

import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils/helpers';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/invoices?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.invoices)) {
        throw new Error('Invalid response format from server');
      }

      setInvoices(data.invoices);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setError(error instanceof Error ? error.message : 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    return invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
        <p className="text-gray-600 mt-2">View and manage partner invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Invoices</div>
          <div className="text-3xl font-bold text-gray-900">{invoices.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Amount</div>
          <div className="text-3xl font-bold" style={{ color: '#1f3d88' }}>
            {formatCurrency(getTotalAmount())}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Paid</div>
          <div className="text-3xl font-bold text-green-600">
            {invoices.filter((i) => i.status === 'PAID').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Disputed</div>
          <div className="text-3xl font-bold text-red-600">
            {invoices.filter((i) => i.status === 'DISPUTED').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
              style={{ outlineColor: '#1f3d88' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PAID">Paid</option>
              <option value="DISPUTED">Disputed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading invoices...</div>
        ) : error ? (
          <div className="p-8 text-center text-gray-500">Unable to load invoices. Please try again.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Invoice Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Billing Period
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Currency
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Invoice Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium" style={{ color: '#1f3d88' }}>
                        {invoice.invoice_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(invoice.billing_period_start)} -{' '}
                      {formatDate(invoice.billing_period_end)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{invoice.currency}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/invoices/${invoice.invoice_id}`}
                          className="px-3 py-1 text-xs text-white rounded"
                          style={{ backgroundColor: '#1f3d88' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163368'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f3d88'}
                        >
                          View Details
                        </Link>
                        {invoice.status === 'ISSUED' && (
                          <button className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700">
                            Raise Dispute
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Line Items for First Invoice (Example) */}
      {invoices.length > 0 && invoices[0].line_items && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Sample Invoice Breakdown - {invoices[0].invoice_number}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Service Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Direction
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Total Units
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices[0].line_items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.service_type || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.direction || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {(item.total_units ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      ${(item.rate ?? 0).toFixed(6)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(item.amount ?? 0, invoices[0].currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right" style={{ color: '#1f3d88' }}>
                    {formatCurrency(invoices[0].total_amount, invoices[0].currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
