'use client';

import { Agreement } from '@/lib/types';
import { formatDate } from '@/lib/utils/helpers';

interface AgreementSectionProps {
  agreement: Agreement | null;
  partnerId: string;
  onEdit?: () => void;
}

export default function AgreementSection({ agreement, partnerId, onEdit }: AgreementSectionProps) {
  const getPolicyStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgreementStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!agreement) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Agreement</h2>
        </div>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Agreement</h3>
          <p className="mt-1 text-sm text-gray-500">
            This partner does not have an agreement yet.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition"
            >
              Create Agreement
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agreement</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Edit Agreement
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agreement Name
          </label>
          <div className="text-lg font-semibold text-gray-900">
            {agreement.agreement_name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agreement Type
          </label>
          <div className="text-lg text-gray-900">
            {agreement.agreement_type}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agreement Status
          </label>
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getAgreementStatusColor(
              agreement.status
            )}`}
          >
            {agreement.status}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Policy Status
          </label>
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPolicyStatusColor(
              agreement.policy_status
            )}`}
          >
            {agreement.policy_status}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="text-gray-900">{formatDate(agreement.start_date)}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="text-gray-900">
            {agreement.end_date ? formatDate(agreement.end_date) : 'No end date'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <div className="text-gray-900">{agreement.currency}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Cycle
          </label>
          <div className="text-gray-900">{agreement.billing_cycle}</div>
        </div>
      </div>

      {agreement.contract_file_url && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract Document
          </label>
          <a
            href={agreement.contract_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Contract
          </a>
        </div>
      )}

      {agreement.document_template && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policy Document Template
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {agreement.document_template}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
