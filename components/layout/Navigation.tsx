'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';

interface NavigationItem {
  name: string;
  href?: string;
  roles: string[];
  children?: NavigationItem[];
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Hide navigation on login page
  if (pathname === '/login') {
    return null;
  }

  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/', roles: ['ADMIN', 'PARTNER', 'FINANCE', 'SUPPORT'] },
    { name: 'Partners', href: '/partners', roles: ['ADMIN', 'FINANCE', 'SUPPORT'] },
    { name: 'TAP', href: '/tap', roles: ['ADMIN', 'FINANCE'] },
    { name: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'PARTNER', 'FINANCE'] },
    {
      name: 'Finance',
      roles: ['ADMIN', 'PARTNER', 'FINANCE'],
      children: [
        { name: 'Billing Cycles', href: '/billing-cycles', roles: ['ADMIN', 'FINANCE'] },
        { name: 'Invoices', href: '/invoices', roles: ['ADMIN', 'PARTNER', 'FINANCE'] },
        { name: 'Credit Control', href: '/credit-control', roles: ['ADMIN', 'FINANCE'] },
        { name: 'Commitments', href: '/commitments', roles: ['ADMIN', 'FINANCE'] },
      ]
    },
    {
      name: 'Routing',
      roles: ['ADMIN', 'FINANCE'],
      children: [
        { name: 'LCR (Least Cost)', href: '/lcr', roles: ['ADMIN', 'FINANCE'] },
        { name: 'QoS Monitoring', href: '/qos', roles: ['ADMIN', 'FINANCE'] },
      ]
    },
    { name: 'Disputes', href: '/disputes', roles: ['ADMIN', 'PARTNER', 'FINANCE', 'SUPPORT'] },
    { name: 'Fraud Monitor', href: '/fraud', roles: ['ADMIN', 'FINANCE'] },
    { name: 'Admin', href: '/admin', roles: ['ADMIN'] },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isDropdownActive = (children: NavigationItem[]) => {
    return children.some(child => child.href && isActive(child.href));
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
        return '';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'SUPPORT') {
      return { backgroundColor: '#1f3d88' };
    }
    return undefined;
  };

  return (
    <nav className="text-white shadow-lg" style={{ backgroundColor: '#1f3d88' }}>
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
                .map((item) => {
                  // Dropdown menu
                  if (item.children) {
                    const filteredChildren = item.children.filter(child => canAccessRoute(child.roles));
                    if (filteredChildren.length === 0) return null;

                    return (
                      <div
                        key={item.name}
                        className="relative"
                      >
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                            isDropdownActive(filteredChildren)
                              ? 'text-white'
                              : 'text-blue-100 hover:bg-black/20'
                          }`}
                          style={isDropdownActive(filteredChildren) ? { backgroundColor: '#163368' } : undefined}
                        >
                          {item.name}
                          <svg
                            className={`ml-1 w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {openDropdown === item.name && (
                          <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                            {filteredChildren.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href!}
                                className={`block px-4 py-2 text-sm transition-colors ${
                                  isActive(child.href!)
                                    ? 'text-white font-semibold'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                style={isActive(child.href!) ? { backgroundColor: '#1f3d88' } : undefined}
                                onClick={() => setOpenDropdown(null)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Regular link
                  return (
                    <Link
                      key={item.name}
                      href={item.href!}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isActive(item.href!)
                          ? 'text-white'
                          : 'text-blue-100 hover:bg-black/20'
                      }`}
                      style={isActive(item.href!) ? { backgroundColor: '#163368' } : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-black/20 transition"
                >
                  <div className="text-right">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-blue-200">
                      {user.partner_name || user.role}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${getRoleBadgeColor(user.role)} flex items-center justify-center font-bold`} style={getRoleBadgeStyle(user.role)}>
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
                          style={getRoleBadgeStyle(user.role)}
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
                className="px-6 py-2 bg-white rounded-lg font-semibold hover:bg-gray-100 transition"
                style={{ color: '#1f3d88' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || openDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setOpenDropdown(null);
          }}
        />
      )}
    </nav>
  );
}
