'use client';

import { useEffect, useState } from 'react';

interface VolumeCommitment {
  id: string;
  partner: {
    id: string;
    partnerName: string;
    partnerCode: string;
    partnerType: string;
  };
  commitmentType: string;
  committedVolumeMinutes: string | null;
  committedRevenueAmount: number | null;
  startDate: string;
  endDate: string;
  status: string;
  discountScheme: {
    id: string;
    schemeName: string;
    discountType: string;
  } | null;
}

export default function CommitmentsPage() {
  const [commitments, setCommitments] = useState<VolumeCommitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommitment, setSelectedCommitment] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    fetchCommitments();
  }, []);

  const fetchCommitments = async () => {
    try {
      const response = await fetch('/api/commitments');
      const data = await response.json();
      setCommitments(data.commitments || []);
    } catch (error) {
      console.error('Error fetching commitments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (commitmentId: string) => {
    setLoadingProgress(true);
    setSelectedCommitment(commitmentId);
    try {
      const response = await fetch(`/api/commitments/${commitmentId}/progress`);
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'TERMINATED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BREACHED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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
          <h1 className="text-3xl font-bold text-gray-900">Volume Commitments & Discounting</h1>
          <p className="text-gray-600 mt-2">
            Track traffic commitments, revenue targets, and discount tier achievements
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Commitments</div>
            <div className="text-3xl font-bold text-gray-900">{commitments.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">
              {commitments.filter(c => c.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Expired</div>
            <div className="text-3xl font-bold text-gray-600">
              {commitments.filter(c => c.status === 'EXPIRED').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Breached</div>
            <div className="text-3xl font-bold text-orange-600">
              {commitments.filter(c => c.status === 'BREACHED').length}
            </div>
          </div>
        </div>

        {/* Commitments Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Volume Commitments</h2>

          {commitments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No volume commitments found.</p>
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Commitment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Period
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
                  {commitments.map((commitment) => (
                    <tr key={commitment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {commitment.partner.partnerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {commitment.partner.partnerCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {commitment.commitmentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {commitment.committedVolumeMinutes && (
                          <div className="text-sm text-gray-900">
                            {parseInt(commitment.committedVolumeMinutes).toLocaleString()} minutes
                          </div>
                        )}
                        {commitment.committedRevenueAmount && (
                          <div className="text-sm font-semibold" style={{ color: '#1f3d88' }}>
                            ${Number(commitment.committedRevenueAmount).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(commitment.startDate).toLocaleDateString()} - {new Date(commitment.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(commitment.status)}`}>
                          {commitment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => fetchProgress(commitment.id)}
                          className="text-sm font-medium hover:underline"
                          style={{ color: '#1f3d88' }}
                        >
                          View Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Progress Details */}
        {selectedCommitment && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Commitment Progress</h2>

            {loadingProgress ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#1f3d88' }}></div>
              </div>
            ) : progress ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {progress.partner.partnerName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {progress.progress.daysRemaining} days remaining
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Volume Progress */}
                  {progress.commitment.committedVolumeMinutes && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Volume Progress</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {progress.progress.volumeProgress}%
                        </span>
                        <span className="text-sm text-gray-600">
                          {progress.progress.actualMinutes.toLocaleString()} / {parseInt(progress.commitment.committedVolumeMinutes).toLocaleString()} min
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${Math.min(progress.progress.volumeProgress, 100)}%`,
                            backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Revenue Progress */}
                  {progress.commitment.committedRevenueAmount && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Revenue Progress</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {progress.progress.revenueProgress}%
                        </span>
                        <span className="text-sm text-gray-600">
                          ${progress.progress.actualRevenue.toLocaleString()} / ${Number(progress.commitment.committedRevenueAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${Math.min(progress.progress.revenueProgress, 100)}%`,
                            backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shortfall Warning */}
                {progress.progress.shortfall > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-orange-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-orange-900">Commitment Shortfall</h4>
                        <p className="text-sm text-orange-800 mt-1">
                          Current shortfall: {progress.progress.shortfall.toLocaleString()} minutes
                          {progress.progress.penaltyAmount > 0 && (
                            <> • Estimated penalty: ${progress.progress.penaltyAmount.toLocaleString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discount Information */}
                {progress.applicableDiscount && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Active Discount</h4>
                    <div className="text-sm text-green-800">
                      <span className="font-semibold">{progress.discountScheme.name}</span>
                      {' '}({progress.discountScheme.type})
                    </div>
                    <div className="text-sm text-green-800 mt-1">
                      Current tier discount: {progress.applicableDiscount.discountPercentage}%
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
