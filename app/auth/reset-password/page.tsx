"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Stage = "exchanging" | "form" | "success" | "error";

const MIN_PASSWORD_LENGTH = 6;

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("exchanging");
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      // PKCE flow: email contains ?code=
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStage("error");
        } else {
          setStage("form");
        }
      });
      return;
    }

    // Implicit flow: email contains #access_token=...&type=recovery
    // detectSessionInUrl:true parses the hash and fires PASSWORD_RECOVERY
    let timeoutId: ReturnType<typeof setTimeout>;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        clearTimeout(timeoutId);
        setStage("form");
        subscription.unsubscribe();
      }
    });

    timeoutId = setTimeout(() => {
      subscription.unsubscribe();
      setErrorMsg("Invalid or expired reset link. Please request a new one.");
      setStage("error");
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) return;
    if (password !== confirm) return;

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      setStage("error");
    } else {
      setStage("success");
      setTimeout(() => router.push("/dashboard"), 2500);
    }
  };

  const meetsLength = password.length >= MIN_PASSWORD_LENGTH;
  const meetsMatch = password === confirm && confirm.length > 0;

  const inputClass =
    "w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 transition-shadow";

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-[#141414] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm">

          {stage === "exchanging" && (
            <div className="text-center py-4">
              <div className="w-7 h-7 border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-600 dark:border-t-neutral-300 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Verifying link...</p>
            </div>
          )}

          {stage === "form" && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Set new password</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    New password
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
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      password.length === 0 ? "bg-neutral-200 dark:bg-neutral-700" : meetsLength ? "bg-emerald-500" : "bg-red-400"
                    }`}>
                      {password.length > 0 && (
                        meetsLength
                          ? <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          : <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </span>
                    <span className={`text-xs transition-colors ${
                      password.length === 0 ? "text-neutral-400 dark:text-neutral-500" : meetsLength ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                    }`}>
                      At least {MIN_PASSWORD_LENGTH} characters
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm.length > 0 && !meetsMatch && (
                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">Passwords don&apos;t match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving || !meetsLength || !meetsMatch}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Set new password"}
                </button>
              </form>
            </>
          )}

          {stage === "success" && (
            <div className="text-center py-2">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Password updated</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Redirecting you to your dashboard...</p>
            </div>
          )}

          {stage === "error" && (
            <div className="text-center py-2">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Link invalid or expired</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">{errorMsg}</p>
              <a
                href="/login"
                className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
              >
                Request a new link
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
