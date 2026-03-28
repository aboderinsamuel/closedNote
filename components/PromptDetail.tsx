"use client";

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
      const updated = { ...localPrompt, title: newTitle, content: newContent, collection: newCollection, updatedAt: now };

      const contentChanged = newTitle !== localPrompt.title || newContent !== localPrompt.content || newCollection !== localPrompt.collection;
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

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      {/* Nav row */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        <span className="text-neutral-200 dark:text-neutral-700">/</span>
        <span className="text-sm text-neutral-400 dark:text-neutral-500 truncate max-w-xs">
          {localPrompt.title}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main document card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg shadow-neutral-300/50 dark:shadow-black/50 ring-1 ring-neutral-900/5 dark:ring-white/5 overflow-hidden">

        {/* Header: title + actions */}
        <div className="flex items-start gap-4 px-6 sm:px-8 pt-7 pb-4">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled prompt"
                className="w-full text-2xl sm:text-3xl font-semibold bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none border-b border-neutral-200 dark:border-neutral-700 pb-1"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                {localPrompt.title}
              </h1>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setTitle(localPrompt.title);
                    setContent(localPrompt.content);
                    setCollection(localPrompt.collection);
                    setEditing(false);
                  }}
                  className="px-3.5 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 px-6 sm:px-8 pb-5">
          {editing ? (
            <input
              type="text"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="collection"
              className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-600 w-32"
            />
          ) : (
            <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md text-xs font-medium capitalize">
              {localPrompt.collection}
            </span>
          )}
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 rounded-md text-xs">
            {MODEL_LABELS[localPrompt.model] ?? localPrompt.model}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
            updated {relativeDate(localPrompt.updatedAt)}
          </span>
        </div>

        {/* Writing surface */}
        <div className="mx-4 sm:mx-6 mb-6 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {editing ? (
            <>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  resizeTextarea();
                }}
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
                    setTimeout(() => {
                      el.selectionStart = el.selectionEnd = start + cleaned.length;
                      resizeTextarea();
                    }, 0);
                  }
                }}
                placeholder="Enter your prompt..."
                className="w-full px-5 py-4 bg-transparent text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-hidden min-h-[200px]"
              />
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40">
                <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
                  {content.length} chars
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  Ctrl/Cmd+S to save, Esc to cancel
                </span>
              </div>
            </>
          ) : (
            <pre className="px-5 py-4 text-sm font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
              <code>{localPrompt.content}</code>
            </pre>
          )}
        </div>

        {/* Footer actions (view mode only) */}
        {!editing && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/30 px-6 sm:px-8 py-3 flex items-center justify-between">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? "Hide history" : "Version history"}
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Version history panel */}
      {showHistory && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg shadow-neutral-300/50 dark:shadow-black/50 ring-1 ring-neutral-900/5 dark:ring-white/5 overflow-hidden">
          <div className="px-6 sm:px-8 py-5">
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
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
