'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CreditProfile {
  id: string;
  partner: {
    id: string;
    partnerName: string;
    partnerCode: string;
    partnerType: string;
    status: string;
  };
  creditLimit: number;
  paymentTermsDays: number;
  surchargeCategory: string;
  surchargeRate: number;
  status: string;
}

export default function CreditControlPage() {
  const [profiles, setProfiles] = useState<CreditProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [exposure, setExposure] = useState<any>(null);
  const [loadingExposure, setLoadingExposure] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/credit/profiles');
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error('Error fetching credit profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExposure = async (partnerId: string) => {
    setLoadingExposure(true);
    setSelectedPartner(partnerId);
    try {
      const response = await fetch(`/api/credit/exposure?partnerId=${partnerId}`);
      const data = await response.json();
      setExposure(data);
    } catch (error) {
      console.error('Error fetching exposure:', error);
    } finally {
      setLoadingExposure(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#1f3d88' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credit Control & Collections</h1>
          <p className="text-gray-600 mt-2">
            Manage credit limits, surcharges, and monitor financial exposure
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Profiles</div>
            <div className="text-3xl font-bold text-gray-900">{profiles.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">
              {profiles.filter(p => p.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Suspended</div>
            <div className="text-3xl font-bold text-orange-600">
              {profiles.filter(p => p.status === 'SUSPENDED').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Blocked</div>
            <div className="text-3xl font-bold text-red-600">
              {profiles.filter(p => p.status === 'BLOCKED').length}
            </div>
          </div>
        </div>

        {/* Credit Profiles Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Credit Profiles</h2>

          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No credit profiles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Credit Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Payment Terms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Surcharge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {profile.partner.partnerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {profile.partner.partnerCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold" style={{ color: '#1f3d88' }}>
                          ${Number(profile.creditLimit).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profile.paymentTermsDays} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profile.surchargeRate}% ({profile.surchargeCategory})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(profile.status)}`}>
                          {profile.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => fetchExposure(profile.partner.id)}
                          className="text-sm font-medium hover:underline"
                          style={{ color: '#1f3d88' }}
                        >
                          View Exposure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Exposure Details */}
        {selectedPartner && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Credit Exposure Details</h2>

            {loadingExposure ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#1f3d88' }}></div>
              </div>
            ) : exposure ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exposure.partner.partnerName}
                  </h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskColor(exposure.riskLevel)}`}>
                    Risk Level: {exposure.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${exposure.exposure.totalOutstanding.toLocaleString()}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Overdue</div>
                    <div className="text-2xl font-bold text-red-600">
                      ${exposure.exposure.totalOverdue.toLocaleString()}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Surcharge Amount</div>
                    <div className="text-2xl font-bold text-orange-600">
                      ${exposure.exposure.surchargeAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Credit Utilization</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {exposure.exposure.creditUtilization}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${Math.min(exposure.exposure.creditUtilization, 100)}%`,
                          backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Available Credit</div>
                    <div className="text-xl font-bold text-green-600">
                      ${exposure.exposure.availableCredit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {exposure.exposure.outstandingInvoiceCount} outstanding invoices
                      ({exposure.exposure.overdueInvoiceCount} overdue)
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
