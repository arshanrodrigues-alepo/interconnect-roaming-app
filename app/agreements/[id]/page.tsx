'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Agreement, Partner, RatePlan } from '@/lib/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils/helpers';
import Link from 'next/link';

export default function AgreementDetailsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const agreementId = params?.id as string;

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && agreementId) {
      fetchAgreementDetails();
    }
  }, [isAuthenticated, authLoading, agreementId, router]);

  const fetchAgreementDetails = async () => {
    setLoading(true);
    try {
      // Fetch all agreements and find the one we need
      const agreementsRes = await fetch('/api/agreements');
      const agreementsData = await agreementsRes.json();
      const foundAgreement = agreementsData.agreements.find(
        (a: Agreement) => a.agreement_id === agreementId
      );

      if (foundAgreement) {
        setAgreement(foundAgreement);

        // Fetch partner details
        const partnersRes = await fetch('/api/partners');
        const partnersData = await partnersRes.json();
        const foundPartner = partnersData.partners.find(
          (p: Partner) => p.partner_id === foundAgreement.partner_id
        );
        setPartner(foundPartner || null);

        // Fetch rate plans for this agreement
        const ratePlansRes = await fetch(`/api/rate-plans?agreement_id=${agreementId}`);
        const ratePlansData = await ratePlansRes.json();
        setRatePlans(ratePlansData.rate_plans);
      }
    } catch (error) {
      console.error('Failed to fetch agreement details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading agreement details...</div>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement Not Found</h2>
          <Link href="/agreements" className="text-purple-600 hover:text-purple-800">
            ← Back to Agreements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/agreements" className="text-purple-600 hover:text-purple-800 text-sm">
          ← Back to Agreements
        </Link>
      </div>

      {/* Agreement Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agreement Details
            </h1>
            <p className="text-gray-600 font-mono text-sm">ID: {agreement.agreement_id}</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusColor(
              agreement.status
            )}`}
          >
            {agreement.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Partner Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Partner:</span>
                <span className="font-medium text-gray-900">
                  {partner?.partner_name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Code:</span>
                <span className="font-medium text-gray-900">
                  {partner?.partner_code || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium text-gray-900">
                  {partner?.country_code || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Agreement Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Agreement Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {agreement.agreement_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(agreement.start_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium text-gray-900">
                  {agreement.end_date ? formatDate(agreement.end_date) : 'Indefinite'}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Billing Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium text-gray-900">{agreement.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Billing Cycle:</span>
                <span className="font-medium text-gray-900">{agreement.billing_cycle}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Metadata</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(agreement.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Plans Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rate Plans</h2>
            <p className="text-gray-600 mt-1">
              Rate cards for different services and directions
            </p>
          </div>
        </div>

        {ratePlans.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rate Plans</h3>
            <p className="text-gray-600">This agreement doesn't have any rate plans yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratePlans.map((ratePlan) => (
              <div
                key={ratePlan.rate_plan_id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      {ratePlan.service_type === 'VOICE' && '📞'}
                      {ratePlan.service_type === 'SMS' && '💬'}
                      {ratePlan.service_type === 'DATA' && '📱'}
                      {ratePlan.service_type === 'MMS' && '📷'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {ratePlan.service_type}
                      </h3>
                      <span className="text-sm text-gray-600">{ratePlan.direction}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                    Active
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate per Unit:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(ratePlan.rate_per_unit, ratePlan.currency)}
                    </span>
                  </div>
                  {ratePlan.minimum_charge && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Charge:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(ratePlan.minimum_charge, ratePlan.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rounding:</span>
                    <span className="font-medium text-gray-900">
                      {ratePlan.rounding_rule}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Effective From:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(ratePlan.effective_from)}
                    </span>
                  </div>
                  {ratePlan.effective_to && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective To:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(ratePlan.effective_to)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Rate Plans</div>
          <div className="text-3xl font-bold text-gray-900">{ratePlans.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Voice Plans</div>
          <div className="text-3xl font-bold text-blue-600">
            {ratePlans.filter((r) => r.service_type === 'VOICE').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">SMS Plans</div>
          <div className="text-3xl font-bold text-green-600">
            {ratePlans.filter((r) => r.service_type === 'SMS').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Data Plans</div>
          <div className="text-3xl font-bold text-purple-600">
            {ratePlans.filter((r) => r.service_type === 'DATA').length}
          </div>
        </div>
      </div>
    </div>
  );
}
