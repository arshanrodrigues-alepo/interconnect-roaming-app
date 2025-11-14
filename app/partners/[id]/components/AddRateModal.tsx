'use client';

import { useState } from 'react';
import { Rate, ServiceType, Direction, RoundingRule } from '@/lib/types';

interface AddRateModalProps {
  rateSheetId: string;
  onClose: () => void;
  onSuccess: (rate: Rate) => void;
}

export default function AddRateModal({
  rateSheetId,
  onClose,
  onSuccess,
}: AddRateModalProps) {
  const [formData, setFormData] = useState({
    service_type: 'VOICE' as ServiceType,
    direction: 'INBOUND' as Direction,
    called_number_prefix: '',
    rate_per_unit: '',
    currency: 'USD',
    minimum_charge: '',
    rounding_rule: 'UP' as RoundingRule,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        rate_per_unit: parseFloat(formData.rate_per_unit),
        minimum_charge: formData.minimum_charge
          ? parseFloat(formData.minimum_charge)
          : undefined,
      };

      const response = await fetch(`/api/rate-sheets/${rateSheetId}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create rate');
      }

      const newRate = await response.json();
      onSuccess(newRate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Rate</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  required
                  value={formData.service_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_type: e.target.value as ServiceType,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="VOICE">Voice</option>
                  <option value="SMS">SMS</option>
                  <option value="DATA">Data</option>
                  <option value="MMS">MMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direction *
                </label>
                <select
                  required
                  value={formData.direction}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      direction: e.target.value as Direction,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="INBOUND">Inbound</option>
                  <option value="OUTBOUND">Outbound</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Called Number Prefix *
              </label>
              <input
                type="text"
                required
                value={formData.called_number_prefix}
                onChange={(e) =>
                  setFormData({ ...formData, called_number_prefix: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., +1, +44, +81"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the destination prefix (e.g., +1 for USA/Canada, +44 for UK)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per Unit *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.rate_per_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, rate_per_unit: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.0150"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.service_type === 'VOICE'
                    ? 'Per second'
                    : formData.service_type === 'SMS'
                    ? 'Per message'
                    : 'Per MB'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CNY">CNY</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Charge
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimum_charge}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_charge: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rounding Rule *
              </label>
              <select
                required
                value={formData.rounding_rule}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rounding_rule: e.target.value as RoundingRule,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="UP">Round Up (to next minute)</option>
                <option value="DOWN">Round Down</option>
                <option value="NEAREST">Round to Nearest</option>
                <option value="NONE">No Rounding</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {formData.service_type === 'VOICE'
                  ? 'Applies to duration in seconds'
                  : 'Typically not used for SMS/Data'}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
