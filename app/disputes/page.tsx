'use client';

import { useState, useEffect } from 'react';
import { Dispute } from '@/lib/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils/helpers';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/disputes?${params}`);
      const data = await response.json();
      setDisputes(data.disputes);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-600 mt-2">Track and resolve partner disputes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Disputes</div>
          <div className="text-3xl font-bold text-gray-900">{disputes.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Open</div>
          <div className="text-3xl font-bold text-orange-600">
            {disputes.filter((d) => d.status === 'OPEN').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">In Review</div>
          <div className="text-3xl font-bold text-blue-600">
            {disputes.filter((d) => d.status === 'IN_REVIEW').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Resolved</div>
          <div className="text-3xl font-bold text-green-600">
            {disputes.filter((d) => d.status === 'RESOLVED').length}
          </div>
        </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            Loading disputes...
          </div>
        ) : (
          disputes.map((dispute) => (
            <div
              key={dispute.dispute_id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {dispute.dispute_number}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        dispute.status
                      )}`}
                    >
                      {dispute.status}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {dispute.dispute_type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Created by: {dispute.created_by ? dispute.created_by.name : 'Unknown'}
                  </div>
                  {dispute.assigned_to && (
                    <div className="text-sm text-gray-600">
                      Assigned to: {dispute.assigned_to.name}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {dispute.disputed_amount && (
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {formatCurrency(dispute.disputed_amount)}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">{formatDate(dispute.created_at)}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Description:</div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {dispute.description}
                </p>
              </div>

              {dispute.resolution && (
                <div className="mb-4 border-t pt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Resolution:</div>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                    {dispute.resolution}
                  </p>
                  {dispute.resolved_at && (
                    <div className="text-sm text-gray-500 mt-2">
                      Resolved on: {formatDate(dispute.resolved_at)}
                    </div>
                  )}
                </div>
              )}

              {dispute.invoice_id && (
                <div className="text-sm text-gray-600 mb-4">
                  Related Invoice ID: <span className="font-mono">{dispute.invoice_id}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  View Details
                </button>
                {dispute.status === 'OPEN' && (
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Start Review
                  </button>
                )}
                {dispute.status === 'IN_REVIEW' && (
                  <>
                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Resolve
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
