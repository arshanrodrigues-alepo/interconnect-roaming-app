'use client';

import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils/helpers';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
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
          <div className="text-3xl font-bold text-purple-600">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading invoices...</div>
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
                      <div className="font-medium text-purple-600">
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
                        <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">
                          View Details
                        </button>
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
                      {item.service_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.direction}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {item.total_units.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      ${item.rate.toFixed(6)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(item.amount, invoices[0].currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-purple-600 text-right">
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
