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
  const [hovered, setHovered] = useState(false);
  const label = collection.charAt(0).toUpperCase() + collection.slice(1);

  return (
    <div style={bordered ? { borderBottom: "1px solid var(--cn-border)" } : {}}>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px",
          background: hovered ? "var(--cn-bg-s1)" : "transparent",
          border: "none", cursor: "pointer",
          transition: "background 0.12s",
        }}
      >
        <svg
          style={{
            width: 13, height: 13, color: "var(--cn-muted)", flexShrink: 0,
            transition: "transform 0.15s",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <h2 style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--cn-muted)", flex: 1, textAlign: "left",
        }}>
          {label}
        </h2>
        <span style={{ fontSize: 11, color: "var(--cn-dim)", fontVariantNumeric: "tabular-nums" }}>
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
