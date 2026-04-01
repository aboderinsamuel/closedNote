"use client";

import { useEffect, useState } from "react";
import { PromptVersion } from "@/lib/types";
import { diff_match_patch } from "diff-match-patch";
import { supabase } from "@/lib/supabase";

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
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/prompts/${promptId}/versions`, {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        });
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
      <p style={{ fontSize: 13, color: "var(--cn-muted)", padding: "16px 0" }}>
        Loading history...
      </p>
    );
  }

  if (versions.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "var(--cn-muted)", padding: "16px 0" }}>
        No versions yet. Save an edit to start tracking history.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        .diff-ins { background: rgba(123,216,143,0.2); color: #7BD88F; border-radius: 2px; padding: 0 2px; text-decoration: none; }
        .diff-del { background: rgba(252,97,141,0.15); color: #FC618D; border-radius: 2px; padding: 0 2px; text-decoration: line-through; }
      `}</style>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Timeline */}
        <div style={{ width: 140, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => handleSelectVersion(v)}
              style={{
                width: "100%", textAlign: "left",
                padding: "8px 12px", borderRadius: 8, border: "none",
                cursor: "pointer", transition: "background 0.12s",
                background: selectedVersion?.id === v.id ? "var(--cn-btn-bg)" : "var(--cn-bg-s2)",
                color: selectedVersion?.id === v.id ? "var(--cn-btn-tx)" : "var(--cn-text2)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700 }}>v{v.versionNumber}</div>
              <div style={{ fontSize: 11, color: selectedVersion?.id === v.id ? "var(--cn-btn-tx)" : "var(--cn-dim)", marginTop: 2, opacity: 0.75 }}>
                {new Date(v.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </button>
          ))}
        </div>

        {/* Diff panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedVersion ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--cn-muted)" }}>
                  v{selectedVersion.versionNumber} vs current
                </span>
                <button
                  onClick={() => onRestore(selectedVersion)}
                  style={{
                    padding: "5px 12px", fontSize: 11, fontWeight: 600,
                    background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
                    border: "none", borderRadius: 6, cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Restore this version
                </button>
              </div>
              <pre
                style={{
                  padding: "12px 14px",
                  background: "var(--cn-bg-s1)", border: "1px solid var(--cn-border)",
                  borderRadius: 8, fontSize: 12,
                  fontFamily: "inherit",
                  whiteSpace: "pre-wrap", overflowX: "auto", lineHeight: 1.7,
                  margin: 0,
                }}
                dangerouslySetInnerHTML={{ __html: diff?.html ?? "" }}
              />
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--cn-muted)", paddingTop: 8 }}>
              Select a version to see what changed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
