'use client';

import { useEffect, useState } from 'react';

interface Partner {
  id: string;
  partnerName: string;
  partnerCode: string;
}

interface QoSReport {
  carrier: Partner;
  summary: {
    overallAsr: number;
    overallAcd: number;
    overallNer: number;
    overallPdd: number;
    totalCalls: string;
    qualityRating: string;
    destinationCount: number;
  };
  byDestination: any[];
}

export default function QoSPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [report, setReport] = useState<QoSReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    if (!selectedCarrier) return;

    setLoadingReport(true);
    setReport(null);

    try {
      const response = await fetch(`/api/qos/report?carrierId=${selectedCarrier}`);
      const data = await response.json();
      if (!response.ok) {
        console.error('Error:', data.error);
      } else {
        setReport(data);
      }
    } catch (error) {
      console.error('Error fetching QoS report:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  const getQualityColor = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'GOOD':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'POOR':
        return 'bg-red-100 text-red-800 border-red-200';
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
          <h1 className="text-3xl font-bold text-gray-900">Quality of Service (QoS) Tracking</h1>
          <p className="text-gray-600 mt-2">
            Monitor ASR, ACD, NER, and PDD metrics to ensure carrier quality standards
          </p>
        </div>

        {/* Carrier Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate QoS Report</h2>
          <div className="flex gap-4">
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ focusRingColor: '#1f3d88' }}
            >
              <option value="">Select a carrier...</option>
              {partners.map((partner, index) => (
                <option key={`partner-${partner.id || index}`} value={partner.id}>
                  {partner.partnerName} ({partner.partnerCode})
                </option>
              ))}
            </select>
            <button
              onClick={fetchReport}
              disabled={!selectedCarrier || loadingReport}
              className="px-6 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
              onMouseEnter={(e) => !loadingReport && (e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
            >
              {loadingReport ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* QoS Report */}
        {loadingReport ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#1f3d88' }}></div>
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{report.carrier.partnerName}</h2>
                  <p className="text-gray-600">{report.carrier.partnerCode}</p>
                </div>
                <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getQualityColor(report.summary.qualityRating)}`}>
                  {report.summary.qualityRating}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">ASR (Answer Seizure Ratio)</div>
                  <div className="text-2xl font-bold text-gray-900">{report.summary.overallAsr}%</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">ACD (Avg Call Duration)</div>
                  <div className="text-2xl font-bold text-gray-900">{report.summary.overallAcd}s</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">NER (Network Effectiveness)</div>
                  <div className="text-2xl font-bold text-gray-900">{report.summary.overallNer}%</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">PDD (Post Dial Delay)</div>
                  <div className="text-2xl font-bold text-gray-900">{report.summary.overallPdd}ms</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Calls</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {parseInt(report.summary.totalCalls).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* By Destination */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                QoS by Destination ({report.summary.destinationCount})
              </h2>

              {report.byDestination.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No destination-level metrics available
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          ASR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          ACD
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          NER
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          PDD
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Total Calls
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.byDestination.map((dest: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                            {dest.destinationCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dest.avgAsr}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dest.avgAcd}s
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dest.avgNer}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dest.avgPdd}ms
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parseInt(dest.totalCalls).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">Select a carrier and generate a report to view QoS metrics</p>
          </div>
        )}
      </div>
    </div>
  );
}
