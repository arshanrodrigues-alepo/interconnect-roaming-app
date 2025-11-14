'use client';

import { useState, useEffect } from 'react';
import { Anomaly } from '@/lib/types';
import { formatDateTime, getSeverityColor, getStatusColor } from '@/lib/utils/helpers';

export default function FraudMonitoringPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    fetchAnomalies();
  }, [severityFilter]);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter) params.append('severity', severityFilter);

      const response = await fetch(`/api/fraud/anomalies?${params}`);
      const data = await response.json();
      setAnomalies(data.anomalies);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fraud Detection & Security Monitoring</h1>
        <p className="text-gray-600 mt-2">Real-time anomaly detection and fraud prevention</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-2">Total Anomalies</div>
          <div className="text-3xl font-bold text-gray-900">{anomalies.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-2">Critical</div>
          <div className="text-3xl font-bold text-red-600">
            {anomalies.filter((a) => a.severity === 'CRITICAL').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-2">High</div>
          <div className="text-3xl font-bold text-orange-600">
            {anomalies.filter((a) => a.severity === 'HIGH').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-2">Open Issues</div>
          <div className="text-3xl font-bold text-blue-600">
            {anomalies.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Filter
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            Loading anomalies...
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div
              key={anomaly.anomaly_id}
              className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition border-l-4 ${
                anomaly.severity === 'CRITICAL'
                  ? 'border-red-500'
                  : anomaly.severity === 'HIGH'
                  ? 'border-orange-500'
                  : anomaly.severity === 'MEDIUM'
                  ? 'border-yellow-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {anomaly.anomaly_type.replace(/_/g, ' ')}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        anomaly.status
                      )}`}
                    >
                      {anomaly.status}
                    </span>
                  </div>
                  {anomaly.investigated_by && (
                    <div className="text-sm text-gray-600">
                      Investigated by: {anomaly.investigated_by}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Detected: {formatDateTime(anomaly.detected_at)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 font-medium mb-2">{anomaly.description}</p>
                {anomaly.affected_services.length > 0 && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">Affected Services:</span>
                    {anomaly.affected_services.map((service) => (
                      <span
                        key={service}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metrics */}
              {anomaly.metrics && Object.keys(anomaly.metrics).length > 0 && (
                <div className="mb-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Metrics:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(anomaly.metrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-xs text-gray-600">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-semibold text-blue-900 mb-1">
                  Recommended Action:
                </div>
                <p className="text-sm text-blue-800">{anomaly.recommended_action}</p>
              </div>

              {/* Investigation Notes */}
              {anomaly.investigation_notes && (
                <div className="mb-4 border-t pt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Investigation Notes:
                  </div>
                  <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                    {anomaly.investigation_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {anomaly.status === 'OPEN' && (
                  <>
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Start Investigation
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Block Traffic
                    </button>
                  </>
                )}
                {anomaly.status === 'INVESTIGATING' && (
                  <>
                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Mark Resolved
                    </button>
                    <button className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                      False Positive
                    </button>
                  </>
                )}
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  View Partner Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fraud Detection Info */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mt-8 text-white">
        <h3 className="text-xl font-bold mb-3">Detection Patterns Active</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm">Traffic Volume Monitoring</div>
            <div className="font-bold">Active</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm">Premium Rate Detection</div>
            <div className="font-bold">Active</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm">Velocity Checking</div>
            <div className="font-bold">Active</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm">Success Rate Monitoring</div>
            <div className="font-bold">Active</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm">Call Duration Analysis</div>
            <div className="font-bold">Active</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm">Off-Peak Traffic Analysis</div>
            <div className="font-bold">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
