"use client";

import Link from "next/link";
import { useState } from "react";
import { Prompt } from "@/lib/types";

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "4o mini",
  "gpt-4": "GPT-4",
  "claude-3.5": "Claude 3.5",
  "claude-3": "Claude 3",
  "gemini-2": "Gemini 2",
  "gemini-pro": "Gemini Pro",
  "mistral": "Mistral",
  "other": "Other",
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

export function PromptListItem({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const preview = prompt.content.replace(/\s+/g, " ").trim();

  return (
    <Link
      href={`/prompts/${prompt.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px",
        borderTop: "1px solid var(--cn-border-s)",
        background: hovered ? "var(--cn-bg-s1)" : "transparent",
        transition: "background 0.12s",
        textDecoration: "none",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--cn-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4, marginBottom: 2 }}>
          {prompt.title}
        </p>
        <p style={{ fontSize: 12, color: "var(--cn-text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>
          {preview}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ display: "none", fontSize: 11, color: "var(--cn-dim)", fontVariantNumeric: "tabular-nums" }}
          className="lg-show">
          {relativeDate(prompt.updatedAt)}
        </span>
        <span style={{ fontSize: 11, color: "var(--cn-dim)" }}>
          {MODEL_LABELS[prompt.model] ?? prompt.model}
        </span>
        <button
          onClick={handleCopy}
          style={{
            opacity: hovered ? 1 : 0,
            padding: "3px 10px",
            fontSize: 11, fontWeight: 600,
            background: copied ? "rgba(123,216,143,0.15)" : "var(--cn-bg-s2)",
            color: copied ? "#7BD88F" : "var(--cn-muted)",
            border: `1px solid ${copied ? "rgba(123,216,143,0.3)" : "var(--cn-border)"}`,
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          aria-label="Copy prompt"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Link>
  );
}
