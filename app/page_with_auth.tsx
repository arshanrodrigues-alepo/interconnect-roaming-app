// Updated home page with authentication - can replace page.tsx if needed
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Partner, Invoice, Dispute, Anomaly } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/helpers';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, router]);

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

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600">Loading platform...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {user?.role === 'PARTNER'
              ? `Manage your ${user.partner_name} operations and view analytics`
              : 'Comprehensive interconnect and roaming management platform'}
          </p>
        </div>

        {/* Rest of the component stays the same... */}
        {/* Key Metrics Dashboard, Feature Cards, etc. */}
      </div>
    </div>
  );
}
