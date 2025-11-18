'use client';

import { useState } from 'react';
import { PaymentMethod, PaymentStatus } from '@/lib/types';

interface PaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  invoiceTotal: number;
  totalPaid: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  invoiceId,
  invoiceNumber,
  invoiceTotal,
  totalPaid,
  currency,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const outstandingBalance = invoiceTotal - totalPaid;

  const [formData, setFormData] = useState({
    amount: outstandingBalance.toFixed(2),
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'BANK_TRANSFER' as PaymentMethod,
    reference_number: '',
    notes: '',
    status: 'CONFIRMED' as PaymentStatus,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          currency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record payment');
      }

      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 text-white p-6 rounded-t-xl" style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Record Payment</h2>
              <p className="mt-1" style={{ color: '#d1dcef' }}>Invoice {invoiceNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Invoice Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Invoice Total</div>
                <div className="text-lg font-bold text-gray-900">
                  {currency} {invoiceTotal.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Paid</div>
                <div className="text-lg font-bold text-green-600">
                  {currency} {totalPaid.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Outstanding</div>
                <div className="text-lg font-bold text-red-600">
                  {currency} {outstandingBalance.toFixed(2)}
                </div>
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

          <div className="space-y-4">
            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount * <span className="text-gray-500">({currency})</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                max={outstandingBalance}
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outlineColor: '#1f3d88' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outlineColor: '#1f3d88' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outlineColor: '#1f3d88' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="WIRE_TRANSFER">Wire Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CHEQUE">Cheque</option>
                <option value="NETTING">Netting</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                placeholder="Transaction ID, Check Number, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outlineColor: '#1f3d88' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outlineColor: '#1f3d88' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CLEARED">Cleared</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional payment details..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white rounded-lg transition disabled:opacity-50 flex items-center"
              style={{ backgroundColor: loading ? '#6b7280' : '#1f3d88' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#163368')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1f3d88')}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
