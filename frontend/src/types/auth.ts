export type UserRole = 'ADMIN' | 'READER' | 'CUSTOMER';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  employeeCode?: string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
