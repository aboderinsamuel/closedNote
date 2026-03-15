"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { Prompt } from "@/lib/types";
import { useAuth } from "./AuthProvider";

interface ResultItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  type: "page" | "prompt";
}

function normalize(s: string) {
  return s.toLowerCase();
}

export function SearchPalette() {
  const router = useRouter();
  const { prompts } = usePrompts();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  // Open with Ctrl/Cmd+K and via custom event
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    const openHandler = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", openHandler as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", openHandler as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlight(0);
    }
  }, [open]);

  const pages: ResultItem[] = useMemo(
    () => [
      { id: "home", title: "Home", href: "/", type: "page" },
      { id: "new", title: "New Prompt", href: "/prompts/new", type: "page" },
      { id: "chains", title: "Threads", subtitle: "Prompt threads & workflows", href: "/chains", type: "page" },
      { id: "new-chain", title: "New Thread", href: "/chains/new", type: "page" },
      { id: "ocr", title: "OCR", subtitle: "Extract text from images", href: "/ocr", type: "page" },
      { id: "settings", title: "Settings", href: "/settings", type: "page" },
      { id: "docs", title: "Documentation", href: "/docs", type: "page" },
    ],
    []
  );

  const promptItems: ResultItem[] = useMemo(() => {
    if (!user) return [];
    return prompts.map((p: Prompt) => ({
      id: p.id,
      title: p.title,
      subtitle: p.collection,
      href: `/prompts/${p.id}`,
      type: "prompt" as const,
    }));
  }, [prompts, user]);

  const allItems: ResultItem[] = useMemo(() => {
    if (!query.trim()) return [...pages, ...promptItems];
    const q = normalize(query);
    return [...pages, ...promptItems].filter((i) =>
      normalize(i.title + " " + (i.subtitle || "")).includes(q)
    );
  }, [pages, promptItems, query]);

  const onSelect = (item: ResultItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allItems[highlight]) onSelect(allItems[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="absolute left-1/2 top-[10%] -translate-x-1/2 w-[92%] sm:w-[640px]">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="relative">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages or prompts"
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {allItems.length === 0 ? (
              <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
                No results
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allItems.map((item, idx) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                        idx === highlight
                          ? "bg-neutral-100 dark:bg-neutral-800"
                          : ""
                      }`}
                    >
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          item.type === "page"
                            ? "border-blue-300 text-blue-600 dark:border-blue-800 dark:text-blue-300"
                            : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {item.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-neutral-900 dark:text-neutral-100">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Use up/down to navigate | Enter to open | Esc to close</span>
            <span className="hidden sm:inline">Press Ctrl/Cmd+K to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
