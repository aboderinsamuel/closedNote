"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { getUserApiKey, setUserApiKey, clearUserApiKey } from "@/lib/userApiKey";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { prompts } = usePrompts();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // AI Provider state
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savedKey, setSavedKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const stored = getUserApiKey();
    setSavedKey(stored);
    setKeyInput(stored);
  }, []);

  if (authLoading || !user) {
    return null;
  }

  const handleSaveKey = () => {
    setUserApiKey(keyInput);
    setSavedKey(keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleClearKey = () => {
    clearUserApiKey();
    setSavedKey("");
    setKeyInput("");
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteAccount();

    if (result.ok) {
      router.push("/home");
    } else {
      setError(result.error);
      setIsDeleting(false);
    }
  };

  const maskedKey = savedKey
    ? `${savedKey.slice(0, 7)}${"*".repeat(Math.min(savedKey.length - 11, 20))}${savedKey.slice(-4)}`
    : "";

  return (
    <Layout header={<Header promptCount={prompts.length} />}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 sm:mb-8">
          Settings
        </h1>

        {/* Profile */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Display Name</label>
              <p className="text-base text-neutral-900 dark:text-neutral-100 mt-1">{user.displayName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</label>
              <p className="text-base text-neutral-900 dark:text-neutral-100 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Member Since</label>
              <p className="text-base text-neutral-900 dark:text-neutral-100 mt-1">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* AI Provider */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-6 mb-6 overflow-hidden">
          {/* Header row */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                AI Provider
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Power AI features with your own OpenAI key or use the free default.
              </p>
            </div>
            {/* Status badge */}
            {savedKey ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex-shrink-0 ml-4 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                OpenAI Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 flex-shrink-0 ml-4 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                HuggingFace Free
              </span>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {/* Provider cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* HF card */}
              <div className={`rounded-lg border p-3.5 transition-colors ${!savedKey ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20" : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">HuggingFace</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 font-medium">Free</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Zephyr-7B via server key. Used for chat &amp; chain runs. No cost to you.
                </p>
              </div>

              {/* OpenAI card */}
              <div className={`rounded-lg border p-3.5 transition-colors ${savedKey ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-neutral-700 dark:text-neutral-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.387 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.781a4.494 4.494 0 0 1-.676 8.105v-5.677a.795.795 0 0 0-.402-.654zm2.01-3.044l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
                  </svg>
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">OpenAI</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-medium">Your key</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  GPT-4o Mini for chat, chains &amp; OCR vision. Stored locally in your browser only.
                </p>
              </div>
            </div>

            {/* Key input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-proj-..."
                  spellCheck={false}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {savedKey && (
                <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                  Saved: {maskedKey}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={handleSaveKey}
                disabled={!keyInput.trim() || keyInput.trim() === savedKey}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {keySaved ? "Saved!" : "Save Key"}
              </button>
              {savedKey && (
                <button
                  onClick={handleClearKey}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Remove Key
                </button>
              )}
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <svg className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your key is stored only in your browser&apos;s localStorage - never sent to our servers. It is passed directly to OpenAI per request. Get a key at{" "}
                <span className="font-mono text-neutral-600 dark:text-neutral-300">platform.openai.com/api-keys</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-neutral-900 border border-red-300 dark:border-red-900 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Deleting your account is permanent. All your prompts, chains, tags, and profile data will be removed forever.
          </p>

          {!showConfirmDialog ? (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Are you absolutely sure? Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== "DELETE"}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => { setShowConfirmDialog(false); setConfirmText(""); setError(null); }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
