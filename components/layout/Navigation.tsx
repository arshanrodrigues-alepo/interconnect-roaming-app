'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Hide navigation on login page
  if (pathname === '/login') {
    return null;
  }

  const navigation = [
    { name: 'Home', href: '/', roles: ['ADMIN', 'PARTNER', 'FINANCE', 'SUPPORT'] },
    { name: 'Partners', href: '/partners', roles: ['ADMIN', 'FINANCE', 'SUPPORT'] },
    { name: 'TAP', href: '/tap', roles: ['ADMIN', 'FINANCE'] },
    { name: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'PARTNER', 'FINANCE'] },
    { name: 'Invoices', href: '/invoices', roles: ['ADMIN', 'PARTNER', 'FINANCE'] },
    { name: 'Disputes', href: '/disputes', roles: ['ADMIN', 'PARTNER', 'FINANCE', 'SUPPORT'] },
    { name: 'Fraud Monitor', href: '/fraud', roles: ['ADMIN', 'FINANCE'] },
    { name: 'Admin Portal', href: '/admin', roles: ['ADMIN'] },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const canAccessRoute = (roles: string[]) => {
    if (!user) return true; // Show all when not logged in
    return roles.includes(user.role);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    setShowUserMenu(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500';
      case 'PARTNER':
        return 'bg-blue-500';
      case 'FINANCE':
        return 'bg-green-500';
      case 'SUPPORT':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <nav className="bg-purple-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo-dark.png" alt="Logo" className="h-10 w-auto" />
              </div>
              <span className="text-xl font-bold">Interconnect & Roaming</span>
            </Link>
            <div className="hidden md:flex space-x-1">
              {navigation
                .filter((item) => canAccessRoute(item.roles))
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-700 text-white'
                        : 'text-purple-100 hover:bg-purple-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-purple-800 transition"
                >
                  <div className="text-right">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-purple-300">
                      {user.partner_name || user.role}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${getRoleBadgeColor(user.role)} flex items-center justify-center font-bold`}>
                    {user.name.charAt(0)}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {user.role === 'PARTNER' && user.partner_id && (
                      <Link
                        href={`/dashboard?partner=${user.partner_id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Dashboard
                      </Link>
                    )}

                    {user.last_login && (
                      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
                        Last login: {new Date(user.last_login).toLocaleString()}
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 border-t border-gray-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
