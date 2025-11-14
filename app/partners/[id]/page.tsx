'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Partner, Agreement } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils/helpers';
import Link from 'next/link';
import AgreementSection from './components/AgreementSection';
import RateSheetsSection from './components/RateSheetsSection';
import CreateRateSheetModal from './components/CreateRateSheetModal';
import AddRateModal from './components/AddRateModal';

interface RateSheetWithRates {
  rate_sheet_id: string;
  partner_id: string;
  rate_sheet_name: string;
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rates: any[];
}

export default function PartnerDetailPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [rateSheets, setRateSheets] = useState<RateSheetWithRates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRateSheet, setShowCreateRateSheet] = useState(false);
  const [showAddRate, setShowAddRate] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && partnerId) {
      fetchPartnerData();
    }
  }, [isAuthenticated, authLoading, partnerId, router]);

  const fetchPartnerData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch partner and agreement
      const partnerResponse = await fetch(`/api/partners/${partnerId}`);
      if (!partnerResponse.ok) {
        throw new Error('Partner not found');
      }
      const partnerData = await partnerResponse.json();
      setPartner(partnerData.partner);
      setAgreement(partnerData.agreement);

      // Fetch rate sheets
      const rateSheetsResponse = await fetch(`/api/partners/${partnerId}/rate-sheets`);
      if (rateSheetsResponse.ok) {
        const rateSheetsData = await rateSheetsResponse.json();
        setRateSheets(rateSheetsData.rate_sheets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch partner data');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading partner details...</div>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Partner</h3>
          <p className="text-red-700 mb-4">{error || 'Partner not found'}</p>
          <Link
            href="/partners"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/partners" className="hover:text-purple-600">
            Partners
          </Link>
          <span>/</span>
          <span className="text-gray-900">{partner.partner_code}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{partner.partner_name}</h1>
            <p className="text-gray-600 mt-2">Partner Code: {partner.partner_code}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/dashboard?partner=${partner.partner_id}`}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Partner Information Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Partner Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Type
            </label>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              {partner.partner_type}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                partner.status
              )}`}
            >
              {partner.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <div className="text-gray-900">{partner.country_code}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <a
              href={`mailto:${partner.contact_email}`}
              className="text-purple-600 hover:text-purple-800"
            >
              {partner.contact_email}
            </a>
          </div>

          {partner.contact_phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <a
                href={`tel:${partner.contact_phone}`}
                className="text-purple-600 hover:text-purple-800"
              >
                {partner.contact_phone}
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="text-gray-900">{formatDate(partner.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Agreement Section */}
      <div className="mb-6">
        <AgreementSection agreement={agreement} partnerId={partner.partner_id} />
      </div>

      {/* Rate Sheets Section */}
      <div className="mb-6">
        <RateSheetsSection
          rateSheets={rateSheets}
          partnerId={partner.partner_id}
          onAddRateSheet={() => setShowCreateRateSheet(true)}
          onAddRate={(rateSheetId) => setShowAddRate(rateSheetId)}
        />
      </div>

      {/* Create Rate Sheet Modal */}
      {showCreateRateSheet && (
        <CreateRateSheetModal
          partnerId={partner.partner_id}
          onClose={() => setShowCreateRateSheet(false)}
          onSuccess={() => {
            setShowCreateRateSheet(false);
            fetchPartnerData();
          }}
        />
      )}

      {/* Add Rate Modal */}
      {showAddRate && (
        <AddRateModal
          rateSheetId={showAddRate}
          onClose={() => setShowAddRate(null)}
          onSuccess={() => {
            setShowAddRate(null);
            fetchPartnerData();
          }}
        />
      )}
    </div>
  );
}
