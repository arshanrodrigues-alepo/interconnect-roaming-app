'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardData, Partner } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils/helpers';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    searchParams.get('partner') || ''
  );

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (selectedPartnerId) {
      fetchData();
    }
  }, [selectedPartnerId]);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      if (response.ok) {
        const data = await response.json();
        const partnersList = data.partners || [];
        setPartners(partnersList);
        // Set first partner as default if no partner is selected
        if (!selectedPartnerId && partnersList.length > 0) {
          setSelectedPartnerId(partnersList[0].partner_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashResponse, partnerResponse] = await Promise.all([
        fetch(`/api/analytics/dashboard/${selectedPartnerId}?period=month`),
        fetch(`/api/partners/${selectedPartnerId}`),
      ]);

      if (!dashResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      if (!partnerResponse.ok) {
        throw new Error('Failed to fetch partner data');
      }

      const dashData = await dashResponse.json();
      const partnerData = await partnerResponse.json();

      setDashboardData(dashData);
      setPartner(partnerData.partner || partnerData); // Handle nested partner object
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1f3d88' }}></div>
            <div className="text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData || !partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Monitor traffic, revenue, and performance metrics
            </p>
          </div>

          {/* Partner Selector */}
          <div className="w-80">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Partner
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
              style={{ focusRingColor: '#1f3d88' }}
            >
              {partners.map((p) => (
                <option key={p.partner_id} value={p.partner_id}>
                  {p.partner_name} ({p.partner_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Partner Info */}
        <div className="mt-6 rounded-lg p-4" style={{ backgroundImage: 'linear-gradient(to right, #e8edf7, #e0f2f2)', borderColor: '#1f3d88', borderWidth: '1px' }}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{partner.partner_name}</h3>
              <p className="text-sm text-gray-600">
                Partner Code: <span className="font-mono" style={{ color: '#1f3d88' }}>{partner.partner_code}</span>
                {' • '}
                Country: <span className="font-semibold">{partner.country_code}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Voice Minutes</div>
              <div className="text-2xl">📞</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(dashboardData.traffic_summary.voice_minutes)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {dashboardData.from_date} to {dashboardData.to_date}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">SMS Messages</div>
              <div className="text-2xl">💬</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(dashboardData.traffic_summary.sms_count)}
            </div>
            <div className="text-sm text-gray-500 mt-2">Total messages sent</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderLeftColor: '#1f3d88' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Data Volume</div>
              <div className="text-2xl">📊</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(dashboardData.traffic_summary.data_mb)} MB
            </div>
            <div className="text-sm text-gray-500 mt-2">Total data transferred</div>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Summary</h2>
        <div className="rounded-xl shadow-lg p-8 text-white mb-6" style={{ backgroundImage: 'linear-gradient(to bottom right, #1f3d88, #1f8888)' }}>
          <div className="text-lg mb-2">Total Revenue</div>
          <div className="text-5xl font-bold mb-4">
            {formatCurrency(dashboardData.revenue_summary.total_charges)}
          </div>
          <div className="text-blue-100">
            Margin: {dashboardData.revenue_summary.margin_percentage}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Voice Revenue</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(dashboardData.revenue_summary.voice_revenue)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {((dashboardData.revenue_summary.voice_revenue / dashboardData.revenue_summary.total_charges) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">SMS Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardData.revenue_summary.sms_revenue)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {((dashboardData.revenue_summary.sms_revenue / dashboardData.revenue_summary.total_charges) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Data Revenue</div>
            <div className="text-2xl font-bold" style={{ color: '#1f3d88' }}>
              {formatCurrency(dashboardData.revenue_summary.data_revenue)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {((dashboardData.revenue_summary.data_revenue / dashboardData.revenue_summary.total_charges) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">SLA Compliance & Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Network Availability</div>
            <div className="text-3xl font-bold text-green-600">
              {dashboardData.sla_compliance.availability_percentage}%
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${dashboardData.sla_compliance.availability_percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">Target: 99.9%</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Average Success Rate</div>
            <div className="text-3xl font-bold text-blue-600">
              {dashboardData.sla_compliance.average_success_rate}%
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${dashboardData.sla_compliance.average_success_rate}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">Target: 95%</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Average Latency</div>
            <div className="text-3xl font-bold" style={{ color: '#1f3d88' }}>
              {dashboardData.sla_compliance.average_latency_ms}ms
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${100 - (dashboardData.sla_compliance.average_latency_ms / 200) * 100}%`,
                  backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)'
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">Target: &lt;150ms</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/invoices'}
            className="px-4 py-3 text-white rounded-lg font-semibold transition"
            style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
          >
            View Invoices
          </button>
          <button
            onClick={() => window.location.href = '/tap'}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Upload TAP File
          </button>
          <button
            onClick={() => window.location.href = '/disputes'}
            className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
          >
            Raise Dispute
          </button>
          <button
            onClick={() => window.location.href = '/billing-cycles'}
            className="px-4 py-3 text-white rounded-lg font-semibold transition"
            style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
          >
            Billing Cycles
          </button>
        </div>
      </div>
    </div>
  );
}
