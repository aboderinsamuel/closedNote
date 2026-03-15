"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import {
  getCurrentUser,
  logoutUser,
  registerUser,
  authenticateUser,
  onAuthStateChange,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<
    | { ok: true; needsEmailConfirmation?: boolean }
    | { ok: false; error: string }
  >;
  logout: () => Promise<void>;
}

const USER_CACHE_KEY = "closednote_user_cache";

function readUserCache(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeUserCache(user: User | null) {
  try {
    if (user) {
      sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {}
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Always start null - this matches the server render and prevents hydration mismatch
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserAndCache = (u: User | null) => {
    writeUserCache(u);
    setUser(u);
  };

  useEffect(() => {
    let mounted = true;

    // Fast path: restore from sessionStorage immediately (no network, no flash)
    const cached = readUserCache();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    // Then validate with Supabase in background
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) setUserAndCache(currentUser);
      } catch {
        if (mounted) setUserAndCache(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const unsubscribe = onAuthStateChange((updatedUser) => {
      if (mounted) setUserAndCache(updatedUser);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authenticateUser(email, password);
    if (res.ok) {
      const currentUser = await getCurrentUser();
      setUserAndCache(currentUser);
    }
    return res;
  };

  const signup = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    const res = await registerUser(email, password, displayName);
    if (res.ok && !res.needsEmailConfirmation) {
      const currentUser = await getCurrentUser();
      setUserAndCache(currentUser);
    }
    return res;
  };

  const logout = async () => {
    setUserAndCache(null);
    try {
      await logoutUser();
    } catch {}
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
