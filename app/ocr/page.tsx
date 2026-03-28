"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";
import { savePrompt } from "@/lib/promptData";
import { getUserApiKey, getUserHfKey } from "@/lib/userApiKey";
import { supabase } from "@/lib/supabase";
import { PromptModel } from "@/lib/types";

function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .033-.062l4.83-2.786a4.5 4.5 0 0 1 6.684 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function OfflineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

interface RefinementState {
  loading: boolean;
  error: string | null;
  answer: string;
}

export default function OCRPage() {
  const { prompts, refresh } = usePrompts();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [mode, setMode] = useState<"printed" | "handwritten">("printed");
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasHfKey, setHasHfKey] = useState(false);
  const [chatState, setChatState] = useState<RefinementState>({ loading: false, error: null, answer: "" });
  const [selectedModel, setSelectedModel] = useState<PromptModel>("gpt-4o-mini");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [ocrModel, setOcrModel] = useState<string | null>(null);

  useEffect(() => {
    setHasOpenAIKey(!!getUserApiKey());
    setHasHfKey(!!getUserHfKey());
  }, []);

  const hasAnyAiKey = hasOpenAIKey || hasHfKey;

  const handleFile = (file: File | null) => {
    setOcrError(null);
    setExtractedText("");
    setChatState({ loading: false, error: null, answer: "" });
    setSaveSuccess(false);
    setOcrModel(null);
    setImageFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const runOCR = useCallback(async () => {
    if (!imageFile) return;
    setOcrLoading(true);
    setOcrError(null);
    setExtractedText("");
    setOcrModel(null);

    const userKey = getUserApiKey();

    if (!userKey) {
      // No API key, go straight to Tesseract
      try {
        const Tesseract = await import("tesseract.js");
        const result = await Tesseract.recognize(imageFile, "eng", {});
        setExtractedText(result.data.text.trim());
        setOcrModel("tesseract.js (offline)");
      } catch (offlineErr) {
        setOcrError(offlineErr instanceof Error ? offlineErr.message : "Offline OCR error");
      } finally {
        setOcrLoading(false);
      }
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token ?? "";

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("mode", mode);
      formData.append("provider", "openai");
      formData.append("userApiKey", userKey);
      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
        headers: { "Authorization": `Bearer ${authToken}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OCR failed");
      if (data.text && data.text.trim()) {
        setExtractedText(data.text.trim());
        setOcrModel(data.model || null);
      } else {
        throw new Error("Empty OCR result");
      }
    } catch (err) {
      console.warn("OpenAI OCR failed, attempting offline fallback", err);
      try {
        const Tesseract = await import("tesseract.js");
        const result = await Tesseract.recognize(imageFile, "eng", {});
        setExtractedText(result.data.text.trim());
        setOcrModel("tesseract.js (offline)");
      } catch (offlineErr) {
        setOcrError(offlineErr instanceof Error ? offlineErr.message : "Offline OCR error");
      }
    } finally {
      setOcrLoading(false);
    }
  }, [imageFile, mode]);

  const refineWithChat = async () => {
    setChatState({ loading: true, error: null, answer: "" });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token ?? "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt: extractedText, model: "gpt-4o-mini", userApiKey: getUserApiKey(), userHfKey: getUserHfKey() }),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat refinement failed");
      setChatState({ loading: false, error: null, answer: data.answer });
    } catch (err) {
      setChatState({ loading: false, error: err instanceof Error ? err.message : "Unknown error", answer: "" });
    }
  };

  const saveRefined = async () => {
    const content = chatState.answer || extractedText;
    if (!content.trim() || !user) return;
    try {
      const now = new Date().toISOString();
      await savePrompt({
        id: crypto.randomUUID(),
        title: content.substring(0, 60) || "OCR Prompt",
        content,
        model: selectedModel,
        collection: "ocr",
        createdAt: now,
        updatedAt: now,
      });
      refresh();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "Failed to save prompt");
    }
  };

  const isOffline = ocrModel === "tesseract.js (offline)";
  const isOpenAI = ocrModel === "gpt-4o-mini";

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Image to Text</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Pull text out of any image, refine it if you need to.</p>
        </div>

        {!user && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Log in to save extracted prompts to your library.
          </div>
        )}

        {!hasAnyAiKey && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>
              AI-powered extraction and prompt refinement require an API key.{" "}
              <a href="/settings" className="underline font-medium hover:text-blue-600 dark:hover:text-blue-200">
                Connect your OpenAI or HuggingFace key in Settings
              </a>{" "}
              to unlock these features. Basic offline OCR still works without a key.
            </span>
          </div>
        )}

        {/* Upload + controls */}
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors p-10 text-center select-none ${
              dragOver
                ? "border-neutral-400 bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-800"
                : imageFile
                ? "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            {imageFile ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{imageFile.name}</p>
                <p className="text-xs text-neutral-400">{(imageFile.size / 1024).toFixed(1)} KB &middot; Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-neutral-400">PNG, JPG, WebP</p>
              </div>
            )}
          </div>

          {/* Mode toggle + Extract button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              {(["printed", "handwritten"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                    mode === m
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              disabled={!imageFile || ocrLoading}
              onClick={runOCR}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-300 dark:text-neutral-900 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {ocrLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Extracting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Extract Text
                </>
              )}
            </button>
          </div>

          {ocrError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {ocrError}
            </div>
          )}
        </div>

        {/* Results */}
        {extractedText && (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Extracted Text</span>
                {ocrModel && (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium">
                    {isOffline ? (
                      <>
                        <OfflineIcon className="w-3.5 h-3.5" />
                        Tesseract (offline)
                      </>
                    ) : isOpenAI ? (
                      <>
                        <OpenAILogo className="w-3.5 h-3.5" />
                        OpenAI
                      </>
                    ) : (
                      <>Gemini</>
                    )}
                  </span>
                )}
              </div>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-950 text-sm font-mono text-neutral-900 dark:text-neutral-100 resize-none focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <button
                  onClick={refineWithChat}
                  disabled={chatState.loading || !hasAnyAiKey}
                  title={!hasAnyAiKey ? "Connect an OpenAI or HuggingFace key in Settings" : undefined}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-300 dark:text-neutral-900 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {chatState.loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Refining...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                      Refine with AI
                    </>
                  )}
                </button>
                {!hasAnyAiKey && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Requires an <a href="/settings" className="underline hover:text-neutral-600 dark:hover:text-neutral-300">API key</a>
                  </p>
                )}
              </div>

              <button
                onClick={saveRefined}
                disabled={!user || (!chatState.answer && !extractedText)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
              >
                {saveSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Save as Prompt
                  </>
                )}
              </button>

              <div className="ml-auto">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as PromptModel)}
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3.5">Claude 3.5</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {chatState.error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {chatState.error}
              </div>
            )}

            {chatState.answer && (
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Refined Prompt</span>
                </div>
                <textarea
                  value={chatState.answer}
                  onChange={(e) => setChatState({ ...chatState, answer: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-950 text-sm font-mono text-neutral-900 dark:text-neutral-100 resize-none focus:outline-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
