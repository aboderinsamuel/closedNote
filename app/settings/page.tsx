"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { getUserApiKey, setUserApiKey, clearUserApiKey, getUserHfKey, setUserHfKey, clearUserHfKey } from "@/lib/userApiKey";

function Section({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className="animate-fade-up" style={{
      borderRadius: 12, padding: "24px",
      background: "var(--cn-bg-card)",
      border: `1px solid ${danger ? "rgba(220,38,38,0.4)" : "var(--cn-border)"}`,
      marginBottom: 16,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: danger ? "#ef4444" : "var(--cn-text)", marginBottom: 16, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, mono, note }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; mono?: boolean; note?: string;
}) {
  const [show, setShow] = useState(type !== "password");
  const isPassword = type === "password";
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--cn-text2)", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword && !show ? "password" : "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            width: "100%", padding: isPassword ? "9px 40px 9px 12px" : "9px 12px",
            borderRadius: 8, border: "1px solid var(--cn-border)",
            background: "var(--cn-bg-s1)", color: "var(--cn-text)",
            fontSize: 13, fontFamily: mono ? "ui-monospace,'Cascadia Code',monospace" : "inherit",
            outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--cn-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--cn-accent)20"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--cn-border)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--cn-muted)", display: "flex" }}
          >
            <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={show ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
            </svg>
          </button>
        )}
      </div>
      {note && <p style={{ marginTop: 5, fontSize: 11, color: "var(--cn-muted)", lineHeight: 1.5 }}>{note}</p>}
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, children, saved }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; saved?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 16px", borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: saved ? "#7BD88F" : disabled ? "var(--cn-bg-s3)" : "var(--cn-accent)",
        color: saved ? "#1a1a1a" : disabled ? "var(--cn-dim)" : "#fff",
        fontSize: 13, fontWeight: 600, transition: "opacity 0.15s, background 0.2s",
        opacity: disabled && !saved ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 14px", borderRadius: 8, border: "1px solid var(--cn-border)",
        cursor: disabled ? "not-allowed" : "pointer", background: "transparent",
        color: "var(--cn-text2)", fontSize: 13, fontWeight: 600, transition: "background 0.12s",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = "var(--cn-bg-s1)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { prompts } = usePrompts();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [keyInput, setKeyInput] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  const [hfKeyInput, setHfKeyInput] = useState("");
  const [savedHfKey, setSavedHfKey] = useState("");
  const [hfKeySaved, setHfKeySaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    const stored = getUserApiKey();
    setSavedKey(stored);
    setKeyInput(stored);
    const storedHf = getUserHfKey();
    setSavedHfKey(storedHf);
    setHfKeyInput(storedHf);
  }, []);

  if (authLoading || !user) return null;

  const handleSaveKey = () => {
    setUserApiKey(keyInput);
    setSavedKey(keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };
  const handleClearKey = () => { clearUserApiKey(); setSavedKey(""); setKeyInput(""); };
  const handleSaveHfKey = () => {
    setUserHfKey(hfKeyInput);
    setSavedHfKey(hfKeyInput.trim());
    setHfKeySaved(true);
    setTimeout(() => setHfKeySaved(false), 2000);
  };
  const handleClearHfKey = () => { clearUserHfKey(); setSavedHfKey(""); setHfKeyInput(""); };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") { setError("Please type DELETE to confirm"); return; }
    setIsDeleting(true);
    setError(null);
    const result = await deleteAccount();
    if (result.ok) {
      router.push("/");
    } else {
      setError(result.error);
      setIsDeleting(false);
    }
  };

  const maskedKey = savedKey
    ? `${savedKey.slice(0, 7)}${"·".repeat(Math.min(savedKey.length - 11, 20))}${savedKey.slice(-4)}`
    : "";

  const providerCards = [
    { name: "Gemini", badge: "Default · Free", badgeColor: "#7BD88F", active: true, desc: "OCR + AI refinement. No key needed.", color: "#5AD4E6" },
    { name: "OpenAI", badge: savedKey ? "Active" : "Your key", badgeColor: savedKey ? "#7BD88F" : undefined, active: !!savedKey, desc: "GPT-4o Mini. Requires billing.", color: "#948AE3" },
    { name: "HuggingFace", badge: savedHfKey ? "Active" : "Your key", badgeColor: savedHfKey ? "#7BD88F" : undefined, active: !!savedHfKey, desc: "Zephyr-7B for refinement only.", color: "#FD9353" },
  ];

  return (
    <Layout header={<Header />}>
      <div className="max-w-2xl mx-auto animate-fade-up">
        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ width: 20, height: 2, background: "var(--cn-accent)", borderRadius: 2, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cn-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Account</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em" }}>Settings</h1>
        </div>

        {/* Profile */}
        <Section title="Profile">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["Display Name", user.displayName],
              ["Email", user.email],
              ["Member Since", new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--cn-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, color: "var(--cn-text)", fontWeight: 600 }}>{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* AI Provider */}
        <Section title="AI Provider">
          <p style={{ fontSize: 13, color: "var(--cn-muted)", marginBottom: 16, lineHeight: 1.6 }}>
            Gemini is used by default (free). Add your own keys for OpenAI or HuggingFace to use those instead.
          </p>

          {/* Provider overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
            {providerCards.map(p => (
              <div key={p.name} style={{
                borderRadius: 10, padding: "12px 14px",
                border: `1px solid ${p.active ? `${p.color}40` : "var(--cn-border)"}`,
                background: p.active ? `${p.color}08` : "var(--cn-bg-s1)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cn-text)" }}>{p.name}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 99, fontWeight: 700,
                    background: p.badgeColor ? `${p.badgeColor}20` : "var(--cn-bg-s2)",
                    color: p.badgeColor ?? "var(--cn-muted)",
                  }}>{p.badge}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--cn-muted)", lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* OpenAI */}
            <div>
              <InputField
                label="OpenAI API Key"
                type="password"
                value={keyInput}
                onChange={setKeyInput}
                placeholder="sk-proj-..."
                mono
                note="Requires active billing on your OpenAI account."
              />
              {savedKey && <p style={{ marginTop: 4, fontSize: 11, color: "var(--cn-dim)", fontFamily: "monospace" }}>Saved: {maskedKey}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <PrimaryBtn onClick={handleSaveKey} disabled={!keyInput.trim() || keyInput.trim() === savedKey} saved={keySaved}>
                  {keySaved ? "Saved!" : "Save Key"}
                </PrimaryBtn>
                {savedKey && <GhostBtn onClick={handleClearKey}>Remove</GhostBtn>}
              </div>
            </div>

            {/* HuggingFace */}
            <div>
              <InputField
                label="HuggingFace API Key"
                type="password"
                value={hfKeyInput}
                onChange={setHfKeyInput}
                placeholder="hf_..."
                mono
                note="Used for AI text refinement only. Requires HuggingFace Pro."
              />
              {savedHfKey && <p style={{ marginTop: 4, fontSize: 11, color: "var(--cn-dim)", fontFamily: "monospace" }}>Saved: {savedHfKey.slice(0, 5)}{"·".repeat(10)}{savedHfKey.slice(-4)}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <PrimaryBtn onClick={handleSaveHfKey} disabled={!hfKeyInput.trim() || hfKeyInput.trim() === savedHfKey} saved={hfKeySaved}>
                  {hfKeySaved ? "Saved!" : "Save Key"}
                </PrimaryBtn>
                {savedHfKey && <GhostBtn onClick={handleClearHfKey}>Remove</GhostBtn>}
              </div>
            </div>

            <p style={{ fontSize: 11, color: "var(--cn-dim)", lineHeight: 1.5 }}>
              All keys are stored only in your browser&apos;s localStorage, never sent to our servers.
            </p>
          </div>
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone" danger>
          <p style={{ fontSize: 13, color: "var(--cn-muted)", marginBottom: 16, lineHeight: 1.6 }}>
            Deleting your account is permanent. All your prompts, threads, and profile data will be removed forever.
          </p>

          {!showConfirmDialog ? (
            <button
              onClick={() => setShowConfirmDialog(true)}
              style={{ padding: "8px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Delete Account
            </button>
          ) : (
            <div style={{ padding: 16, background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cn-text)" }}>
                Are you absolutely sure? Type <code style={{ fontFamily: "monospace", color: "#ef4444" }}>DELETE</code> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                style={{
                  padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.3)",
                  background: "var(--cn-bg-card)", color: "var(--cn-text)", fontSize: 13, outline: "none",
                }}
              />
              {error && <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== "DELETE"}
                  style={{ padding: "7px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isDeleting || confirmText !== "DELETE" ? "not-allowed" : "pointer", opacity: confirmText !== "DELETE" ? 0.5 : 1, transition: "opacity 0.15s" }}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <GhostBtn onClick={() => { setShowConfirmDialog(false); setConfirmText(""); setError(null); }} disabled={isDeleting}>
                  Cancel
                </GhostBtn>
              </div>
            </div>
          )}
        </Section>
      </div>
    </Layout>
  );
}
