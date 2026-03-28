"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { getUserApiKey, setUserApiKey, clearUserApiKey, getUserHfKey, setUserHfKey, clearUserHfKey } from "@/lib/userApiKey";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { prompts } = usePrompts();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // OpenAI key state
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savedKey, setSavedKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  // HuggingFace key state
  const [hfKeyInput, setHfKeyInput] = useState("");
  const [showHfKey, setShowHfKey] = useState(false);
  const [savedHfKey, setSavedHfKey] = useState("");
  const [hfKeySaved, setHfKeySaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const stored = getUserApiKey();
    setSavedKey(stored);
    setKeyInput(stored);
    const storedHf = getUserHfKey();
    setSavedHfKey(storedHf);
    setHfKeyInput(storedHf);
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

  const handleSaveHfKey = () => {
    setUserHfKey(hfKeyInput);
    setSavedHfKey(hfKeyInput.trim());
    setHfKeySaved(true);
    setTimeout(() => setHfKeySaved(false), 2000);
  };

  const handleClearHfKey = () => {
    clearUserHfKey();
    setSavedHfKey("");
    setHfKeyInput("");
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
      router.push("/");
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
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">AI Provider</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Gemini is used by default (free). Add your own keys for OpenAI or HuggingFace to use those instead.
            </p>
          </div>

          {/* Provider overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Gemini</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 font-medium">Default · Free</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">OCR + AI refinement. No key needed from you.</p>
            </div>
            <div className={`rounded-lg border p-3.5 transition-colors ${savedKey ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">OpenAI</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-medium">{savedKey ? "Active" : "Your key"}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">GPT-4o Mini for OCR + refinement. Requires billing.</p>
            </div>
            <div className={`rounded-lg border p-3.5 transition-colors ${savedHfKey ? "border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/20" : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">HuggingFace</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-medium">{savedHfKey ? "Active" : "Your key"}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Zephyr-7B for AI refinement only. Requires Pro billing.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* OpenAI key */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">OpenAI API Key</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-proj-..."
                  spellCheck={false}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow"
                />
                <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showKey ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
              {savedKey && <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-mono">Saved: {maskedKey}</p>}
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Requires active billing on your OpenAI account. Get a key at platform.openai.com/api-keys</p>
              <div className="flex items-center gap-2.5 mt-2">
                <button onClick={handleSaveKey} disabled={!keyInput.trim() || keyInput.trim() === savedKey} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed">
                  {keySaved ? "Saved!" : "Save Key"}
                </button>
                {savedKey && <button onClick={handleClearKey} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-lg transition-colors">Remove</button>}
              </div>
            </div>

            {/* HuggingFace key */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">HuggingFace API Key</label>
              <div className="relative">
                <input
                  type={showHfKey ? "text" : "password"}
                  value={hfKeyInput}
                  onChange={(e) => setHfKeyInput(e.target.value)}
                  placeholder="hf_..."
                  spellCheck={false}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-shadow"
                />
                <button type="button" onClick={() => setShowHfKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showHfKey ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
              {savedHfKey && <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-mono">Saved: {savedHfKey.slice(0, 5)}{"*".repeat(10)}${savedHfKey.slice(-4)}</p>}
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Used for AI text refinement only. Requires HuggingFace Pro billing. Get a key at huggingface.co/settings/tokens</p>
              <div className="flex items-center gap-2.5 mt-2">
                <button onClick={handleSaveHfKey} disabled={!hfKeyInput.trim() || hfKeyInput.trim() === savedHfKey} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed">
                  {hfKeySaved ? "Saved!" : "Save Key"}
                </button>
                {savedHfKey && <button onClick={handleClearHfKey} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-lg transition-colors">Remove</button>}
              </div>
            </div>

            <p className="text-xs text-neutral-400 dark:text-neutral-500">All keys are stored only in your browser&apos;s localStorage, never sent to our servers.</p>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-neutral-900 border border-red-300 dark:border-red-900 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Deleting your account is permanent. All your prompts, threads, and profile data will be removed forever.
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
