/**
 * Basistha Astrological Platform - Authentication Types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "astrologer" | "client" | "admin";
  role_ne: string;
  avatar_url?: string;
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
