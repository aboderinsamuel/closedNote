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
  const toggle = (c: string) => setExpanded((prev) => ({ ...prev, [c]: !prev[c] }));

  return (
    <aside style={{
      width: 216, flexShrink: 0,
      borderRight: "1px solid var(--cn-border-s)",
      height: "100%", overflowY: "auto",
      background: "var(--cn-bg)",
    }}>
      <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2 }}>

        {/* All prompts */}
        <SideLink
          href="/dashboard"
          active={!activeCollection}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
          count={prompts.length}
        >
          All prompts
        </SideLink>

        {/* Threads */}
        <SideLink
          href="/chains"
          active={false}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        >
          Threads
        </SideLink>

        {/* Collections */}
        {collections.length > 0 && (
          <div style={{ paddingTop: 12, marginTop: 4, borderTop: "1px solid var(--cn-border-s)" }}>
            <p style={{ padding: "0 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cn-dim)", marginBottom: 6 }}>
              Collections
            </p>
            {collections.map((collection) => {
              const isActive = activeCollection === collection;
              const isExpanded = expanded[collection];
              const count = groups[collection].length;
              const label = collection.charAt(0).toUpperCase() + collection.slice(1);

              return (
                <div key={collection}>
                  <div style={{ display: "flex", alignItems: "center", borderRadius: 6, background: isActive ? "var(--cn-bg-s2)" : "transparent", transition: "background 0.12s" }}>
                    <Link
                      href={`/dashboard?collection=${encodeURIComponent(collection)}`}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", gap: 7,
                        padding: "7px 8px", fontSize: 13, textDecoration: "none", minWidth: 0,
                        color: isActive ? "var(--cn-text)" : "var(--cn-text2)",
                        fontWeight: isActive ? 600 : 500,
                        transition: "color 0.12s",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--cn-text)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--cn-text2)"; }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 13, height: 13, flexShrink: 0, color: "var(--cn-dim)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, paddingRight: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "var(--cn-dim)", minWidth: 16, textAlign: "right" }}>{count}</span>
                      <button
                        onClick={() => toggle(collection)}
                        style={{ padding: 3, borderRadius: 4, border: "none", background: "none", cursor: "pointer", color: "var(--cn-dim)", display: "flex", transition: "background 0.12s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--cn-bg-s2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <svg style={{ width: 11, height: 11, transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginLeft: 16, borderLeft: "1px solid var(--cn-border-s)", paddingLeft: 8, paddingTop: 2, paddingBottom: 2 }}>
                      {groups[collection].map((prompt) => (
                        <Link
                          key={prompt.id}
                          href={`/prompts/${prompt.id}`}
                          style={{ display: "block", fontSize: 12, color: "var(--cn-muted)", padding: "4px 6px", borderRadius: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none", transition: "color 0.12s, background 0.12s" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--cn-text)"; e.currentTarget.style.background = "var(--cn-bg-s1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "var(--cn-muted)"; e.currentTarget.style.background = "none"; }}
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

function SideLink({ href, active, icon, count, children }: {
  href: string; active: boolean; icon: React.ReactNode;
  count?: number; children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 8px", borderRadius: 6, fontSize: 13, textDecoration: "none",
        fontWeight: active ? 600 : 500,
        color: active ? "var(--cn-text)" : "var(--cn-text2)",
        background: active ? "var(--cn-bg-s2)" : hovered ? "var(--cn-bg-s1)" : "transparent",
        transition: "background 0.12s, color 0.12s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 7, color: active || hovered ? "var(--cn-text)" : "var(--cn-text2)" }}>
        <span style={{ color: "var(--cn-dim)", display: "flex" }}>{icon}</span>
        {children}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: 11, color: "var(--cn-dim)" }}>{count}</span>
      )}
    </Link>
  );
}
