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
  const [model, setModel] = useState<PromptModel>("");
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

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
    color: "var(--cn-muted)", display: "block", marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    background: "var(--cn-bg-s2)",
    border: "1px solid var(--cn-border)",
    borderRadius: 8, fontSize: 13, color: "var(--cn-text)",
    outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  return (
    <div
      className={shaking ? "animate-shake" : ""}
      style={{
        background: "var(--cn-bg-card)",
        border: "1px solid var(--cn-border)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.requestSubmit();
          }
        }}
      >
        {/* Title */}
        <div style={{ padding: "28px 32px 16px" }}>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError("");
              markDirty();
            }}
            placeholder="Untitled prompt"
            style={{
              width: "100%", fontSize: 26, fontWeight: 700,
              background: "transparent", color: "var(--cn-text)",
              border: "none", outline: "none",
              fontFamily: "inherit",
            }}
          />
          {titleError && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>{titleError}</p>
          )}
        </div>

        {/* Writing surface */}
        <div style={{
          margin: "0 20px 20px",
          borderRadius: 10,
          background: "var(--cn-bg-s1)",
          border: "1px solid var(--cn-border)",
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}>
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
            placeholder="Write your prompt here..."
            style={{
              width: "100%", padding: "16px 20px",
              background: "transparent",
              color: "var(--cn-text)",
              fontFamily: "inherit",
              fontSize: 15, lineHeight: 1.75,
              border: "none", outline: "none",
              resize: "none", overflow: "hidden",
              minHeight: 260,
              boxSizing: "border-box",
            }}
          />
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 20px",
            borderTop: "1px solid var(--cn-border-s)",
            background: "var(--cn-bg-s2)",
          }}>
            <span style={{ fontSize: 11, color: "var(--cn-dim)", fontVariantNumeric: "tabular-nums" }}>
              {content.length} chars
            </span>
            <span style={{ fontSize: 11, color: "var(--cn-dim)" }}>
              Ctrl/Cmd+Enter to save
            </span>
          </div>
          {contentError && (
            <p style={{ padding: "0 20px 12px", fontSize: 12, color: "#ef4444" }}>{contentError}</p>
          )}
        </div>

        {/* Metadata */}
        <div style={{ padding: "0 32px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          <div>
            <label style={labelStyle}>Collection</label>
            <input
              type="text"
              list="collection-options"
              value={collection}
              onChange={(e) => { setCollection(e.target.value); markDirty(); }}
              placeholder="e.g. coding"
              style={inputStyle}
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
            <label htmlFor="model-input" style={labelStyle}>Model</label>
            <input
              id="model-input"
              type="text"
              list="model-options"
              value={model}
              onChange={(e) => { setModel(e.target.value); markDirty(); }}
              placeholder="e.g. claude-sonnet-4-6"
              autoComplete="off"
              style={inputStyle}
            />
            <datalist id="model-options">
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
              <option value="gemini-1.5-pro" />
              <option value="mistral-large" />
              <option value="deepseek-r1" />
              <option value="llama-3.3-70b" />
            </datalist>
          </div>

          <div>
            <label style={labelStyle}>Tags</label>
            <div
              style={{
                display: "flex", flexWrap: "wrap", gap: 6,
                padding: "8px 12px",
                background: "var(--cn-bg-s2)",
                border: "1px solid var(--cn-border)",
                borderRadius: 8, minHeight: 40, cursor: "text",
                transition: "border-color 0.15s",
              }}
              onClick={() => {
                const input = document.getElementById("tag-input") as HTMLInputElement | null;
                input?.focus();
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 8px",
                    background: "var(--cn-bg-card)",
                    border: "1px solid var(--cn-border)",
                    color: "var(--cn-text2)",
                    fontSize: 11, borderRadius: 6,
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    style={{ color: "var(--cn-muted)", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: 13 }}
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
                style={{
                  flex: 1, minWidth: 80,
                  background: "transparent", fontSize: 13,
                  color: "var(--cn-text)", border: "none", outline: "none",
                }}
              />
            </div>
            <p style={{ marginTop: 4, fontSize: 11, color: "var(--cn-dim)" }}>
              Enter or comma to add
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div style={{
          borderTop: "1px solid var(--cn-border-s)",
          background: "var(--cn-bg-s1)",
          padding: "14px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "var(--cn-dim)" }}>
            Saved to your account
          </span>
          <button
            type="submit"
            style={{
              padding: "9px 24px",
              background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
              border: "none", borderRadius: 99,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Save prompt
          </button>
        </div>
      </form>
    </div>
  );
}
