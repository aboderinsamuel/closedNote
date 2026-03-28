"use client";

import { useState } from "react";
import { Prompt } from "@/lib/types";
import { PromptListItem } from "./PromptListItem";

interface PromptCollectionProps {
  collection: string;
  prompts: Prompt[];
  defaultOpen?: boolean;
  bordered?: boolean;
}

export function PromptCollection({ collection, prompts, defaultOpen = true, bordered = false }: PromptCollectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const label = collection.charAt(0).toUpperCase() + collection.slice(1);

  return (
    <div className={bordered ? "border-b border-neutral-200 dark:border-neutral-800" : ""}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
      >
        <svg
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-150 ${open ? "rotate-0" : "-rotate-90"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex-1 text-left">
          {label}
        </h2>
        <span className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
          {prompts.length}
        </span>
      </button>

      {open && (
        <div>
          {prompts.map((prompt) => (
            <PromptListItem key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
