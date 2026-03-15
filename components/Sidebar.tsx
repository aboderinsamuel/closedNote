"use client";

import Link from "next/link";
import { Prompt } from "@/lib/types";
import { groupPromptsByTag } from "@/lib/promptData";

interface SidebarProps {
  prompts: Prompt[];
  activeTag?: string;
}

export function Sidebar({ prompts, activeTag }: SidebarProps) {
  const groups = groupPromptsByTag(prompts);
  const tags = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <Link
          href="/"
          className={`block font-semibold text-neutral-900 dark:text-neutral-100 hover:opacity-70 transition-opacity mb-3 ${
            !activeTag ? "underline decoration-yellow-400 underline-offset-4" : ""
          }`}
        >
          All Prompts
        </Link>

        <Link
          href="/chains"
          className="block font-semibold text-neutral-900 dark:text-neutral-100 hover:opacity-70 transition-opacity mb-3"
        >
          Chains
        </Link>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">Tags</p>
          {tags.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <div key={tag} className="mb-3">
                <Link
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className={`block font-semibold text-sm text-neutral-900 dark:text-neutral-100 hover:opacity-70 transition-opacity mb-1 ${
                    isActive ? "underline decoration-yellow-400 underline-offset-4" : ""
                  }`}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Link>
                {groups[tag].map((prompt) => (
                  <Link
                    key={`${tag}-${prompt.id}`}
                    href={`/prompts/${prompt.id}`}
                    className="block text-sm text-neutral-600 dark:text-neutral-400 ml-3 mb-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors truncate"
                  >
                    {prompt.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
