"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import {
  logoutUser,
  registerUser,
  authenticateUser,
  onAuthStateChange,
  resetPasswordForEmail,
  signInWithOAuth,
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
  resetPassword: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  loginWithOAuth: (provider: "google" | "github") => Promise<{ ok: true } | { ok: false; error: string }>;
}

const USER_CACHE_KEY = "closednote_user_cache";

function readUserCache(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeUserCache(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {}
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const origin = typeof window !== "undefined" ? window.location.origin : "";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserAndCache = (u: User | null) => {
    writeUserCache(u);
    setUser(u);
  };

  useEffect(() => {
    let mounted = true;

    // Fast path: show cached user instantly while auth initializes
    const cached = readUserCache();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    // onAuthStateChange fires INITIAL_SESSION on mount, so no separate
    // getUser() call is needed - concurrent calls caused refresh-token reuse
    // errors that invalidated sessions.
    const unsubscribe = onAuthStateChange((updatedUser) => {
      if (mounted) {
        setUserAndCache(updatedUser);
        setLoading(false);
      }
    });

    // Safety fallback: resolve loading if INITIAL_SESSION never fires
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authenticateUser(email, password);
    // onAuthStateChange fires SIGNED_IN and updates user state automatically
    return res;
  };

  const signup = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    const res = await registerUser(email, password, displayName);
    return res;
  };

  const resetPassword = async (email: string) =>
    resetPasswordForEmail(email, `${origin}/auth/reset-password`);

  const loginWithOAuth = async (provider: "google" | "github") =>
    signInWithOAuth(provider, `${origin}/auth/callback`);

  const logout = async () => {
    setUserAndCache(null);
    try {
      await logoutUser();
    } catch {}
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, loginWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
