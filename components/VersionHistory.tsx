"use client";

import { useEffect, useState } from "react";
import { PromptVersion } from "@/lib/types";
import { diff_match_patch } from "diff-match-patch";

interface VersionHistoryProps {
  promptId: string;
  currentContent: string;
  currentTitle: string;
  onRestore: (version: PromptVersion) => void;
}

export function VersionHistory({
  promptId,
  currentContent,
  currentTitle,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [diff, setDiff] = useState<{ html: string } | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts/${promptId}/versions`);
        if (res.ok) {
          const data: PromptVersion[] = await res.json();
          setVersions(data);
        }
      } catch (err) {
        console.error("[VersionHistory] Failed to fetch versions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [promptId]);

  const handleSelectVersion = (version: PromptVersion) => {
    setSelectedVersion(version);

    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(version.content, currentContent);
    dmp.diff_cleanupSemantic(diffs);

    const html = diffs
      .map(([op, text]) => {
        const escaped = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>");
        if (op === 1) return `<ins class="diff-ins">${escaped}</ins>`;
        if (op === -1) return `<del class="diff-del">${escaped}</del>`;
        return `<span>${escaped}</span>`;
      })
      .join("");

    setDiff({ html });
  };

  if (loading) {
    return (
      <div className="text-sm text-neutral-500 dark:text-neutral-400 py-4">
        Loading history...
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-sm text-neutral-500 dark:text-neutral-400 py-4">
        No versions yet. Save an edit to start tracking history.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style>{`
        .diff-ins { background: #bbf7d0; color: #14532d; border-radius: 2px; padding: 0 2px; text-decoration: none; }
        .diff-del { background: #fecaca; color: #7f1d1d; border-radius: 2px; padding: 0 2px; text-decoration: line-through; }
        .dark .diff-ins { background: #166534; color: #bbf7d0; }
        .dark .diff-del { background: #7f1d1d; color: #fecaca; }
      `}</style>

      <div className="flex gap-4">
        {/* Timeline */}
        <div className="w-40 shrink-0 space-y-1">
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => handleSelectVersion(v)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                selectedVersion?.id === v.id
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              <div className="font-semibold">v{v.versionNumber}</div>
              <div className="text-neutral-400 dark:text-neutral-500 mt-0.5">
                {new Date(v.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </button>
          ))}
        </div>

        {/* Diff Panel */}
        <div className="flex-1 min-w-0">
          {selectedVersion ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  v{selectedVersion.versionNumber} vs current
                </span>
                <button
                  onClick={() => onRestore(selectedVersion)}
                  className="px-3 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
                >
                  Restore this version
                </button>
              </div>
              <pre
                className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: diff?.html ?? "" }}
              />
            </div>
          ) : (
            <div className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
              Select a version to see what changed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
