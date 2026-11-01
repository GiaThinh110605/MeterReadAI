import { AuthUser, TokenResponse } from '../types/auth';

export const API_BASE = '/api/v1';
const STORAGE_KEY = 'waterflow.session';
export const LOGOUT_EVENT = 'waterflow:logout';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** "Ghi nhớ đăng nhập" -> localStorage (giữ sau khi đóng trình duyệt), ngược lại sessionStorage. */
export const sessionStore = {
  get(): StoredSession | null {
    for (const storage of [localStorage, sessionStorage]) {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as StoredSession;
      } catch {
        storage.removeItem(STORAGE_KEY);
      }
    }
    return null;
  },

  save(tokens: TokenResponse, remember: boolean) {
    this.clear();
    const session: StoredSession = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
    };
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
  },

  update(tokens: TokenResponse) {
    const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage;
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user })
    );
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  },
};

/** Lấy thông báo lỗi dễ đọc từ response FastAPI (detail dạng chuỗi hoặc mảng lỗi Pydantic). */
export async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((d: { msg?: string }) => (d.msg ?? '').replace(/^Value error, /, ''))
      .filter(Boolean)
      .join('; ');
  }
  return fallback;
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const session = sessionStore.get();
  if (!session) return false;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  if (!res.ok) return false;
  sessionStore.update(await res.json());
  return true;
}

/**
 * fetch kèm header Authorization. Nếu Access Token hết hạn (401) thì tự làm mới bằng Refresh Token
 * đúng 1 lần; làm mới thất bại -> xóa phiên và phát sự kiện đăng xuất.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = () => {
    const headers = new Headers(init.headers);
    const token = sessionStore.get()?.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}${path}`, { ...init, headers });
  };

  let res = await send();
  if (res.status !== 401) return res;

  refreshing ??= refreshTokens().finally(() => {
    refreshing = null;
  });
  if (await refreshing) {
    res = await send();
    if (res.status !== 401) return res;
  }

  sessionStore.clear();
  window.dispatchEvent(new Event(LOGOUT_EVENT));
  return res;
}
