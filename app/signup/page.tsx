"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { usePrompts } from "@/lib/hooks/usePrompts";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const { prompts } = usePrompts();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signup(email, password, displayName);
      if (!res.ok) {
        // Check if it's an "already exists" error and redirect to login
        if (
          res.error.toLowerCase().includes("already registered") ||
          res.error.toLowerCase().includes("already been registered") ||
          res.error.toLowerCase().includes("already exists")
        ) {
          setError(res.error + " Redirecting to login...");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError(res.error);
        }
      } else if (res.needsEmailConfirmation) {
        setShowEmailConfirmation(true);
      } else {
        // User created and logged in successfully
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (showEmailConfirmation) {
    return (
      <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Check your email
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              We sent a confirmation link to:
            </p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
              {email}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Click the link in the email to verify your account and complete
              signup. You can close this page.
            </p>
          </div>
          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              <strong>Didn&apos;t receive the email?</strong>
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>
          <Link
            href="/login"
            className="inline-block mt-6 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline"
          >
            Back to login
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Sign up
        </h1>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Display name</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 pr-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
          Have an account?{" "}
          <Link className="underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </Layout>
  );
}
