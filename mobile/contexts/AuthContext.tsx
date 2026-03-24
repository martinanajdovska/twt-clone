import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  onStoredTokenChange,
} from '@/lib/auth-store';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStoredToken().then((t) => {
      if (!cancelled) {
        setTokenState(t);
        setIsLoading(false);
      }
    });

    const unsubscribe = onStoredTokenChange((nextToken) => {
      setTokenState(nextToken);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const setToken = useCallback(async (t: string) => {
    await setStoredToken(t);
  }, []);

  const clearToken = useCallback(async () => {
    await clearStoredToken();
  }, []);

  const value: AuthContextValue = {
    isAuthenticated: !!token,
    isLoading,
    setToken,
    clearToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
