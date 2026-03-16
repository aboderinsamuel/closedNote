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

export function PromptDetail({ prompt }: PromptDetailProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const router = useRouter();
  const { removeOptimistic, updateOptimistic } = usePrompts();
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  // Auto-focus title and resize textarea when entering edit mode
  useEffect(() => {
    if (editing) {
      titleRef.current?.focus();
      setTimeout(resizeTextarea, 0);
    }
  }, [editing, resizeTextarea]);

  // Keyboard shortcuts: Cmd/Ctrl+S to save, Escape to cancel
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
      router.push("/");
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
      const updated = { ...localPrompt, title: newTitle, content: newContent, updatedAt: now };

      // Only create a version if something actually changed
      const contentChanged = newTitle !== localPrompt.title || newContent !== localPrompt.content;
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
      // skipVersion=true: restore just updates the prompt, no new version created
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

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        &larr; Back to prompts
      </Link>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6">
        {/* Title */}
        {editing ? (
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Prompt title"
            className="w-full px-3 py-2 mb-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            {localPrompt.title}
          </h1>
        )}

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-sm font-medium">
            {localPrompt.collection}
          </span>
          <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-sm">
            {localPrompt.model}
          </span>
        </div>

        {/* Content area */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Prompt
            </span>
            {!editing && (
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-full transition-colors"
              >
                {copied ? "Copied!" : "Copy prompt"}
              </button>
            )}
          </div>

          {editing ? (
            <div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  resizeTextarea();
                }}
                onPaste={(e) => {
                  // Let paste happen, then resize
                  setTimeout(resizeTextarea, 0);
                  // Trim leading/trailing blank lines on paste
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
                className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none overflow-hidden min-h-[160px] transition-shadow"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {content.length} chars
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  ⌘S to save · Esc to cancel
                </span>
              </div>
            </div>
          ) : (
            <pre className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto text-sm font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
              <code>{localPrompt.content}</code>
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-300 dark:text-neutral-900 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setTitle(localPrompt.title);
                  setContent(localPrompt.content);
                  setEditing(false);
                }}
                className="px-5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 text-sm font-medium rounded-md transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="px-5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 text-sm font-medium rounded-md transition-colors"
              >
                {showHistory ? "Hide History" : "Version History"}
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium rounded-md transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
            Version History
          </h2>
          <VersionHistory
            key={historyKey}
            promptId={localPrompt.id}
            currentContent={localPrompt.content}
            currentTitle={localPrompt.title}
            onRestore={handleRestore}
          />
        </div>
      )}
    </div>
  );
}
