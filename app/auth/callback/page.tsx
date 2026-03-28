"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");
    const errorDescription = params.get("error_description");
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");

    if (errorParam) {
      setError(errorDescription || errorParam);
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (code) {
      // PKCE flow: exchange code for session
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: exchangeError }) => {
          if (exchangeError) {
            console.error("[auth/callback] Exchange error:", exchangeError);
            setError(exchangeError.message);
            setTimeout(() => router.push("/login"), 3000);
          } else {
            router.push("/dashboard");
          }
        });
      return;
    }

    if (accessToken) {
      // Implicit flow: supabase client auto-detects the hash and fires SIGNED_IN.
      // Wait for the session to be established before navigating.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          subscription.unsubscribe();
          router.push("/dashboard");
        }
      });
      // Fallback in case onAuthStateChange doesn't fire (session already set)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          subscription.unsubscribe();
          router.push("/dashboard");
        }
      });
      return;
    }

    // No code or token — just go to dashboard (handles direct navigation to this route)
    router.push("/dashboard");
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-[#141414]">
        <div className="text-center max-w-sm px-4">
          <div className="w-10 h-10 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Sign-in failed</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{error}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-[#141414]">
      <div className="text-center">
        <div className="w-7 h-7 border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-600 dark:border-t-neutral-300 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Signing you in...</p>
      </div>
    </div>
  );
}
