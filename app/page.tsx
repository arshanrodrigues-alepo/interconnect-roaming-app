'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Partner, Invoice, Dispute, Anomaly } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/helpers';

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchData = async () => {
    try {
      const [partnersRes, invoicesRes, disputesRes, anomaliesRes] = await Promise.all([
        fetch('/api/partners'),
        fetch('/api/invoices'),
        fetch('/api/disputes'),
        fetch('/api/fraud/anomalies'),
      ]);

      const partnersData = await partnersRes.json();
      const invoicesData = await invoicesRes.json();
      const disputesData = await disputesRes.json();
      const anomaliesData = await anomaliesRes.json();

      setPartners(partnersData.partners);
      setInvoices(invoicesData.invoices);
      setDisputes(disputesData.disputes);
      setAnomalies(anomaliesData.anomalies);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  };

  if (authLoading || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-2xl text-gray-600">Loading platform...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Interconnect & Roaming Solution
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive platform for managing telecom interconnect agreements, TAP file
            processing, real-time rating, settlement automation, and fraud detection
          </p>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">Active Partners</h3>
              <span className="text-3xl">🤝</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {partners.filter((p) => p.status === 'ACTIVE').length}
            </div>
            <Link
              href="/partners"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all partners →
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <span className="text-3xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(getTotalRevenue())}
            </div>
            <Link
              href="/invoices"
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              View invoices →
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-orange-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">Open Disputes</h3>
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {disputes.filter((d) => d.status === 'OPEN' || d.status === 'IN_REVIEW').length}
            </div>
            <Link
              href="/disputes"
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              Manage disputes →
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">Security Alerts</h3>
              <span className="text-3xl">🛡️</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {anomalies.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL').length}
            </div>
            <Link
              href="/fraud"
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              View alerts →
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Partner Management */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Partner Management</h3>
            <p className="text-gray-600 mb-6">
              Onboard partners, manage agreements, configure rate plans, and maintain RAEX IR.21
              forms for technical coordination.
            </p>
            <Link
              href="/partners"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Manage Partners
            </Link>
          </div>

          {/* TAP Processing & Rating */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-5xl mb-4">⚙️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">TAP Processing</h3>
            <p className="text-gray-600 mb-6">
              Process TAP3.12 files, extract CDRs, apply partner-specific rates, and automatically
              calculate charges with real-time validation.
            </p>
            <button className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
              Upload TAP File
            </button>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Analytics & Insights</h3>
            <p className="text-gray-600 mb-6">
              Real-time dashboards with traffic metrics, revenue analytics, SLA compliance
              monitoring, and predictive insights.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Platform Capabilities */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Platform Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Automated Reconciliation</h4>
                <p className="text-gray-600 text-sm">
                  Compare inbound and outbound traffic, identify discrepancies, and generate
                  detailed reconciliation reports automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Invoice Generation</h4>
                <p className="text-gray-600 text-sm">
                  Automated invoice creation with detailed line items, multiple currency support,
                  and PDF generation for partner distribution.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Dispute Resolution</h4>
                <p className="text-gray-600 text-sm">
                  Track disputes from creation to resolution with workflow management, status
                  updates, and audit trails.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Fraud Detection</h4>
                <p className="text-gray-600 text-sm">
                  Real-time anomaly detection for unusual traffic patterns, premium rate abuse,
                  velocity anomalies, and IRSF prevention.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Performance Monitoring</h4>
                <p className="text-gray-600 text-sm">
                  SLA compliance tracking, network availability metrics, latency monitoring, and
                  quality of service analytics.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Test Call Automation</h4>
                <p className="text-gray-600 text-sm">
                  Automated test call generation for voice, SMS, and data services with quality
                  metrics and success rate tracking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {partners.length}
            </div>
            <div className="text-sm text-gray-600">Total Partners</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {invoices.length}
            </div>
            <div className="text-sm text-gray-600">Invoices Generated</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">99.97%</div>
            <div className="text-sm text-gray-600">Platform Uptime</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {disputes.filter((d) => d.status === 'RESOLVED').length}
            </div>
            <div className="text-sm text-gray-600">Disputes Resolved</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Explore the full suite of interconnect and roaming management tools designed for
            telecom operators.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/admin"
              className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-lg"
            >
              Admin Portal
            </Link>
            <Link
              href="/partners"
              className="px-8 py-4 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 transition font-bold text-lg shadow-lg"
            >
              View Partners
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
