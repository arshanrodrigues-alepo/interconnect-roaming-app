'use client';

import { useState } from 'react';
import { Partner, AgreementType, BillingCycle } from '@/lib/types';

interface CreateAgreementFormProps {
  partners: Partner[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAgreementForm({ partners, onClose, onSuccess }: CreateAgreementFormProps) {
  const [step, setStep] = useState<'agreement' | 'rateplans'>('agreement');
  const [createdAgreementId, setCreatedAgreementId] = useState<string>('');

  const [formData, setFormData] = useState({
    partner_id: '',
    agreement_type: 'BOTH' as AgreementType,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    currency: 'USD',
    billing_cycle: 'MONTHLY' as BillingCycle,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateAgreementForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.partner_id) {
      newErrors.partner_id = 'Please select a partner';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (formData.end_date && formData.end_date <= formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateAgreementForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create agreement');
      }

      const newAgreement = await response.json();
      console.log('Agreement created successfully:', newAgreement);

      setCreatedAgreementId(newAgreement.agreement_id);
      setStep('rateplans');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create agreement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  if (step === 'rateplans') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Add Rate Plans</h2>
                <p className="text-green-100 mt-1">Agreement created! Now add rate plans (optional)</p>
              </div>
              <button
                onClick={handleFinish}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Rate Plans Section */}
          <div className="p-8">
            <AddRatePlansSection
              agreementId={createdAgreementId}
              currency={formData.currency}
              onFinish={handleFinish}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Agreement</h2>
              <p className="text-purple-100 mt-1">Step 1: Agreement Details</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateAgreement} className="p-8 space-y-6">
          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Partner Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Partner <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.partner_id}
              onChange={(e) => handleChange('partner_id', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.partner_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a partner</option>
              {partners
                .filter((p) => p.status === 'ACTIVE')
                .map((partner) => (
                  <option key={partner.partner_id} value={partner.partner_id}>
                    {partner.partner_name} ({partner.partner_code}) - {partner.country_code}
                  </option>
                ))}
            </select>
            {errors.partner_id && (
              <p className="mt-1 text-sm text-red-600">{errors.partner_id}</p>
            )}
          </div>

          {/* Agreement Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Agreement Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.agreement_type}
              onChange={(e) => handleChange('agreement_type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="INTERCONNECT">Interconnect Only</option>
              <option value="ROAMING">Roaming Only</option>
              <option value="BOTH">Both (Interconnect & Roaming)</option>
            </select>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Leave blank for indefinite</p>
            </div>
          </div>

          {/* Currency & Billing Cycle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Billing Cycle <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) => handleChange('billing_cycle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-purple-800">
                <p className="font-semibold mb-1">Next Step: Rate Plans</p>
                <p>
                  After creating the agreement, you'll be able to add multiple rate plans
                  for different services (Voice, SMS, Data, MMS) and directions (Inbound/Outbound).
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Agreement...
                </>
              ) : (
                <>
                  Create & Continue
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Rate Plans Section Component
function AddRatePlansSection({
  agreementId,
  currency,
  onFinish
}: {
  agreementId: string;
  currency: string;
  onFinish: () => void;
}) {
  const [ratePlans, setRatePlans] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rate Plans</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add rate plans for different services and directions
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Rate Plan
        </button>
      </div>

      {/* Rate Plans List */}
      {ratePlans.length > 0 ? (
        <div className="space-y-3">
          {ratePlans.map((plan, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {plan.service_type} - {plan.direction}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Rate: {currency} {plan.rate_per_unit} per {plan.service_type === 'VOICE' ? 'second' : plan.service_type === 'DATA' ? 'MB' : 'message'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Effective from {plan.effective_from}
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Added</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No rate plans added yet</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Rate Plan" to create rate cards for this agreement</p>
        </div>
      )}

      {/* Add Rate Plan Form */}
      {showAddForm && (
        <AddRatePlanForm
          agreementId={agreementId}
          currency={currency}
          onCancel={() => setShowAddForm(false)}
          onSuccess={(newPlan) => {
            setRatePlans([...ratePlans, newPlan]);
            setShowAddForm(false);
          }}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={onFinish}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          {ratePlans.length > 0 ? 'Finish & View Agreement' : 'Skip & Finish'}
        </button>
      </div>
    </div>
  );
}

// Add Rate Plan Form Component
function AddRatePlanForm({
  agreementId,
  currency,
  onCancel,
  onSuccess,
}: {
  agreementId: string;
  currency: string;
  onCancel: () => void;
  onSuccess: (plan: any) => void;
}) {
  const [formData, setFormData] = useState({
    service_id: 'svc-voice-001',
    service_type: 'VOICE',
    direction: 'INBOUND',
    rate_per_unit: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    rounding_rule: 'UP',
    minimum_charge: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/rate-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          agreement_id: agreementId,
          currency,
          rate_per_unit: parseFloat(formData.rate_per_unit),
          minimum_charge: formData.minimum_charge ? parseFloat(formData.minimum_charge) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create rate plan');
      }

      const newPlan = await response.json();
      onSuccess({ ...formData, ...newPlan });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-purple-200 rounded-lg p-6 bg-purple-50 space-y-4">
      <h4 className="font-semibold text-gray-900 mb-4">New Rate Plan</h4>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            value={formData.service_type}
            onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="VOICE">Voice</option>
            <option value="SMS">SMS</option>
            <option value="DATA">Data</option>
            <option value="MMS">MMS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
          <select
            value={formData.direction}
            onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="INBOUND">Inbound</option>
            <option value="OUTBOUND">Outbound</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate per Unit ({currency})
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.rate_per_unit}
            onChange={(e) => setFormData({ ...formData, rate_per_unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="0.0050"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Charge ({currency}) - Optional
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.minimum_charge}
            onChange={(e) => setFormData({ ...formData, minimum_charge: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
          <input
            type="date"
            value={formData.effective_from}
            onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rounding Rule</label>
          <select
            value={formData.rounding_rule}
            onChange={(e) => setFormData({ ...formData, rounding_rule: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="UP">Round Up</option>
            <option value="DOWN">Round Down</option>
            <option value="NEAREST">Round to Nearest</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Rate Plan'}
        </button>
      </div>
    </form>
  );
}
