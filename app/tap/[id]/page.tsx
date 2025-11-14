'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { TAPFile, TAPRecord } from '@/lib/types';
import { formatDate, formatFileSize } from '@/lib/utils/helpers';
import Link from 'next/link';

export default function TAPFileDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const fileId = params.id as string;

  const [tapFile, setTapFile] = useState<TAPFile | null>(null);
  const [records, setRecords] = useState<TAPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && fileId) {
      fetchFileDetails();
    }
  }, [isAuthenticated, authLoading, fileId, router]);

  const fetchFileDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch TAP file details
      const fileResponse = await fetch(`/api/tap/${fileId}`);
      if (!fileResponse.ok) {
        throw new Error('File not found');
      }
      const fileData = await fileResponse.json();
      setTapFile(fileData.file);

      // Fetch records
      const recordsResponse = await fetch(`/api/tap/${fileId}/records`);
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setRecords(recordsData.records || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RATED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PARSED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PARSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UPLOADED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <div className="text-gray-600">Loading file details...</div>
        </div>
      </div>
    );
  }

  if (error || !tapFile) {
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
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading File</h3>
          <p className="text-red-700 mb-4">{error || 'File not found'}</p>
          <Link
            href="/tap"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to TAP Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <Link href="/tap" className="hover:text-purple-600">
          TAP Files
        </Link>
        <span>/</span>
        <span className="text-gray-900">{tapFile.filename}</span>
      </div>

      {/* File Information */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tapFile.filename}</h1>
            <p className="text-gray-600 mt-2">TAP File ID: {tapFile.tap_file_id}</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusColor(
              tapFile.status
            )}`}
          >
            {tapFile.status}
          </span>
        </div>

        {/* Partner Information Section */}
        {tapFile.partner_name && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tapFile.partner_name}</h3>
                <p className="text-sm text-gray-600">Partner Code: <span className="font-mono text-purple-600">{tapFile.partner_code}</span></p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  tapFile.direction === 'INBOUND'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {tapFile.direction}
              </span>
              <span className="text-xs text-gray-500">
                ({tapFile.direction === 'INBOUND' ? 'Received TAP' : 'Sent TAP'})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
            <div className="text-gray-900">{formatFileSize(tapFile.file_size_bytes)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Wholesale Cost
            </label>
            <div className="text-gray-900 font-semibold text-lg text-green-600">
              {tapFile.total_charges
                ? `USD ${tapFile.total_charges.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}`
                : '-'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processed / Failed Records
            </label>
            <div className="text-gray-900">
              <span className="text-green-600 font-medium">{tapFile.records_count || 0}</span>
              {' / '}
              <span className="text-red-600 font-medium">0</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Time</label>
            <div className="text-gray-900">{formatDate(tapFile.upload_timestamp)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Duration
            </label>
            <div className="text-gray-900">
              {tapFile.processed_timestamp && tapFile.upload_timestamp
                ? `${((new Date(tapFile.processed_timestamp).getTime() - new Date(tapFile.upload_timestamp).getTime()) / 1000).toFixed(1)}s`
                : 'Processing...'}
            </div>
          </div>
        </div>

        {tapFile.error_message && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900 mb-1">Error:</p>
            <p className="text-sm text-red-700">{tapFile.error_message}</p>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Records</h2>
          <div className="text-sm text-gray-600">
            {records.length} {records.length === 1 ? 'record' : 'records'}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Records</h3>
            <p className="text-gray-600">
              {tapFile.status === 'PARSING'
                ? 'File is being processed...'
                : 'No records found in this file'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    Record ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    Service Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    MSISDN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    Date/Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    Duration/Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    Charge
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.record_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {record.record_id?.split('-').pop() || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        {record.service_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {record.msisdn}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(record.call_date_time)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.duration_seconds
                        ? `${record.duration_seconds}s`
                        : record.message_count
                        ? `${record.message_count} msg`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {record.charged_amount && record.currency
                        ? `${record.currency} ${record.charged_amount.toFixed(4)}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          record.processing_status === 'RATED'
                            ? 'bg-green-100 text-green-800'
                            : record.processing_status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {record.processing_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
