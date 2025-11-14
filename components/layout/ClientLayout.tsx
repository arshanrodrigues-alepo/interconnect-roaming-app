'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/context/AuthContext';
import Navigation from './Navigation';
import AuthGuard from './AuthGuard';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthProvider>
      <Navigation />
      {isLoginPage ? (
        children
      ) : (
        <AuthGuard>{children}</AuthGuard>
      )}
    </AuthProvider>
  );
}
