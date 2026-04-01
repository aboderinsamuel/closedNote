"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { usePrompts } from "@/lib/hooks/usePrompts";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const MIN_PASSWORD_LENGTH = 6;

export default function SignupPage() {
  const { user, loading: authLoading, signup, loginWithOAuth } = useAuth();
  const router = useRouter();
  const { prompts } = usePrompts();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  if (authLoading || user) return null;

  const passwordMeetsLength = password.length >= MIN_PASSWORD_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordMeetsLength) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    try {
      const res = await signup(email, password, displayName);
      if (!res.ok) {
        if (
          res.error.toLowerCase().includes("already registered") ||
          res.error.toLowerCase().includes("already been registered") ||
          res.error.toLowerCase().includes("already exists")
        ) {
          setError(res.error + " Redirecting to sign in...");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError(res.error);
        }
      } else if (res.needsEmailConfirmation) {
        setShowEmailConfirmation(true);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    setOauthLoading(provider);
    try {
      const res = await loginWithOAuth(provider);
      if (!res.ok) setError(res.error);
    } catch {
      setError("OAuth sign-in failed. Please try again.");
    } finally {
      setOauthLoading(null);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 transition-shadow"
    + " bg-neutral-50 dark:bg-neutral-800"
    + " border border-neutral-200 dark:border-neutral-700"
    + " text-neutral-900 dark:text-neutral-100"
    + " focus:ring-[var(--cn-accent)]/40 focus:border-[var(--cn-accent)]";

  if (showEmailConfirmation) {
    return (
      <Layout header={<Header />} sidebar={null}>
        <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] px-4 py-8">
          <div className="animate-fade-up w-full max-w-sm">
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "var(--cn-bg-card)",
                border: "1px solid var(--cn-border)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: "rgba(123,216,143,0.15)" }}>
                <svg className="w-6 h-6" fill="none" stroke="#7BD88F" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: "var(--cn-text)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                Check your inbox
              </h1>
              <p style={{ fontSize: 14, color: "var(--cn-muted)", marginBottom: 4 }}>We sent a confirmation link to</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--cn-text)", marginBottom: 20 }}>{email}</p>
              <p style={{ fontSize: 13, color: "var(--cn-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                Click the link in the email to verify your account and complete sign-up. You can close this page.
              </p>
              <div className="p-3.5 rounded-lg text-left mb-5"
                style={{ background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border-s)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--cn-text2)", marginBottom: 8 }}>
                  Didn&apos;t receive it?
                </p>
                <ul style={{ fontSize: 12, color: "var(--cn-muted)", listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li>· Check your spam or junk folder</li>
                  <li>· Make sure you entered the correct email</li>
                  <li>· Wait a minute and check again</li>
                </ul>
              </div>
              <Link
                href="/login"
                style={{ fontSize: 14, color: "var(--cn-muted)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout header={<Header />} sidebar={null}>
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] px-4 py-8">
        <div className="animate-fade-up w-full max-w-sm" style={{ animationDelay: "0ms" }}>

          {/* Accent bar */}
          <div className="flex items-center justify-center mb-8">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 32, height: 3, borderRadius: 2,
                background: "var(--cn-accent)", display: "inline-block",
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cn-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                closedNote
              </span>
              <span style={{
                width: 32, height: 3, borderRadius: 2,
                background: "var(--cn-accent)", display: "inline-block",
              }} />
            </div>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "var(--cn-bg-card)",
              border: "1px solid var(--cn-border)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            }}
          >
            <div className="mb-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em", marginBottom: 6 }}>
                Create an account
              </h1>
              <p style={{ fontSize: 14, color: "var(--cn-muted)" }}>
                Free forever. No credit card needed.
              </p>
            </div>

            {error && (
              <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            {/* OAuth */}
            <div className="space-y-2 mb-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: "1px solid var(--cn-border)", color: "var(--cn-text2)", background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cn-bg-s1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {oauthLoading === "google" ? (
                  <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                ) : <GoogleIcon />}
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("github")}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: "1px solid var(--cn-border)", color: "var(--cn-text2)", background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cn-bg-s1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {oauthLoading === "github" ? (
                  <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                ) : <GitHubIcon />}
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-5 animate-fade-up" style={{ animationDelay: "140ms" }}>
              <div className="absolute inset-0 flex items-center">
                <div style={{ width: "100%", borderTop: "1px solid var(--cn-border)" }} />
              </div>
              <div className="relative flex justify-center">
                <span style={{ background: "var(--cn-bg-card)", padding: "0 12px", fontSize: 12, color: "var(--cn-muted)" }}>
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up" style={{ animationDelay: "180ms" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--cn-text2)", marginBottom: 6 }}>
                  Display name{" "}
                  <span style={{ fontWeight: 400, color: "var(--cn-dim)" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--cn-text2)", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--cn-text2)", marginBottom: 6 }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--cn-muted)", background: "none", border: "none", cursor: "pointer" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {/* Password strength indicator */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      background: password.length === 0
                        ? "var(--cn-bg-s3)"
                        : passwordMeetsLength
                        ? "#7BD88F"
                        : "#FC618D",
                    }}
                  >
                    {password.length > 0 && (
                      passwordMeetsLength ? (
                        <svg className="w-2 h-2 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-2 h-2 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )
                    )}
                  </span>
                  <span className="text-xs transition-colors" style={{
                    color: password.length === 0
                      ? "var(--cn-dim)"
                      : passwordMeetsLength
                      ? "#7BD88F"
                      : "#FC618D",
                  }}>
                    At least {MIN_PASSWORD_LENGTH} characters
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          </div>

          <p className="text-center mt-5 animate-fade-up" style={{ fontSize: 14, color: "var(--cn-muted)", animationDelay: "220ms" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "var(--cn-accent)", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
