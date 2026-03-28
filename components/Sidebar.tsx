"use client";

import Link from "next/link";
import { useState } from "react";
import { Prompt } from "@/lib/types";
import { groupPromptsByCollection } from "@/lib/promptData";

interface SidebarProps {
  prompts: Prompt[];
  activeCollection?: string;
}

export function Sidebar({ prompts, activeCollection }: SidebarProps) {
  const groups = groupPromptsByCollection(prompts);
  const collections = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (c: string) =>
    setExpanded((prev) => ({ ...prev, [c]: !prev[c] }));

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full overflow-y-auto">
      <div className="p-3 space-y-0.5">
        {/* All prompts */}
        <Link
          href="/dashboard"
          className={`flex items-center justify-between px-2.5 py-2 rounded-md text-sm transition-colors ${
            !activeCollection
              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            All prompts
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
            {prompts.length}
          </span>
        </Link>

        {/* Threads */}
        <Link
          href="/chains"
          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Threads
        </Link>

        {/* Collections */}
        {collections.length > 0 && (
          <div className="pt-3 mt-1 border-t border-neutral-100 dark:border-neutral-800">
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1.5">
              Collections
            </p>
            {collections.map((collection) => {
              const isActive = activeCollection === collection;
              const isExpanded = expanded[collection];
              const count = groups[collection].length;
              const label = collection.charAt(0).toUpperCase() + collection.slice(1);

              return (
                <div key={collection}>
                  <div className={`flex items-center rounded-md transition-colors ${
                    isActive
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}>
                    <Link
                      href={`/dashboard?collection=${encodeURIComponent(collection)}`}
                      className={`flex-1 flex items-center gap-2 px-2.5 py-2 text-sm min-w-0 transition-colors ${
                        isActive
                          ? "text-neutral-900 dark:text-neutral-100 font-medium"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="truncate">{label}</span>
                    </Link>
                    <div className="flex items-center gap-0.5 pr-1.5 shrink-0">
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums w-5 text-right">
                        {count}
                      </span>
                      <button
                        onClick={() => toggle(collection)}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <svg
                          className={`w-3 h-3 text-neutral-400 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ml-4 border-l border-neutral-200 dark:border-neutral-700 pl-2 py-0.5 mb-0.5">
                      {groups[collection].map((prompt) => (
                        <Link
                          key={prompt.id}
                          href={`/prompts/${prompt.id}`}
                          className="block text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 truncate py-1 px-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          {prompt.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
