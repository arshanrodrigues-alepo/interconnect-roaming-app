'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, Payment } from '@/lib/types';
import PaymentModal from '@/components/payments/PaymentModal';

interface InvoiceDetailData extends Invoice {
  payments?: Payment[];
  total_paid?: number;
  outstanding_balance?: number;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetailData | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch invoice details
      const invoiceRes = await fetch(`/api/invoices/${unwrappedParams.id}`);
      if (!invoiceRes.ok) {
        const errorData = await invoiceRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch invoice details (${invoiceRes.status})`);
      }
      const invoiceData = await invoiceRes.json();

      // Fetch payments for this invoice
      const paymentsRes = await fetch(`/api/invoices/${unwrappedParams.id}/payments`);
      if (!paymentsRes.ok) {
        const errorData = await paymentsRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch payments (${paymentsRes.status})`);
      }
      const paymentsData = await paymentsRes.json();

      setInvoice(invoiceData);
      setPayments(paymentsData.payments || []);
      setTotalPaid(paymentsData.total_paid || 0);
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [unwrappedParams.id]);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchInvoiceDetails(); // Refresh data
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ISSUED: 'bg-blue-100 text-blue-800',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      DISPUTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      CLEARED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REVERSED: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#1f3d88' }}></div>
          <p className="mt-4 text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Invoice</h3>
          <p className="text-red-600">{error || 'Invoice not found'}</p>
          <button
            onClick={() => router.push('/invoices')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const outstandingBalance = invoice.total_amount - totalPaid;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.push('/invoices')}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoices
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
          <p className="text-gray-600 mt-1">
            {invoice.partner_name} ({invoice.partner_code})
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status.replace('_', ' ')}
          </span>
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-2 text-white rounded-lg transition flex items-center"
              style={{ backgroundColor: '#1f3d88' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163368'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f3d88'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Invoice Summary Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r text-white p-6" style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}>
          <h2 className="text-xl font-bold mb-4">Invoice Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm" style={{ color: '#d1dcef' }}>Invoice Date</div>
              <div className="text-lg font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm" style={{ color: '#d1dcef' }}>Due Date</div>
              <div className="text-lg font-semibold">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm" style={{ color: '#d1dcef' }}>Billing Period</div>
              <div className="text-lg font-semibold">
                {new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm" style={{ color: '#d1dcef' }}>Currency</div>
              <div className="text-lg font-semibold">{invoice.currency}</div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Subtotal</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Tax</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(invoice.tax_amount, invoice.currency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold" style={{ color: '#1f3d88' }}>
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Outstanding</div>
              <div className={`text-2xl font-bold ${outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(outstandingBalance, invoice.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Units
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.line_items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.service_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.direction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {(item.total_units ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {invoice.currency} {(item.rate ?? 0).toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.amount ?? 0, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Payment History</h2>
              <p className="text-green-100 mt-1">
                {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
            <div className="text-right">
              <div className="text-green-100 text-sm">Total Paid</div>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid, invoice.currency)}</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Recorded</h3>
              <p className="text-gray-600 mb-4">This invoice has no payment records yet.</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: '#1f3d88' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163368'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f3d88'}
              >
                Record First Payment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.payment_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.payment_method.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.reference_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {payment.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          invoiceId={invoice.invoice_id}
          invoiceNumber={invoice.invoice_number}
          invoiceTotal={invoice.total_amount}
          totalPaid={totalPaid}
          currency={invoice.currency}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
