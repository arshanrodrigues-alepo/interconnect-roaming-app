'use client';

import { useState } from 'react';
import { RateSheet, Rate } from '@/lib/types';
import { formatDate } from '@/lib/utils/helpers';

interface RateSheetWithRates extends RateSheet {
  rates: Rate[];
}

interface RateSheetsSectionProps {
  rateSheets: RateSheetWithRates[];
  partnerId: string;
  onAddRateSheet?: () => void;
  onAddRate?: (rateSheetId: string) => void;
}

export default function RateSheetsSection({
  rateSheets,
  partnerId,
  onAddRateSheet,
  onAddRate,
}: RateSheetsSectionProps) {
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);

  const toggleSheet = (sheetId: string) => {
    setExpandedSheet(expandedSheet === sheetId ? null : sheetId);
  };

  const groupRatesByService = (rates: Rate[]) => {
    const grouped: Record<string, Rate[]> = {};
    rates.forEach((rate) => {
      const key = `${rate.service_type}-${rate.direction}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(rate);
    });
    return grouped;
  };

  const formatRatePerUnit = (rate: Rate) => {
    if (rate.service_type === 'VOICE') {
      return `${rate.currency} ${rate.rate_per_unit.toFixed(4)}/sec`;
    } else if (rate.service_type === 'SMS') {
      return `${rate.currency} ${rate.rate_per_unit.toFixed(4)}/msg`;
    }
    return `${rate.currency} ${rate.rate_per_unit.toFixed(4)}`;
  };

  if (rateSheets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rate Sheets</h2>
        </div>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Rate Sheets</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new rate sheet.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onAddRateSheet}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition"
            >
              Create Rate Sheet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rate Sheets</h2>
        {onAddRateSheet && (
          <button
            onClick={onAddRateSheet}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition flex items-center"
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
            Add Rate Sheet
          </button>
        )}
      </div>

      <div className="space-y-4">
        {rateSheets.map((sheet) => (
          <div
            key={sheet.rate_sheet_id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div
              className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => toggleSheet(sheet.rate_sheet_id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedSheet === sheet.rate_sheet_id ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sheet.rate_sheet_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Effective: {formatDate(sheet.effective_date)}
                      {sheet.expiry_date && ` - ${formatDate(sheet.expiry_date)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      sheet.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {sheet.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {sheet.rates.length} {sheet.rates.length === 1 ? 'rate' : 'rates'}
                  </span>
                </div>
              </div>
            </div>

            {expandedSheet === sheet.rate_sheet_id && (
              <div className="px-6 py-4 bg-white">
                <div className="flex justify-end mb-4">
                  {onAddRate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddRate(sheet.rate_sheet_id);
                      }}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Add Rate
                    </button>
                  )}
                </div>
                {sheet.rates.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No rates defined for this rate sheet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupRatesByService(sheet.rates)).map(
                      ([serviceKey, rates]) => {
                        const [serviceType, direction] = serviceKey.split('-');
                        return (
                          <div key={serviceKey}>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                              {serviceType} - {direction}
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                      Prefix
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                      Rate
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                      Min Charge
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                      Rounding
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {rates.map((rate) => (
                                    <tr key={rate.rate_id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {rate.called_number_prefix || 'All'}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                        {formatRatePerUnit(rate)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {rate.minimum_charge
                                          ? `${rate.currency} ${rate.minimum_charge.toFixed(2)}`
                                          : 'None'}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {rate.rounding_rule}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
