'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Partner {
  partner_id: string;
  partner_name: string;
  partner_code: string;
}

export default function ImportPricelistPage() {
  const router = useRouter();
  const [carriers, setCarriers] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    carrierId: '',
    effectiveDate: '',
    expiryDate: '',
    noticePeriodDays: 30,
    updateType: 'FULL',
  });

  const [csvData, setCsvData] = useState('');

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      // Filter to show only VENDOR partners (carriers we can buy from)
      const vendorPartners = (data.partners || []).filter((p: Partner) => p.partner_type === 'VENDOR');
      setCarriers(vendorPartners);
    } catch (error) {
      console.error('Error fetching carriers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvData(content);
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
    try {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row');
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      // Validate headers
      const requiredHeaders = ['destination_code', 'destination_name', 'rate_per_minute'];
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        alert(`Missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }

      // Parse data rows
      const rates = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length !== headers.length) continue;

        const rate: any = {};
        headers.forEach((header, index) => {
          rate[header] = values[index];
        });

        rates.push({
          destinationCode: rate.destination_code,
          destinationName: rate.destination_name,
          ratePerMinute: parseFloat(rate.rate_per_minute),
          billingIncrement: rate.billing_increment || 'PER_SECOND',
          asrPercentage: rate.asr_percentage ? parseFloat(rate.asr_percentage) : null,
          acdSeconds: rate.acd_seconds ? parseInt(rate.acd_seconds) : null,
          peakRate: rate.peak_rate ? parseFloat(rate.peak_rate) : null,
          offpeakRate: rate.offpeak_rate ? parseFloat(rate.offpeak_rate) : null,
        });
      }

      setParseResult({
        success: true,
        totalRates: rates.length,
        rates,
        preview: rates.slice(0, 5),
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Failed to parse CSV file. Please check the format.');
    }
  };

  const handleImport = async () => {
    if (!formData.carrierId || !formData.effectiveDate || !parseResult?.rates) {
      alert('Please fill in all required fields and upload a valid CSV file');
      return;
    }

    setImporting(true);

    try {
      const response = await fetch('/api/lcr/pricelists/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rates: parseResult.rates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details
          ? `${data.error}: ${data.details}`
          : data.error || 'Failed to import pricelist';
        throw new Error(errorMsg);
      }

      alert(`Pricelist imported successfully! ${parseResult.totalRates} rates added.`);
      router.push('/lcr');
    } catch (error) {
      console.error('Error importing pricelist:', error);
      alert(error instanceof Error ? error.message : 'Failed to import pricelist');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/lcr')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to LCR
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Import Carrier Pricelist</h1>
          <p className="text-gray-600 mt-2">
            Upload carrier pricing data for least cost routing analysis
          </p>
        </div>

        {/* Pricelist Details Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pricelist Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrier *
              </label>
              <select
                value={formData.carrierId}
                onChange={(e) => setFormData({ ...formData, carrierId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#1f3d88' }}
              >
                <option value="">Select a carrier</option>
                {carriers.map((carrier) => (
                  <option key={carrier.partner_id} value={carrier.partner_id}>
                    {carrier.partner_name} ({carrier.partner_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#1f3d88' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#1f3d88' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Period (days)
                </label>
                <input
                  type="number"
                  value={formData.noticePeriodDays}
                  onChange={(e) => setFormData({ ...formData, noticePeriodDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#1f3d88' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Type
                </label>
                <select
                  value={formData.updateType}
                  onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#1f3d88' }}
                >
                  <option value="FULL">Full Replacement</option>
                  <option value="PARTIAL">Partial Update</option>
                  <option value="DELTA">Delta Update</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CSV Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Rates CSV</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File *
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              CSV format: destination_code, destination_name, rate_per_minute, billing_increment (optional),
              asr_percentage (optional), acd_seconds (optional)
            </p>
          </div>

          {/* CSV Format Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Example:</h3>
            <pre className="text-xs text-blue-800 overflow-x-auto">
{`destination_code,destination_name,rate_per_minute,billing_increment,asr_percentage,acd_seconds
1,USA & Canada,0.0089,PER_SECOND,92.5,180
44,United Kingdom,0.0095,PER_SECOND,95.0,210
971,UAE,0.0240,PER_SECOND,88.0,170`}
            </pre>
          </div>
        </div>

        {/* Parse Result Preview */}
        {parseResult && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Parsed Data Preview
            </h2>

            <div className="mb-4">
              <div className="text-sm text-gray-600">
                Total rates found: <span className="font-semibold text-gray-900">{parseResult.totalRates}</span>
              </div>
            </div>

            {parseResult.preview && parseResult.preview.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Destination</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Rate/min</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">ASR %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">ACD (s)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parseResult.preview.map((rate: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{rate.destinationCode}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{rate.destinationName}</td>
                        <td className="px-4 py-2 text-sm font-semibold" style={{ color: '#1f3d88' }}>
                          ${rate.ratePerMinute.toFixed(4)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{rate.asrPercentage || '-'}%</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{rate.acdSeconds || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parseResult.totalRates > 5 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Showing first 5 of {parseResult.totalRates} rates
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push('/lcr')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !formData.carrierId || !formData.effectiveDate || !parseResult}
            className="px-6 py-3 text-white rounded-lg font-semibold transition disabled:opacity-50"
            style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
            onMouseEnter={(e) => !importing && (e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
          >
            {importing ? 'Importing...' : 'Import Pricelist'}
          </button>
        </div>
      </div>
    </div>
  );
}
