'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Partner, PartnerStatus, PartnerType } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils/helpers';
import Link from 'next/link';
import CreatePartnerForm from './components/CreatePartnerForm';

export default function PartnersPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; partnerId: string; partnerName: string }>({
    show: false,
    partnerId: '',
    partnerName: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchPartners();
    }
  }, [statusFilter, typeFilter, isAuthenticated, authLoading, router]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('partner_type', typeFilter);

      const response = await fetch(`/api/partners?${params}`);
      const data = await response.json();
      setPartners(data.partners);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (partnerId: string, newStatus: PartnerStatus) => {
    try {
      await fetch(`/api/partners/${partnerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: 'Status updated from admin portal' }),
      });
      fetchPartners();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteClick = (partnerId: string, partnerName: string) => {
    setDeleteConfirm({ show: true, partnerId, partnerName });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/partners/${deleteConfirm.partnerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete partner');
      }

      fetchPartners();
      setDeleteConfirm({ show: false, partnerId: '', partnerName: '' });
    } catch (error) {
      console.error('Failed to delete partner:', error);
      alert('Failed to delete partner. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, partnerId: '', partnerName: '' });
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
          <h1 className="text-3xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-gray-600 mt-2">Manage roaming and interconnect partners</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 text-white rounded-lg font-semibold transition flex items-center"
            style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Partner
          </button>
        )}
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
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type Filter
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ outlineColor: '#1f3d88' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            >
              <option value="">All Types</option>
              <option value="VENDOR">Vendor (Outgoing Only)</option>
              <option value="CUSTOMER">Customer (Incoming Only)</option>
              <option value="RECIPROCAL">Reciprocal (Bidirectional)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading partners...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Partner Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Partner Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.partner_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/partners/${partner.partner_id}`}
                        className="font-medium"
                        style={{ color: '#1f3d88' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#163368'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#1f3d88'}
                      >
                        {partner.partner_code}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{partner.partner_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {partner.partner_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{partner.country_code}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          partner.status
                        )}`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {partner.contact_email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(partner.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {partner.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(partner.partner_id, 'ACTIVE')}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Activate
                          </button>
                        )}
                        {partner.status === 'ACTIVE' && (
                          <button
                            onClick={() => updateStatus(partner.partner_id, 'SUSPENDED')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Suspend
                          </button>
                        )}
                        <Link
                          href={`/dashboard?partner=${partner.partner_id}`}
                          className="px-3 py-1 text-xs text-white rounded"
                          style={{ backgroundColor: '#1f3d88' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163368'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f3d88'}
                        >
                          Dashboard
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteClick(partner.partner_id, partner.partner_name)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            title="Delete partner"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Partner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Partners</div>
          <div className="text-3xl font-bold text-gray-900">{partners.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {partners.filter((p) => p.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">
            {partners.filter((p) => p.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Suspended</div>
          <div className="text-3xl font-bold text-orange-600">
            {partners.filter((p) => p.status === 'SUSPENDED').length}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Partner</h3>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete partner <strong className="text-gray-900">{deleteConfirm.partnerName}</strong>?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This will permanently remove the partner and all associated data including agreements, rate sheets, and invoices.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Delete Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Partner Modal */}
      {showCreateForm && (
        <CreatePartnerForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            fetchPartners(); // Refresh the partners list
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}
