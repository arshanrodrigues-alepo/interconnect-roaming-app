'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { mockUsers, mockPasswords } from '@/lib/mock-data/users';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login({ email, password });

    if (success) {
      // Redirect based on role
      const user = mockUsers.find((u) => u.email === email);
      if (user?.role === 'PARTNER') {
        router.push(`/dashboard?partner=${user.partner_id}`);
      } else {
        router.push('/admin');
      }
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword(mockPasswords[email]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-fuchsia-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center">
              <img src="/selfcare_logo.png" alt="Logo" className="flex justify-center items-center" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interconnect & Roaming
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email Address
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="master or your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              {showDemoCredentials ? '▼ Hide Demo Credentials' : '▶ Show Demo Credentials'}
            </button>
          </div>

          {/* Demo Credentials */}
          {showDemoCredentials && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Quick Login (Demo)
                </h3>

                {/* Master Admin Account - Highlighted */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Master Account
                  </div>
                  <button
                    onClick={() => quickLogin('master')}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition shadow-lg"
                  >
                    <div className="font-bold text-white text-lg">Master Administrator</div>
                    <div className="text-sm text-purple-100 mt-1">Username: master</div>
                    <div className="text-sm text-purple-100">Password: admin</div>
                    <div className="text-xs text-purple-200 mt-2">✨ Full System Access</div>
                  </button>
                </div>

                {/* Admin Accounts */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Admin Accounts
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => quickLogin('admin@interconnect.com')}
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                    >
                      <div className="font-medium text-purple-900">System Administrator</div>
                      <div className="text-xs text-purple-700">admin@interconnect.com</div>
                      <div className="text-xs text-purple-600 mt-1">Full platform access</div>
                    </button>

                    <button
                      onClick={() => quickLogin('finance@interconnect.com')}
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                    >
                      <div className="font-medium text-purple-900">Finance Manager</div>
                      <div className="text-xs text-purple-700">finance@interconnect.com</div>
                      <div className="text-xs text-purple-600 mt-1">
                        Invoices & Disputes
                      </div>
                    </button>

                    <button
                      onClick={() => quickLogin('support@interconnect.com')}
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                    >
                      <div className="font-medium text-purple-900">Customer Support</div>
                      <div className="text-xs text-purple-700">support@interconnect.com</div>
                      <div className="text-xs text-purple-600 mt-1">Dispute Management</div>
                    </button>
                  </div>
                </div>

                {/* Partner Accounts */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Partner Accounts
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => quickLogin('roaming@verizon.com')}
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                    >
                      <div className="font-medium text-purple-900">
                        Verizon Wireless (USAVZ1)
                      </div>
                      <div className="text-xs text-purple-700">roaming@verizon.com</div>
                      <div className="text-xs text-purple-600 mt-1">Partner Portal Access</div>
                    </button>

                    <button
                      onClick={() => quickLogin('wholesale@tmobile.uk')}
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                    >
                      <div className="font-medium text-purple-900">T-Mobile UK (GBRTM1)</div>
                      <div className="text-xs text-purple-700">wholesale@tmobile.uk</div>
                      <div className="text-xs text-purple-600 mt-1">Partner Portal Access</div>
                    </button>

                    <button
                      onClick={() => quickLogin('intl@nttdocomo.jp')}
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                    >
                      <div className="font-medium text-purple-900">NTT Docomo (JPNDO1)</div>
                      <div className="text-xs text-purple-700">intl@nttdocomo.jp</div>
                      <div className="text-xs text-purple-600 mt-1">Partner Portal Access</div>
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Primary Login:</strong> Username: <code className="bg-yellow-100 px-1 rounded font-semibold">master</code> / Password: <code className="bg-yellow-100 px-1 rounded font-semibold">admin</code>
                    <br />
                    <strong>Other accounts:</strong> Use password format <code className="bg-yellow-100 px-1 rounded">role123</code> (e.g., admin123, verizon123)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Telecom Interconnect & Roaming Management Platform</p>
          <p className="mt-2">Version 1.0 - Prototype</p>
        </div>
      </div>
    </div>
  );
}
