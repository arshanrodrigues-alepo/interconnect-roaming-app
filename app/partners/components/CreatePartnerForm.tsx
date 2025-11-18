'use client';

import { useState } from 'react';
import { PartnerType } from '@/lib/types';

interface CreatePartnerFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePartnerForm({ onClose, onSuccess }: CreatePartnerFormProps) {
  const [step, setStep] = useState<1 | 2>(1); // Two-step form: 1=Partner, 2=Agreement
  const [createdPartnerId, setCreatedPartnerId] = useState<string>('');

  const [formData, setFormData] = useState({
    partner_code: '',
    partner_name: '',
    partner_type: 'VENDOR' as PartnerType,
    country_code: '',
    contact_email: '',
    contact_phone: '',
  });

  const [agreementData, setAgreementData] = useState({
    agreement_name: '',
    agreement_type: 'INTERCONNECT' as 'INTERCONNECT' | 'ROAMING' | 'BOTH',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    currency: 'USD',
    billing_cycle: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'CUSTOM',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Partner Code validation (TADIG format)
    if (!formData.partner_code) {
      newErrors.partner_code = 'Partner code is required';
    } else if (!/^[A-Z]{5}\d$/.test(formData.partner_code)) {
      newErrors.partner_code = 'Partner code must be 5 uppercase letters followed by 1 digit (e.g., USAVZ1)';
    }

    // Partner Name validation
    if (!formData.partner_name) {
      newErrors.partner_name = 'Partner name is required';
    } else if (formData.partner_name.length < 3) {
      newErrors.partner_name = 'Partner name must be at least 3 characters';
    }

    // Country Code validation (ISO 3166-1 alpha-3)
    if (!formData.country_code) {
      newErrors.country_code = 'Country code is required';
    } else if (!/^[A-Z]{3}$/.test(formData.country_code)) {
      newErrors.country_code = 'Country code must be 3 uppercase letters (e.g., USA)';
    }

    // Contact Email validation
    if (!formData.contact_email) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    // Contact Phone validation (optional but must be valid if provided)
    if (formData.contact_phone && !/^\+?[\d\s-()]+$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create partner');
      }

      const newPartner = await response.json();
      console.log('Partner created successfully:', newPartner);

      setCreatedPartnerId(newPartner.partner_id);
      setStep(2); // Move to agreement creation step
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create partner');
    } finally {
      setLoading(false);
    }
  };

  const handleAgreementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);

    try {
      const response = await fetch('/api/agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...agreementData,
          partner_id: createdPartnerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create agreement');
      }

      console.log('Agreement created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create agreement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 rounded-t-2xl" style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {step === 1 ? 'Onboard New Partner' : 'Create Agreement'}
              </h2>
              <p className="text-purple-100 mt-1">
                {step === 1 ? 'Add a new roaming/interconnect partner' : 'Define the commercial agreement'}
              </p>
              {/* Progress Indicator */}
              <div className="flex items-center space-x-2 mt-3">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-white' : 'text-white'}`} style={step === 1 ? { color: '#1f3d88' } : { backgroundColor: '#4a6bb5' }}>
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <span className="ml-2 text-sm" style={{ color: '#d1dcef' }}>Partner</span>
                </div>
                <div className="w-12 h-0.5" style={{ backgroundColor: '#4a6bb5' }}></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-white' : 'text-white'}`} style={step === 2 ? { color: '#1f3d88' } : { backgroundColor: '#4a6bb5' }}>
                    2
                  </div>
                  <span className="ml-2 text-sm" style={{ color: '#d1dcef' }}>Agreement</span>
                </div>
              </div>
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
        {step === 1 ? (
          <form onSubmit={handlePartnerSubmit} className="p-8 space-y-6">
          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Partner Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Partner Code (TADIG) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.partner_code}
              onChange={(e) => handleChange('partner_code', e.target.value.toUpperCase())}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.partner_code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="USAVZ1"
              maxLength={6}
            />
            {errors.partner_code && (
              <p className="mt-1 text-sm text-red-600">{errors.partner_code}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: 5 uppercase letters + 1 digit (e.g., USAVZ1)
            </p>
          </div>

          {/* Partner Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Partner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.partner_name}
              onChange={(e) => handleChange('partner_name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.partner_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Verizon Wireless"
            />
            {errors.partner_name && (
              <p className="mt-1 text-sm text-red-600">{errors.partner_name}</p>
            )}
          </div>

          {/* Partner Type & Country Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Partner Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.partner_type}
                onChange={(e) => handleChange('partner_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outlineColor: '#1f3d88' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              >
                <option value="VENDOR">Vendor (Outgoing Only)</option>
                <option value="CUSTOMER">Customer (Incoming Only)</option>
                <option value="RECIPROCAL">Reciprocal (Bidirectional)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Vendor: You send traffic to them | Customer: They send traffic to you | Reciprocal: Both directions
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country Code (ISO) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.country_code}
                onChange={(e) => handleChange('country_code', e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  errors.country_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="USA"
                maxLength={3}
              />
              {errors.country_code && (
                <p className="mt-1 text-sm text-red-600">{errors.country_code}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">ISO 3166-1 alpha-3 (e.g., USA, GBR)</p>
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.contact_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="roaming@example.com"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.contact_phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+1-555-0100"
            />
            {errors.contact_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#e8edf7', borderColor: '#a3b9df', borderWidth: '1px' }}>
            <div className="flex items-start">
              <svg
                className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
                style={{ color: '#1f3d88' }}
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
                <p className="font-semibold mb-1">Onboarding Process</p>
                <p>
                  New partners will be created with status <strong>PENDING</strong>. After
                  creating the partner, you can:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create agreements and rate plans</li>
                  <li>Upload RAEX IR.21 technical forms</li>
                  <li>Activate the partner when ready</li>
                </ul>
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
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Partner...
                </>
              ) : (
                'Next: Create Agreement →'
              )}
            </button>
          </div>
        </form>
        ) : (
          /* Step 2: Agreement Form */
          <form onSubmit={handleAgreementSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}

            {/* Success Message for Partner Creation */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Partner <strong>{formData.partner_name}</strong> created successfully! Now create the agreement.
              </p>
            </div>

            {/* Agreement Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Agreement Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={agreementData.agreement_name}
                onChange={(e) => setAgreementData({ ...agreementData, agreement_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Master Interconnect Agreement 2025"
                required
              />
            </div>

            {/* Agreement Type & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agreement Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={agreementData.agreement_type}
                  onChange={(e) => setAgreementData({ ...agreementData, agreement_type: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="INTERCONNECT">Interconnect</option>
                  <option value="ROAMING">Roaming</option>
                  <option value="BOTH">Both (Interconnect & Roaming)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={agreementData.currency}
                  onChange={(e) => setAgreementData({ ...agreementData, currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={agreementData.start_date}
                  onChange={(e) => setAgreementData({ ...agreementData, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={agreementData.end_date}
                  onChange={(e) => setAgreementData({ ...agreementData, end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty for indefinite agreement</p>
              </div>
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Billing Cycle <span className="text-red-500">*</span>
              </label>
              <select
                value={agreementData.billing_cycle}
                onChange={(e) => setAgreementData({ ...agreementData, billing_cycle: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">Next Steps</p>
                  <p>After creating the agreement, you can add rate sheets and configure detailed pricing for different services.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                disabled={loading}
              >
                ← Back
              </button>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Skip Agreement
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    'Create Agreement & Finish'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
