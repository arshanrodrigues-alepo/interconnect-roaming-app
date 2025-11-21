'use client';

import { useState, useEffect } from 'react';
import { Partner, Agreement, Invoice } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils/helpers';
import Link from 'next/link';

export default function AdminPortalPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partnersRes, agreementsRes, invoicesRes] = await Promise.all([
        fetch('/api/partners'),
        fetch('/api/agreements'),
        fetch('/api/invoices'),
      ]);

      const partnersData = await partnersRes.json();
      const agreementsData = await agreementsRes.json();
      const invoicesData = await invoicesRes.json();

      setPartners(partnersData.partners);
      setAgreements(agreementsData.agreements);
      setInvoices(invoicesData.invoices);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading admin portal...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Operator Admin Portal</h1>
        <p className="text-gray-600 mt-2">Platform overview and system management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2 text-blue-100">Total Partners</div>
          <div className="text-4xl font-bold">{partners.length}</div>
          <div className="text-sm mt-2 text-blue-100">
            {partners.filter((p) => p.status === 'ACTIVE').length} Active
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2 text-blue-100">Active Agreements</div>
          <div className="text-4xl font-bold">
            {agreements.filter((a) => a.status === 'ACTIVE').length}
          </div>
          <div className="text-sm mt-2 text-green-100">
            {agreements.filter((a) => a.status === 'PENDING').length} Pending
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2 text-blue-100">Total Revenue</div>
          <div className="text-3xl font-bold">{formatCurrency(getTotalRevenue())}</div>
          <div className="text-sm mt-2 text-blue-100">This period</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2 text-blue-100">Invoices</div>
          <div className="text-4xl font-bold">{invoices.length}</div>
          <div className="text-sm mt-2 text-orange-100">
            {invoices.filter((i) => i.status === 'PAID').length} Paid
          </div>
        </div>
      </div>

      {/* Partner Status Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Partner Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-l-4 border-green-500 pl-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {partners.filter((p) => p.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {partners.filter((p) => p.status === 'PENDING').length}
            </div>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <div className="text-sm text-gray-600">Suspended</div>
            <div className="text-2xl font-bold text-orange-600">
              {partners.filter((p) => p.status === 'SUSPENDED').length}
            </div>
          </div>
          <div className="border-l-4 border-gray-500 pl-4">
            <div className="text-sm text-gray-600">Inactive</div>
            <div className="text-2xl font-bold text-gray-600">
              {partners.filter((p) => p.status === 'INACTIVE').length}
            </div>
          </div>
        </div>
      </div>

      {/* Partner Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Partner Type Distribution</h2>
          <div className="space-y-3">
            {['MNO', 'MVNO', 'HUB', 'CARRIER'].map((type) => {
              const count = partners.filter((p) => p.partner_type === type).length;
              const percentage = partners.length > 0 ? (count / partners.length) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{type}</span>
                    <span className="text-gray-600">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agreement Types</h2>
          <div className="space-y-3">
            {['BOTH', 'ROAMING', 'INTERCONNECT'].map((type) => {
              const count = agreements.filter((a) => a.agreement_type === type).length;
              const percentage = agreements.length > 0 ? (count / agreements.length) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{type}</span>
                    <span className="text-gray-600">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/partners"
            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-semibold"
          >
            Manage Partners
          </Link>
          <button className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
            Create Agreement
          </button>
          <button className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Generate Reports
          </button>
          <Link
            href="/fraud"
            className="px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-center font-semibold"
          >
            Security Monitor
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">New partner activated</div>
                <div className="text-sm text-gray-600">Verizon Wireless (USAVZ1)</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">2 hours ago</div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">TAP file processed</div>
                <div className="text-sm text-gray-600">5,234 records rated successfully</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">5 hours ago</div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">Dispute raised</div>
                <div className="text-sm text-gray-600">DSP-2025-00042 - Billing dispute</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">1 day ago</div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">Invoice generated</div>
                <div className="text-sm text-gray-600">INV-202501-001 - $12,543.50</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">2 days ago</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Platform Health</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">99.97%</div>
          <div className="text-sm text-gray-600">Uptime last 30 days</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">API Response</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">120ms</div>
          <div className="text-sm text-gray-600">Average response time</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Active Sessions</h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">47</div>
          <div className="text-sm text-gray-600">Current active users</div>
        </div>
      </div>
    </div>
  );
}
