import * as React from 'react';
import type { AuthenticatedUser, SignInResponse } from '@comedor-solanus/shared';
import { api, getToken, setToken } from '@/lib/api-client';
import { AuthContext, type AuthContextValue } from '@/lib/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // check-status reemite un token fresco junto con el usuario (misma forma que sign-in),
    // así que también lo renovamos aquí para extender la sesión mientras siga activa.
    api
      .get<SignInResponse>('/auth/check-status')
      .then((response) => {
        setToken(response.token);
        setUser(response.user);
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = React.useCallback(async (username: string, password: string) => {
    const response = await api.post<SignInResponse>('/auth/sign-in', { username, password });
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = React.useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
