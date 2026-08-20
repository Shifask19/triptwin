import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, tokenStore, type AuthUser } from '../lib/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout:   () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  // Restore session on mount
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setState(s => ({ ...s, loading: false })); return; }

    authApi.me()
      .then(user  => setState({ user, loading: false, error: null }))
      .catch(()   => { tokenStore.clear(); setState({ user: null, loading: false, error: null }); });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await authApi.login(email, password);
      tokenStore.set(res.accessToken);
      tokenStore.setRefresh(res.refreshToken);
      setState({ user: res.user, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await authApi.register(email, password, name);
      tokenStore.set(res.accessToken);
      tokenStore.setRefresh(res.refreshToken);
      setState({ user: res.user, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    try { if (refresh) await authApi.logout(refresh); } catch { /* silent */ }
    tokenStore.clear();
    setState({ user: null, loading: false, error: null });
  }, []);

  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
