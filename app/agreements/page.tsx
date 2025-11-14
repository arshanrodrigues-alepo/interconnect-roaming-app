'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Agreement, Partner } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils/helpers';
import CreateAgreementForm from './components/CreateAgreementForm';

export default function AgreementsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [partnerFilter, setPartnerFilter] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [statusFilter, typeFilter, partnerFilter, isAuthenticated, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch agreements
      const agreementParams = new URLSearchParams();
      if (statusFilter) agreementParams.append('status', statusFilter);
      if (typeFilter) agreementParams.append('agreement_type', typeFilter);
      if (partnerFilter) agreementParams.append('partner_id', partnerFilter);

      const [agreementsRes, partnersRes] = await Promise.all([
        fetch(`/api/agreements?${agreementParams}`),
        fetch('/api/partners'),
      ]);

      const agreementsData = await agreementsRes.json();
      const partnersData = await partnersRes.json();

      setAgreements(agreementsData.agreements);
      setPartners(partnersData.partners);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find((p) => p.partner_id === partnerId);
    return partner ? `${partner.partner_name} (${partner.partner_code})` : partnerId;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agreements Management</h1>
          <p className="text-gray-600 mt-2">Manage interconnect and roaming agreements</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition flex items-center"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Agreement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Filter
            </label>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Partners</option>
              {partners.map((partner) => (
                <option key={partner.partner_id} value={partner.partner_id}>
                  {partner.partner_name} ({partner.partner_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type Filter
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="INTERCONNECT">Interconnect</option>
              <option value="ROAMING">Roaming</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agreements Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading agreements...</div>
        ) : agreements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No agreements found. {user?.role === 'ADMIN' && 'Click "Create Agreement" to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Agreement ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Partner
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Billing
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agreements.map((agreement) => (
                  <tr key={agreement.agreement_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-purple-600 font-medium font-mono text-sm">
                        {agreement.agreement_id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {getPartnerName(agreement.partner_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {agreement.agreement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          agreement.status
                        )}`}
                      >
                        {agreement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(agreement.start_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {agreement.end_date ? formatDate(agreement.end_date) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{agreement.currency}</div>
                      <div className="text-xs text-gray-500">{agreement.billing_cycle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/agreements/${agreement.agreement_id}`)}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agreement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Agreements</div>
          <div className="text-3xl font-bold text-gray-900">{agreements.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {agreements.filter((a) => a.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Draft</div>
          <div className="text-3xl font-bold text-gray-600">
            {agreements.filter((a) => a.status === 'DRAFT').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">
            {agreements.filter((a) => a.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Expired</div>
          <div className="text-3xl font-bold text-red-600">
            {agreements.filter((a) => a.status === 'EXPIRED').length}
          </div>
        </div>
      </div>

      {/* Create Agreement Modal */}
      {showCreateForm && (
        <CreateAgreementForm
          partners={partners}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            fetchData();
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}
