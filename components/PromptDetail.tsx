"use client";

import React from "react";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { Prompt, PromptVersion } from "@/lib/types";
import { deletePrompt, savePrompt } from "@/lib/promptData";
import { useRouter } from "next/navigation";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { VersionHistory } from "@/components/VersionHistory";

interface PromptDetailProps {
  prompt: Prompt;
}

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-4": "GPT-4",
  "claude-3.5": "Claude 3.5",
  "claude-3": "Claude 3",
  "gemini-2": "Gemini 2",
  "gemini-pro": "Gemini Pro",
  "mistral": "Mistral",
  "other": "Other",
};

export function PromptDetail({ prompt }: PromptDetailProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [collection, setCollection] = useState(prompt.collection);
  const [model, setModel] = useState(prompt.model);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const router = useRouter();
  const { removeOptimistic, updateOptimistic } = usePrompts();
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    if (editing) {
      titleRef.current?.focus();
      setTimeout(resizeTextarea, 0);
    }
  }, [editing, resizeTextarea]);

  useEffect(() => {
    if (!editing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        setTitle(localPrompt.title);
        setContent(localPrompt.content);
        setCollection(localPrompt.collection);
        setModel(localPrompt.model);
        setEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, localPrompt]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localPrompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this prompt? This cannot be undone.")) return;
    try {
      removeOptimistic(prompt.id);
      await deletePrompt(prompt.id);
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to delete prompt. Please try again.");
      console.error("Error deleting prompt:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const newTitle = title.trim() || localPrompt.title;
      const newContent = content.trim() || localPrompt.content;
      const newCollection = collection.trim() || "uncategorized";
      const newModel = model.trim() || localPrompt.model;
      const updated = { ...localPrompt, title: newTitle, content: newContent, collection: newCollection, model: newModel, updatedAt: now };

      const contentChanged = newTitle !== localPrompt.title || newContent !== localPrompt.content || newCollection !== localPrompt.collection || newModel !== localPrompt.model;
      await savePrompt(updated, !contentChanged);

      setLocalPrompt(updated);
      updateOptimistic(updated);
      setEditing(false);
      if (contentChanged) setHistoryKey((k) => k + 1);
    } catch (err) {
      setError("Failed to save changes. Please try again.");
      console.error("Error saving prompt:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (version: PromptVersion) => {
    if (!confirm(`Restore v${version.versionNumber}? Version history will be preserved.`)) return;
    const restored = { ...localPrompt, title: version.title, content: version.content };
    setTitle(restored.title);
    setContent(restored.content);
    setSaving(true);
    try {
      await savePrompt({ ...restored, updatedAt: new Date().toISOString() }, true);
      setLocalPrompt(restored);
      updateOptimistic(restored);
    } catch (err) {
      setError("Failed to restore version.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  function relativeDate(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  const badgeStyle: React.CSSProperties = {
    padding: "3px 10px",
    background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border-s)",
    color: "var(--cn-muted)", fontSize: 11, fontWeight: 600, borderRadius: 6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      {/* Nav row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          href="/dashboard"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--cn-muted)", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
        >
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        <span style={{ color: "var(--cn-border)" }}>/</span>
        <span style={{ fontSize: 13, color: "var(--cn-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
          {localPrompt.title}
        </span>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 13, color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* Main document card */}
      <div style={{
        background: "var(--cn-bg-card)",
        border: "1px solid var(--cn-border)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>

        {/* Header: title + actions */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "28px 28px 16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled prompt"
                style={{
                  width: "100%", fontSize: 24, fontWeight: 700,
                  background: "transparent", color: "var(--cn-text)",
                  border: "none", borderBottom: "1px solid var(--cn-border)",
                  outline: "none", paddingBottom: 4, fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em", lineHeight: 1.3 }}>
                {localPrompt.title}
              </h1>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 4 }}>
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setTitle(localPrompt.title);
                    setContent(localPrompt.content);
                    setCollection(localPrompt.collection);
                    setModel(localPrompt.model);
                    setEditing(false);
                  }}
                  style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: "var(--cn-bg-s2)", color: "var(--cn-text2)", border: "1px solid var(--cn-border)", borderRadius: 8, cursor: "pointer", transition: "background 0.12s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--cn-bg-s3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--cn-bg-s2)")}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)", border: "none", borderRadius: 8, cursor: "pointer", opacity: saving ? 0.6 : 1, transition: "opacity 0.15s" }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: copied ? "rgba(123,216,143,0.12)" : "var(--cn-bg-s2)", color: copied ? "#7BD88F" : "var(--cn-text2)", border: `1px solid ${copied ? "rgba(123,216,143,0.3)" : "var(--cn-border)"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => setEditing(true)}
                  style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)", border: "none", borderRadius: 8, cursor: "pointer", transition: "opacity 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "0 28px 20px" }}>
          {editing ? (
            <input
              type="text"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="collection"
              style={{ ...badgeStyle, background: "var(--cn-bg-s2)", color: "var(--cn-text)", border: "1px solid var(--cn-border)", outline: "none", width: 120 }}
            />
          ) : (
            <span style={{ ...badgeStyle, textTransform: "capitalize" }}>{localPrompt.collection}</span>
          )}
          {editing ? (
            <>
              <input
                type="text"
                list="detail-model-options"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="model"
                autoComplete="off"
                style={{ ...badgeStyle, background: "var(--cn-bg-s2)", color: "var(--cn-text)", border: "1px solid var(--cn-border)", outline: "none", width: 180 }}
              />
              <datalist id="detail-model-options">
                <option value="claude-opus-4-6" />
                <option value="claude-sonnet-4-6" />
                <option value="claude-haiku-4-5" />
                <option value="claude-3-5-sonnet-20241022" />
                <option value="claude-3-5-haiku-20241022" />
                <option value="gpt-4o" />
                <option value="gpt-4o-mini" />
                <option value="gpt-4-turbo" />
                <option value="o1" />
                <option value="o3-mini" />
                <option value="gemini-2.0-flash" />
                <option value="gemini-2.5-pro" />
                <option value="mistral-large" />
                <option value="deepseek-r1" />
                <option value="llama-3.3-70b" />
              </datalist>
            </>
          ) : (
            <span style={badgeStyle}>{localPrompt.model || "-"}</span>
          )}
          <span style={{ color: "var(--cn-border)", fontSize: 11 }}>·</span>
          <span style={{ fontSize: 11, color: "var(--cn-dim)", fontVariantNumeric: "tabular-nums" }}>
            updated {relativeDate(localPrompt.updatedAt)}
          </span>
        </div>

        {/* Writing surface */}
        <div style={{ margin: "0 20px 20px", borderRadius: 10, background: "var(--cn-bg-s1)", border: "1px solid var(--cn-border)", overflow: "hidden" }}>
          {editing ? (
            <>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); resizeTextarea(); }}
                onPaste={(e) => {
                  setTimeout(resizeTextarea, 0);
                  const pasted = e.clipboardData.getData("text");
                  if (pasted) {
                    e.preventDefault();
                    const cleaned = pasted.replace(/^\n+|\n+$/g, "");
                    const el = e.currentTarget;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newVal = content.slice(0, start) + cleaned + content.slice(end);
                    setContent(newVal);
                    setTimeout(() => { el.selectionStart = el.selectionEnd = start + cleaned.length; resizeTextarea(); }, 0);
                  }
                }}
                placeholder="Enter your prompt..."
                style={{
                  width: "100%", padding: "16px 20px",
                  background: "transparent", color: "var(--cn-text)",
                  fontFamily: "inherit",
                  fontSize: 15, lineHeight: 1.75,
                  border: "none", outline: "none", resize: "none", overflow: "hidden",
                  minHeight: 200, boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px", borderTop: "1px solid var(--cn-border-s)", background: "var(--cn-bg-s2)" }}>
                <span style={{ fontSize: 11, color: "var(--cn-dim)", fontVariantNumeric: "tabular-nums" }}>{content.length} chars</span>
                <span style={{ fontSize: 11, color: "var(--cn-dim)" }}>Ctrl/Cmd+S to save · Esc to cancel</span>
              </div>
            </>
          ) : (
            <pre style={{ padding: "16px 20px", fontSize: 15, fontFamily: "inherit", color: "var(--cn-text)", whiteSpace: "pre-wrap", overflowX: "auto", lineHeight: 1.75, margin: 0 }}>
              {localPrompt.content}
            </pre>
          )}
        </div>

        {/* Footer */}
        {!editing && (
          <div style={{ borderTop: "1px solid var(--cn-border-s)", background: "var(--cn-bg-s1)", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => setShowHistory((v) => !v)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--cn-muted)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text2)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
            >
              <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? "Hide history" : "Version history"}
            </button>
            <button
              onClick={handleDelete}
              style={{ fontSize: 13, color: "#ef4444", background: "none", border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Version history panel */}
      {showHistory && (
        <div style={{ background: "var(--cn-bg-card)", border: "1px solid var(--cn-border)", borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "20px 28px" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--cn-text2)", marginBottom: 16 }}>
              Version history
            </h2>
            <VersionHistory
              key={historyKey}
              promptId={localPrompt.id}
              currentContent={localPrompt.content}
              currentTitle={localPrompt.title}
              onRestore={handleRestore}
            />
          </div>
        </div>
      )}
    </div>
  );
}
