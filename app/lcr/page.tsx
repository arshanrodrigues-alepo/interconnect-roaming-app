'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Pricelist {
  id: string;
  carrier: {
    id: string;
    partnerName: string;
    partnerCode: string;
  };
  effectiveDate: string;
  expiryDate: string | null;
  status: string;
  rates: any[];
}

export default function LCRPage() {
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinationCode, setDestinationCode] = useState('');
  const [routingResult, setRoutingResult] = useState<any>(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  useEffect(() => {
    fetchPricelists();
  }, []);

  const fetchPricelists = async () => {
    try {
      const response = await fetch('/api/lcr/pricelists');
      const data = await response.json();
      setPricelists(data.pricelists || []);
    } catch (error) {
      console.error('Error fetching pricelists:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!destinationCode.trim()) return;

    setCalculatingRoute(true);
    setRoutingResult(null);

    try {
      const response = await fetch('/api/lcr/routing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationCode })
      });
      const data = await response.json();
      setRoutingResult(data);
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setCalculatingRoute(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXPIRED':
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Least Cost Routing (LCR)</h1>
              <p className="text-gray-600 mt-2">
                Optimize outbound traffic routing based on cost and quality metrics
              </p>
            </div>
            <Link
              href="/lcr/import"
              className="px-6 py-3 text-white rounded-lg font-semibold transition"
              style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
            >
              Import Pricelist
            </Link>
          </div>
        </div>

        {/* Route Calculator */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Calculate Best Route</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={destinationCode}
              onChange={(e) => setDestinationCode(e.target.value)}
              placeholder="Enter destination code (e.g., 1, 44, 971)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ focusRingColor: '#1f3d88' }}
              onKeyPress={(e) => e.key === 'Enter' && calculateRoute()}
            />
            <button
              onClick={calculateRoute}
              disabled={calculatingRoute || !destinationCode.trim()}
              className="px-6 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
              onMouseEnter={(e) => !calculatingRoute && (e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
            >
              {calculatingRoute ? 'Calculating...' : 'Calculate'}
            </button>
          </div>

          {/* Routing Result */}
          {routingResult && (
            <div className="mt-6">
              {routingResult.success ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Recommended Route
                    </h3>
                    <div className="border rounded-lg p-4" style={{ borderColor: '#1f3d88' }}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Carrier</label>
                          <div className="font-semibold text-gray-900">
                            {routingResult.recommendedRoute.carrierName}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Destination</label>
                          <div className="font-semibold text-gray-900">
                            {routingResult.recommendedRoute.destinationName}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Rate</label>
                          <div className="font-semibold" style={{ color: '#1f3d88' }}>
                            ${routingResult.recommendedRoute.ratePerMinute}/min
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">ASR</label>
                          <div className="font-semibold text-gray-900">
                            {routingResult.recommendedRoute.asrPercentage || 'N/A'}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {routingResult.alternativeRoutes && routingResult.alternativeRoutes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Alternative Routes ({routingResult.alternativeRoutes.length})
                      </h3>
                      <div className="space-y-2">
                        {routingResult.alternativeRoutes.map((route: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>{route.carrierName}</div>
                              <div>{route.destinationName}</div>
                              <div className="font-semibold">${route.ratePerMinute}/min</div>
                              <div>ASR: {route.asrPercentage || 'N/A'}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  {routingResult.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricelists */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Pricelists</h2>

          {pricelists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No pricelists found. Import your first pricelist to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Carrier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Effective Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Rates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pricelists.map((pricelist) => (
                    <tr key={pricelist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {pricelist.carrier.partnerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {pricelist.carrier.partnerCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pricelist.effectiveDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pricelist.expiryDate
                          ? new Date(pricelist.expiryDate).toLocaleDateString()
                          : 'No expiry'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pricelist.rates?.length || 0} rates
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(pricelist.status)}`}>
                          {pricelist.status}
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
    </div>
  );
}
