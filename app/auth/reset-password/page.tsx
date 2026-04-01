"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Stage = "exchanging" | "form" | "success" | "error";

const MIN_PASSWORD_LENGTH = 6;

function EyeIcon({ open, style }: { open: boolean; style?: React.CSSProperties }) {
  return open ? (
    <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

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
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) { setErrorMsg(error.message); setStage("error"); }
        else { setStage("form"); }
      });
      return;
    }

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

    return () => { clearTimeout(timeoutId); subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) return;
    if (password !== confirm) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { setErrorMsg(error.message); setStage("error"); }
    else { setStage("success"); setTimeout(() => router.push("/dashboard"), 2500); }
  };

  const meetsLength = password.length >= MIN_PASSWORD_LENGTH;
  const meetsMatch = password === confirm && confirm.length > 0;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border)",
    borderRadius: 10, fontSize: 14, color: "var(--cn-text)",
    outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: "var(--cn-muted)", marginBottom: 6,
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--cn-bg)", padding: "0 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div className="animate-fade-up" style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Image
            src="/closedNote-nobg.png"
            alt="closedNote"
            width={160}
            height={160}
            style={{ objectFit: "contain" }}
          />
        </div>

        <div className="animate-fade-up" style={{
          background: "var(--cn-bg-card)", border: "1px solid var(--cn-border)",
          borderRadius: 16, padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          animationDelay: "60ms",
        }}>

          {stage === "exchanging" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--cn-border)", borderTopColor: "var(--cn-accent)", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: "var(--cn-muted)" }}>Verifying link...</p>
            </div>
          )}

          {stage === "form" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.02em", marginBottom: 6 }}>
                  Set new password
                </h1>
                <p style={{ fontSize: 13, color: "var(--cn-muted)" }}>
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>New password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--cn-dim)", display: "flex" }}
                    >
                      <EyeIcon open={showPassword} style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                      background: password.length === 0 ? "var(--cn-border)" : meetsLength ? "#7BD88F" : "#FC618D",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s",
                    }}>
                      {password.length > 0 && (
                        <svg style={{ width: 8, height: 8, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {meetsLength
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          }
                        </svg>
                      )}
                    </span>
                    <span style={{ fontSize: 12, color: password.length === 0 ? "var(--cn-dim)" : meetsLength ? "#7BD88F" : "#FC618D", transition: "color 0.2s" }}>
                      At least {MIN_PASSWORD_LENGTH} characters
                    </span>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Confirm password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--cn-dim)", display: "flex" }}
                    >
                      <EyeIcon open={showConfirm} style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                  {confirm.length > 0 && !meetsMatch && (
                    <p style={{ marginTop: 6, fontSize: 12, color: "#FC618D" }}>Passwords don&apos;t match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving || !meetsLength || !meetsMatch}
                  style={{
                    width: "100%", padding: "11px",
                    background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
                    border: "none", borderRadius: 99,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    opacity: (saving || !meetsLength || !meetsMatch) ? 0.5 : 1,
                    transition: "opacity 0.15s",
                    marginTop: 4,
                  }}
                >
                  {saving ? "Saving..." : "Set new password"}
                </button>
              </form>
            </>
          )}

          {stage === "success" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ width: 48, height: 48, margin: "0 auto 16px", borderRadius: "50%", background: "rgba(123,216,143,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: 24, height: 24, color: "#7BD88F" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--cn-text)", marginBottom: 8 }}>Password updated</h2>
              <p style={{ fontSize: 13, color: "var(--cn-muted)" }}>Redirecting you to your dashboard...</p>
            </div>
          )}

          {stage === "error" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ width: 48, height: 48, margin: "0 auto 16px", borderRadius: "50%", background: "rgba(252,97,141,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: 24, height: 24, color: "#FC618D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--cn-text)", marginBottom: 8 }}>Link invalid or expired</h2>
              <p style={{ fontSize: 13, color: "var(--cn-muted)", marginBottom: 20 }}>{errorMsg}</p>
              <a
                href="/login"
                style={{ fontSize: 13, fontWeight: 600, color: "var(--cn-accent)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
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
