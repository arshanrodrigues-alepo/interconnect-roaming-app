import { User } from '../types/auth';

// Mock users for authentication
export const mockUsers: User[] = [
  // Master Admin Account
  {
    user_id: 'master-001',
    email: 'master',
    name: 'Master Administrator',
    role: 'ADMIN',
    permissions: ['*'], // Full access
    created_at: '2024-01-01T00:00:00Z',
  },
  // Admin users
  {
    user_id: 'admin-001',
    email: 'admin@interconnect.com',
    name: 'System Administrator',
    role: 'ADMIN',
    permissions: ['*'], // Full access
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    user_id: 'finance-001',
    email: 'finance@interconnect.com',
    name: 'Finance Manager',
    role: 'FINANCE',
    permissions: ['invoices.view', 'invoices.create', 'disputes.view', 'disputes.manage'],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    user_id: 'support-001',
    email: 'support@interconnect.com',
    name: 'Customer Support',
    role: 'SUPPORT',
    permissions: ['disputes.view', 'disputes.manage', 'partners.view'],
    created_at: '2024-01-01T00:00:00Z',
  },

  // Partner users
  {
    user_id: 'partner-verizon-001',
    email: 'roaming@verizon.com',
    name: 'John Smith (Verizon)',
    role: 'PARTNER',
    partner_id: '550e8400-e29b-41d4-a716-446655440000',
    partner_name: 'Verizon Wireless',
    permissions: ['dashboard.view', 'invoices.view', 'disputes.create', 'tap.upload'],
    created_at: '2025-01-15T00:00:00Z',
  },
  {
    user_id: 'partner-tmobile-001',
    email: 'wholesale@tmobile.uk',
    name: 'Sarah Johnson (T-Mobile UK)',
    role: 'PARTNER',
    partner_id: '660f9511-f3ac-52e5-b827-557766551111',
    partner_name: 'T-Mobile UK',
    permissions: ['dashboard.view', 'invoices.view', 'disputes.create', 'tap.upload'],
    created_at: '2025-01-10T00:00:00Z',
  },
  {
    user_id: 'partner-docomo-001',
    email: 'intl@nttdocomo.jp',
    name: 'Takeshi Yamamoto (NTT Docomo)',
    role: 'PARTNER',
    partner_id: '880h1733-h5ce-74g7-d049-779988773333',
    partner_name: 'NTT Docomo',
    permissions: ['dashboard.view', 'invoices.view', 'disputes.create', 'tap.upload'],
    created_at: '2024-12-20T00:00:00Z',
  },
];

// Mock password storage (in production, use bcrypt hashing)
export const mockPasswords: Record<string, string> = {
  'master': 'admin',
  'admin@interconnect.com': 'admin123',
  'finance@interconnect.com': 'finance123',
  'support@interconnect.com': 'support123',
  'roaming@verizon.com': 'verizon123',
  'wholesale@tmobile.uk': 'tmobile123',
  'intl@nttdocomo.jp': 'docomo123',
};

// Helper function to authenticate user
export function authenticateUser(email: string, password: string): User | null {
  if (mockPasswords[email] === password) {
    return mockUsers.find((u) => u.email === email) || null;
  }
  return null;
}
