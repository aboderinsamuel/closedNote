"use client";

import { useState, useRef, useCallback, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PromptModel } from "@/lib/types";
import { savePrompt, savePromptTags, groupPromptsByCollection } from "@/lib/promptData";
import { useAuth } from "./AuthProvider";
import { usePrompts } from "@/lib/hooks/usePrompts";

interface PromptFormProps {
  onDirtyChange?: (dirty: boolean) => void;
}

export function PromptForm({ onDirtyChange }: PromptFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { prompts, addOptimistic, refresh } = usePrompts();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [model, setModel] = useState<PromptModel>("gpt-4o");
  const [collection, setCollection] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [shaking, setShaking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const existingCollections = useMemo(() => {
    return Object.keys(groupPromptsByCollection(prompts))
      .filter((c) => c !== "uncategorized")
      .sort();
  }, [prompts]);

  const markDirty = useCallback(() => {
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }

  function addTag(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      markDirty();
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    let hasError = false;
    if (!trimmedTitle) {
      setTitleError("Title is required.");
      hasError = true;
    }
    if (!trimmedContent) {
      setContentError("Prompt content is required.");
      hasError = true;
    }
    if (hasError) {
      triggerShake();
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newPrompt = {
      id,
      title: trimmedTitle,
      content: trimmedContent,
      model,
      collection: collection.trim() || "uncategorized",
      createdAt: now,
      updatedAt: now,
    };

    onDirtyChange?.(false);
    addOptimistic(newPrompt);
    router.push("/dashboard");

    savePrompt(newPrompt)
      .then(() => {
        if (tags.length > 0) return savePromptTags(id, tags);
      })
      .then(() => refresh())
      .catch((err) => {
        console.error("Error saving prompt:", err);
        refresh();
      });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.requestSubmit();
          }
        }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError("");
              markDirty();
            }}
            placeholder="Give your prompt a name"
            className={`w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-shadow ${
              titleError
                ? "border-red-400 dark:border-red-500 focus:ring-red-300 dark:focus:ring-red-700"
                : "border-neutral-200 dark:border-neutral-800 focus:ring-neutral-300 dark:focus:ring-neutral-700"
            }`}
          />
          {titleError && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{titleError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Prompt
          </label>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.trim()) setContentError("");
              resizeTextarea();
              markDirty();
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (pasted) {
                e.preventDefault();
                const cleaned = pasted.replace(/^\n+|\n+$/g, "");
                const el = e.currentTarget;
                const start = el.selectionStart;
                const end = el.selectionEnd;
                const newVal = content.slice(0, start) + cleaned + content.slice(end);
                setContent(newVal);
                if (cleaned.trim()) setContentError("");
                markDirty();
                setTimeout(() => {
                  el.selectionStart = el.selectionEnd = start + cleaned.length;
                  resizeTextarea();
                }, 0);
              }
            }}
            placeholder="Paste or type your prompt here..."
            className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 font-mono text-sm focus:outline-none focus:ring-2 transition-shadow resize-none overflow-hidden min-h-[160px] ${
              contentError
                ? "border-red-400 dark:border-red-500 focus:ring-red-300 dark:focus:ring-red-700"
                : "border-neutral-200 dark:border-neutral-800 focus:ring-neutral-300 dark:focus:ring-neutral-700"
            }`}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {content.length} chars
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Ctrl/Cmd+Enter to save
            </span>
          </div>
          {contentError && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{contentError}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Collection
            </label>
            <input
              type="text"
              list="collection-options"
              value={collection}
              onChange={(e) => { setCollection(e.target.value); markDirty(); }}
              placeholder="e.g. coding"
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-shadow"
            />
            {existingCollections.length > 0 && (
              <datalist id="collection-options">
                {existingCollections.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => { setModel(e.target.value as PromptModel); markDirty(); }}
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-shadow"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3.5">Claude 3.5</option>
              <option value="claude-3">Claude 3</option>
              <option value="gemini-2">Gemini 2</option>
              <option value="gemini-pro">Gemini Pro</option>
              <option value="mistral">Mistral</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Tags
          </label>
          <div
            className="flex flex-wrap gap-1.5 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus-within:ring-2 focus-within:ring-neutral-300 dark:focus-within:ring-neutral-700 transition-shadow cursor-text min-h-[42px]"
            onClick={() => {
              const input = document.getElementById("tag-input") as HTMLInputElement | null;
              input?.focus();
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-md"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 leading-none"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                  removeTag(tags[tags.length - 1]);
                }
              }}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
              placeholder={tags.length === 0 ? "Add tags..." : ""}
              className="flex-1 min-w-[80px] bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none py-0.5"
            />
          </div>
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            Press Enter or comma to add a tag
          </p>
        </div>

        <button
          type="submit"
          className={`w-full px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-lg transition-colors ${shaking ? "animate-shake" : ""}`}
        >
          Save prompt
        </button>
      </form>
    </div>
  );
}
