// Authentication Types

export type UserRole = 'ADMIN' | 'PARTNER' | 'FINANCE' | 'SUPPORT';

export interface User {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  partner_id?: string; // Only for partner users
  partner_name?: string;
  permissions: string[];
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
