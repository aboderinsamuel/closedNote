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

export function PromptListItem({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = useState(false);

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
      className="group flex items-center gap-4 px-3 py-2.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate leading-snug">
          {prompt.title}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
          {preview}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:block text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
          {MODEL_LABELS[prompt.model] ?? prompt.model}
        </span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 px-2.5 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Link>
  );
}
