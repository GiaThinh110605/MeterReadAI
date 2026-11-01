import { AuthUser, LoginPayload, RegisterPayload, TokenResponse } from '../types/auth';
import { API_BASE, authFetch, readError } from './http';

async function postJson(path: string, body: unknown, fallback: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res, fallback));
  return res.json();
}

export const authApi = {
  login(payload: LoginPayload) {
    return postJson('/auth/login', payload, 'Đăng nhập thất bại, vui lòng thử lại');
  },

  register(payload: RegisterPayload) {
    return postJson('/auth/register', payload, 'Đăng ký thất bại, vui lòng thử lại');
  },

  async me(): Promise<AuthUser> {
    const res = await authFetch('/auth/me');
    if (!res.ok) throw new Error(await readError(res, 'Phiên đăng nhập không hợp lệ'));
    return res.json();
  },
};
