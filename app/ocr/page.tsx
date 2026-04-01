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

function OpenAILogo({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .033-.062l4.83-2.786a4.5 4.5 0 0 1 6.684 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
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
  const [ocrProgress, setOcrProgress] = useState<string>("");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasHfKey, setHasHfKey] = useState(false);
  const [chatState, setChatState] = useState<RefinementState>({ loading: false, error: null, answer: "" });
  const [selectedModel, setSelectedModel] = useState<PromptModel>("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [ocrModel, setOcrModel] = useState<string | null>(null);

  const resizeImageForOCR = useCallback((file: File): Promise<File | Blob> => {
    const MAX_PX = 1600;
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.width <= MAX_PX && img.height <= MAX_PX) { resolve(file); return; }
        const scale = Math.min(MAX_PX / img.width, MAX_PX / img.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => resolve(b || file), "image/jpeg", 0.92);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }, []);

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
    setOcrProgress("");
    setExtractedText("");
    setOcrModel(null);

    const userKey = getUserApiKey();

    const runTesseract = async (source: File) => {
      const resized = await resizeImageForOCR(source);
      setOcrProgress("Loading OCR engine...");
      const { recognize } = await import("tesseract.js");
      const result = await recognize(resized, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(`Recognizing... ${Math.round(m.progress * 100)}%`);
          } else if (m.status === "loading tesseract core") {
            setOcrProgress("Loading OCR engine...");
          } else if (m.status === "initializing tesseract") {
            setOcrProgress("Initializing...");
          } else if (m.status === "loading language traineddata") {
            setOcrProgress(`Loading language data... ${Math.round(m.progress * 100)}%`);
          }
        },
      } as never);
      setOcrProgress("");
      return (result as { data: { text: string } }).data.text.trim();
    };

    if (!userKey) {
      try {
        const text = await runTesseract(imageFile);
        setExtractedText(text);
        setOcrModel("tesseract.js (offline)");
      } catch (offlineErr) {
        setOcrProgress("");
        setOcrError(offlineErr instanceof Error ? offlineErr.message : "Offline OCR error");
      } finally {
        setOcrLoading(false);
      }
      return;
    }

    try {
      setOcrProgress("Sending to AI...");
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token ?? "";

      const resized = await resizeImageForOCR(imageFile);
      const formData = new FormData();
      formData.append("file", resized instanceof File ? resized : new File([resized], imageFile.name, { type: "image/jpeg" }));
      formData.append("mode", "printed");
      formData.append("provider", "openai");
      formData.append("userApiKey", userKey);
      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
        headers: { "Authorization": `Bearer ${authToken}` },
        cache: "no-store",
      });
      setOcrProgress("");
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
        const text = await runTesseract(imageFile);
        setExtractedText(text);
        setOcrModel("tesseract.js (offline)");
      } catch (offlineErr) {
        setOcrProgress("");
        setOcrError(offlineErr instanceof Error ? offlineErr.message : "Offline OCR error");
      }
    } finally {
      setOcrProgress("");
      setOcrLoading(false);
    }
  }, [imageFile, resizeImageForOCR]);

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
    <Layout header={<Header />} sidebar={null}>
      <div className="animate-fade-up" style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Page header */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ width: 20, height: 2, background: "var(--cn-accent)", borderRadius: 2, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cn-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>OCR</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em", marginBottom: 6 }}>
            Image to Text
          </h1>
          <p style={{ fontSize: 14, color: "var(--cn-muted)" }}>
            Pull text out of any image, refine it with AI if you need to.
          </p>
        </div>

        {/* Notices */}
        {!user && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(253,147,83,0.08)", border: "1px solid rgba(253,147,83,0.25)", fontSize: 13, color: "#FD9353" }}>
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Log in to save extracted prompts to your library.
          </div>
        )}

        {!hasAnyAiKey && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(90,212,230,0.08)", border: "1px solid rgba(90,212,230,0.25)", fontSize: 13, color: "var(--cn-text2)" }}>
            <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: "#5AD4E6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              AI-powered extraction and prompt refinement require an API key.{" "}
              <a href="/settings" style={{ color: "var(--cn-accent)", textDecoration: "underline", fontWeight: 500 }}>
                Connect your OpenAI or HuggingFace key in Settings
              </a>{" "}
              to unlock these features. Basic offline OCR still works without a key.
            </span>
          </div>
        )}

        {/* Upload zone */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              position: "relative", cursor: "pointer",
              borderRadius: 12,
              border: `2px dashed ${dragOver ? "var(--cn-accent)" : imageFile ? "var(--cn-border)" : "var(--cn-border)"}`,
              background: dragOver ? "rgba(148,138,227,0.06)" : imageFile ? "var(--cn-bg-s1)" : "var(--cn-bg-s1)",
              padding: "40px 24px",
              textAlign: "center",
              transition: "border-color 0.15s, background 0.15s",
              userSelect: "none",
            }}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            {imageFile ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <svg style={{ width: 32, height: 32, color: "var(--cn-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cn-text)" }}>{imageFile.name}</p>
                <p style={{ fontSize: 12, color: "var(--cn-muted)" }}>{(imageFile.size / 1024).toFixed(1)} KB · Click to change</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <svg style={{ width: 32, height: 32, color: "var(--cn-dim)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p style={{ fontSize: 14, color: "var(--cn-muted)" }}>
                  <span style={{ fontWeight: 600, color: "var(--cn-text2)" }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ fontSize: 12, color: "var(--cn-dim)" }}>PNG, JPG, WebP</p>
              </div>
            )}
          </div>

          {/* Extract button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
            <button
              disabled={!imageFile || ocrLoading}
              onClick={runOCR}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 20px",
                background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
                border: "none", borderRadius: 99,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                opacity: (!imageFile || ocrLoading) ? 0.45 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {ocrLoading ? (
                <>
                  <svg style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {ocrProgress || "Extracting..."}
                </>
              ) : (
                <>
                  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Extract Text
                </>
              )}
            </button>
          </div>

          {ocrError && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 13, color: "#ef4444" }}>
              <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {ocrError}
            </div>
          )}
        </div>

        {/* Results */}
        {extractedText && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 12, border: "1px solid var(--cn-border)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--cn-border-s)", background: "var(--cn-bg-s1)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cn-text2)" }}>Extracted Text</span>
                {ocrModel && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 6, background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border)", color: "var(--cn-muted)", fontSize: 11, fontWeight: 600 }}>
                    {isOffline ? (
                      <>
                        <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Tesseract (offline)
                      </>
                    ) : isOpenAI ? (
                      <>
                        <OpenAILogo style={{ width: 12, height: 12 }} />
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
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "var(--cn-bg-card)", color: "var(--cn-text)",
                  fontFamily: "inherit",
                  fontSize: 15, lineHeight: 1.75,
                  border: "none", outline: "none", resize: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={refineWithChat}
                  disabled={chatState.loading || !hasAnyAiKey}
                  title={!hasAnyAiKey ? "Connect an OpenAI or HuggingFace key in Settings" : undefined}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "9px 18px",
                    background: "var(--cn-bg-s2)", color: "var(--cn-text2)",
                    border: "1px solid var(--cn-border)",
                    borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    opacity: (chatState.loading || !hasAnyAiKey) ? 0.45 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {chatState.loading ? (
                    <>
                      <svg style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Refining...
                    </>
                  ) : (
                    <>
                      <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Refine with AI
                    </>
                  )}
                </button>
                {!hasAnyAiKey && (
                  <p style={{ fontSize: 11, color: "var(--cn-dim)" }}>
                    Requires an <a href="/settings" style={{ color: "var(--cn-accent)", textDecoration: "underline" }}>API key</a>
                  </p>
                )}
              </div>

              <button
                onClick={saveRefined}
                disabled={!user || (!chatState.answer && !extractedText)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 18px",
                  background: saveSuccess ? "rgba(123,216,143,0.15)" : "var(--cn-btn-bg)",
                  color: saveSuccess ? "#7BD88F" : "var(--cn-btn-tx)",
                  border: saveSuccess ? "1px solid rgba(123,216,143,0.3)" : "none",
                  borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  opacity: (!user || (!chatState.answer && !extractedText)) ? 0.45 : 1,
                  transition: "all 0.15s",
                }}
              >
                {saveSuccess ? (
                  <>
                    <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save as Prompt
                  </>
                )}
              </button>

              <div style={{ marginLeft: "auto" }}>
                <input
                  type="text"
                  list="ocr-model-options"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="Model tag (optional)"
                  autoComplete="off"
                  style={{
                    padding: "8px 12px",
                    background: "var(--cn-bg-s2)", color: "var(--cn-text2)",
                    border: "1px solid var(--cn-border)",
                    borderRadius: 8, fontSize: 12, outline: "none", width: 180,
                  }}
                />
                <datalist id="ocr-model-options">
                  <option value="claude-opus-4-6" />
                  <option value="claude-sonnet-4-6" />
                  <option value="claude-haiku-4-5" />
                  <option value="claude-3-5-sonnet-20241022" />
                  <option value="gpt-4o" />
                  <option value="gpt-4o-mini" />
                  <option value="gpt-4-turbo" />
                  <option value="o1" />
                  <option value="gemini-2.0-flash" />
                  <option value="gemini-2.5-pro" />
                  <option value="mistral-large" />
                  <option value="deepseek-r1" />
                </datalist>
              </div>
            </div>

            {chatState.error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 13, color: "#ef4444" }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {chatState.error}
              </div>
            )}

            {chatState.answer && (
              <div style={{ borderRadius: 12, border: "1px solid var(--cn-border)", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--cn-border-s)", background: "var(--cn-bg-s1)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cn-text2)" }}>Refined Prompt</span>
                </div>
                <textarea
                  value={chatState.answer}
                  onChange={(e) => setChatState({ ...chatState, answer: e.target.value })}
                  rows={8}
                  style={{
                    width: "100%", padding: "14px 16px",
                    background: "var(--cn-bg-card)", color: "var(--cn-text)",
                    fontFamily: "ui-monospace,'Cascadia Code',monospace",
                    fontSize: 13, lineHeight: 1.6,
                    border: "none", outline: "none", resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
