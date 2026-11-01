import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authApi';
import { LOGOUT_EVENT, sessionStore } from '../services/http';
import { AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  login: (payload: LoginPayload, remember: boolean) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => sessionStore.get()?.user ?? null);
  const [initializing, setInitializing] = useState(() => sessionStore.get() !== null);

  // Khôi phục phiên: xác minh lại token với /auth/me khi tải trang
  useEffect(() => {
    if (!sessionStore.get()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        sessionStore.clear();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    const onForcedLogout = () => setUser(null);
    window.addEventListener(LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, onForcedLogout);
  }, []);

  const login = useCallback(async (payload: LoginPayload, remember: boolean) => {
    const tokens = await authApi.login(payload);
    sessionStore.save(tokens, remember);
    setUser(tokens.user);
    return tokens.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const tokens = await authApi.register(payload);
    sessionStore.save(tokens, false);
    setUser(tokens.user);
    return tokens.user;
  }, []);

  const logout = useCallback(() => {
    sessionStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
