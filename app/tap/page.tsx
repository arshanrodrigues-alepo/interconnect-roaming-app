'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { TAPFile } from '@/lib/types';
import { formatDate, formatFileSize } from '@/lib/utils/helpers';
import Link from 'next/link';
import FileUploadZone from './components/FileUploadZone';

export default function TAPFilesPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tapFiles, setTapFiles] = useState<TAPFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadConfig, setUploadConfig] = useState<{
    partner_id: string;
    direction: 'INBOUND' | 'OUTBOUND';
  } | null>(null);
  const [firstPartnerId, setFirstPartnerId] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchTAPFiles();
      fetchFirstPartner();
    }
  }, [statusFilter, directionFilter, isAuthenticated, authLoading, router]);

  const fetchFirstPartner = async () => {
    try {
      const response = await fetch('/api/partners');
      if (response.ok) {
        const data = await response.json();
        if (data.partners && data.partners.length > 0) {
          setFirstPartnerId(data.partners[0].partner_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    }
  };

  const fetchTAPFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (directionFilter) params.append('direction', directionFilter);

      const response = await fetch(`/api/tap?${params}`);
      const data = await response.json();
      setTapFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch TAP files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!firstPartnerId) {
      alert('No partners available. Please create a partner first.');
      return;
    }
    setUploadConfig({
      partner_id: firstPartnerId,
      direction: 'INBOUND',
    });
    setShowUpload(true);
  };

  const handleDeleteFile = async (fileId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This will also delete all associated records.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tap/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }

      // Refresh the file list
      fetchTAPFiles();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete file');
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
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1f3d88' }}></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TAP File Management</h1>
          <p className="text-gray-600 mt-2">Upload and process TAP/EDR files</p>
        </div>
        <button
          onClick={handleUploadClick}
          className="px-6 py-3 text-white rounded-lg font-semibold transition flex items-center"
          style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Upload TAP File
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ outlineColor: '#1f3d88' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            >
              <option value="">All Statuses</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="PARSING">Parsing</option>
              <option value="PARSED">Parsed</option>
              <option value="RATED">Rated</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direction Filter
            </label>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ outlineColor: '#1f3d88' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            >
              <option value="">All Directions</option>
              <option value="INBOUND">Inbound</option>
              <option value="OUTBOUND">Outbound</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAP Files Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading TAP files...</div>
        ) : tapFiles.length === 0 ? (
          <div className="p-12 text-center">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No TAP Files</h3>
            <p className="text-gray-600 mb-6">Get started by uploading your first TAP file</p>
            <button
              onClick={handleUploadClick}
              className="px-6 py-3 text-white rounded-lg font-semibold transition"
              style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
            >
              Upload TAP File
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Filename
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Direction
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Records
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Total Charges
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Uploaded
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tapFiles.map((file) => (
                  <tr key={file.tap_file_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/tap/${file.tap_file_id}`}
                        className="font-medium"
                        style={{ color: '#1f3d88' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#163368'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#1f3d88'}
                      >
                        {file.filename}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          file.direction === 'INBOUND'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {file.direction}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          file.status
                        )}`}
                      >
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {file.records_count?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatFileSize(file.file_size_bytes)}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {file.total_charges
                        ? `$${file.total_charges.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(file.upload_timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/tap/${file.tap_file_id}`}
                          className="px-3 py-1 text-xs text-white rounded transition"
                          style={{ backgroundColor: '#1f3d88' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163368'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f3d88'}
                        >
                          View
                        </Link>
                        {file.status === 'ERROR' && (
                          <button className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition">
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFile(file.tap_file_id, file.filename)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                          title="Delete file"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Files</div>
          <div className="text-3xl font-bold text-gray-900">{tapFiles.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Processing</div>
          <div className="text-3xl font-bold text-yellow-600">
            {tapFiles.filter((f) => f.status === 'PARSING' || f.status === 'UPLOADED').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Rated</div>
          <div className="text-3xl font-bold text-green-600">
            {tapFiles.filter((f) => f.status === 'RATED').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Errors</div>
          <div className="text-3xl font-bold text-red-600">
            {tapFiles.filter((f) => f.status === 'ERROR').length}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && uploadConfig && (
        <FileUploadZone
          partnerId={uploadConfig.partner_id}
          direction={uploadConfig.direction}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={() => {
            setShowUpload(false);
            fetchTAPFiles();
          }}
        />
      )}
    </div>
  );
}
