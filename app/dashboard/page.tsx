"use client";

import { Suspense } from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { groupPromptsByCollection, filterPrompts } from "@/lib/promptData";
import { Prompt, PromptModel } from "@/lib/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Layout } from "@/components/Layout";
import { PromptCollection } from "@/components/PromptCollection";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";

const ONBOARDING_KEY = (userId: string) => `closednote_onboarded_${userId}`;

type SortKey = "updated" | "created" | "alpha";

function WelcomeBanner({ userName, onDismiss }: { userName: string; onDismiss: () => void }) {
  const steps = [
    ["Save a prompt", "Paste or type any prompt, give it a title, and hit save. Takes 10 seconds."],
    ["Edit freely, versions save automatically", "Every time you update a prompt, the previous version is kept. Restore any version in one click."],
    ["Refine with AI when you need it", "Open any prompt and ask AI to improve it. Add your OpenAI key in Settings to unlock GPT-4o."],
  ];
  const colors = ["#948AE3", "#5AD4E6", "#7BD88F"];
  return (
    <div className="animate-fade-up max-w-xl mx-auto py-16 px-4">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24,
        padding: "4px 12px", border: "1px solid var(--cn-border-s)", borderRadius: 99,
        fontSize: 11, fontWeight: 700, color: "var(--cn-accent)", letterSpacing: "0.08em", textTransform: "uppercase" as const,
        background: "var(--cn-badge-bg)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7BD88F", display: "inline-block", boxShadow: "0 0 6px #7BD88F" }} />
        You&apos;re in
      </div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 12 }}>
        Welcome{userName ? `, ${userName}` : ""}.
      </h1>
      <p style={{ fontSize: 15, color: "var(--cn-text2)", lineHeight: 1.7, marginBottom: 36 }}>
        closedNote is where you save, version, and refine your prompts. Here&apos;s how to get started.
      </p>

      <ol style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {steps.map(([title, desc], i) => (
          <li key={i} style={{ display: "flex", gap: 14 }}>
            <span style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
              background: `${colors[i]}20`, border: `1.5px solid ${colors[i]}50`,
              color: colors[i], fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i + 1}
            </span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cn-text)", marginBottom: 3 }}>{title}</p>
              <p style={{ fontSize: 13, color: "var(--cn-muted)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          href="/prompts/new"
          onClick={onDismiss}
          style={{
            display: "inline-flex", alignItems: "center", padding: "10px 22px",
            background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
            borderRadius: 99, fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          + Create your first prompt
        </Link>
        <button
          onClick={onDismiss}
          style={{ fontSize: 14, color: "var(--cn-muted)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function sortPrompts(prompts: Prompt[], sort: SortKey): Prompt[] {
  return [...prompts].sort((a, b) => {
    if (sort === "alpha") return a.title.localeCompare(b.title);
    if (sort === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function DashboardContent() {
  const { prompts: allPrompts, loading, error } = usePrompts();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCollection = searchParams.get("collection") ?? undefined;

  const [filters, setFilters] = useState<{ query: string; model: PromptModel | "" }>({ query: "", model: "" });
  const [sort, setSort] = useState<SortKey>("updated");
  const [showWelcome, setShowWelcome] = useState(false);

  const setSearchQuery = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, query: q }));
  }, []);

  useEffect(() => {
    if (!user || authLoading || loading) return;
    if (allPrompts.length > 0) return;
    const key = ONBOARDING_KEY(user.id);
    if (!localStorage.getItem(key)) setShowWelcome(true);
  }, [user, authLoading, loading, allPrompts.length]);

  function dismissWelcome() {
    if (user) localStorage.setItem(ONBOARDING_KEY(user.id), "1");
    setShowWelcome(false);
  }

  const filteredPrompts = useMemo(() => {
    return filterPrompts(allPrompts, {
      query: filters.query || undefined,
      model: filters.model || undefined,
      collection: activeCollection,
    });
  }, [filters, allPrompts, activeCollection]);

  const sortedPrompts = useMemo(() => sortPrompts(filteredPrompts, sort), [filteredPrompts, sort]);

  const promptsByCollection = useMemo(() => groupPromptsByCollection(sortedPrompts), [sortedPrompts]);
  const collections = Object.keys(promptsByCollection).sort();

  const isFiltering = !!filters.query || !!activeCollection;

  return (
    <Layout
      header={<Header onSearch={setSearchQuery} />}
      sidebar={allPrompts.length > 0 ? <Sidebar prompts={allPrompts} activeCollection={activeCollection} /> : null}
    >
      {error ? (
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            <p className="font-medium">Failed to load prompts</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : (authLoading || loading) ? (
        <div className="max-w-4xl mx-auto w-full space-y-px animate-pulse">
          {[3, 5, 2].map((n, i) => (
            <div key={i} className="mb-4">
              <div className="h-8 bg-neutral-100 dark:bg-neutral-800/60 rounded-md mb-px" />
              {Array.from({ length: n }).map((_, j) => (
                <div key={j} className="h-11 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/40 last:border-0" />
              ))}
            </div>
          ))}
        </div>
      ) : allPrompts.length === 0 ? (
        showWelcome ? (
          <WelcomeBanner userName={user?.displayName?.split(" ")[0] ?? ""} onDismiss={dismissWelcome} />
        ) : (
          <div className="animate-fade-up max-w-sm mx-auto text-center py-20">
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg fill="none" stroke="var(--cn-muted)" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--cn-text)", marginBottom: 6 }}>No prompts yet</p>
            <p style={{ fontSize: 13, color: "var(--cn-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              Create your first one and it&apos;ll show up here.
            </p>
            <Link
              href="/prompts/new"
              style={{
                display: "inline-flex", alignItems: "center", padding: "9px 20px",
                background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
                borderRadius: 99, fontWeight: 600, fontSize: 13, textDecoration: "none", transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              + New prompt
            </Link>
          </div>
        )
      ) : (
        <div className="animate-fade-up max-w-4xl mx-auto w-full">
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {activeCollection ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => router.push("/dashboard")}
                    style={{ fontSize: 12, color: "var(--cn-muted)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
                  >
                    All
                  </button>
                  <span style={{ fontSize: 12, color: "var(--cn-border)" }}>/</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cn-text2)", textTransform: "capitalize" as const }}>{activeCollection}</span>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: "var(--cn-muted)" }}>All prompts</span>
              )}
              <span style={{ fontSize: 12, color: "var(--cn-border)" }}>·</span>
              <span style={{ fontSize: 12, color: "var(--cn-dim)" }}>
                {filteredPrompts.length} {filteredPrompts.length === 1 ? "prompt" : "prompts"}
                {isFiltering && allPrompts.length !== filteredPrompts.length && (
                  <span style={{ color: "var(--cn-border)" }}> of {allPrompts.length}</span>
                )}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isFiltering && (
                <button
                  onClick={() => { setFilters({ query: "", model: "" }); router.push("/dashboard"); }}
                  style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--cn-border)", color: "var(--cn-muted)", background: "transparent", cursor: "pointer", transition: "background 0.12s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--cn-bg-s1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Clear filters
                </button>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--cn-bg-s2)", borderRadius: 8, padding: 3 }}>
                {([["updated", "Recent"], ["created", "Oldest"], ["alpha", "A-Z"]] as [SortKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    style={{
                      padding: "4px 10px", fontSize: 12, borderRadius: 6, border: "none", cursor: "pointer",
                      fontWeight: sort === key ? 600 : 500,
                      background: sort === key ? "var(--cn-bg-card)" : "transparent",
                      color: sort === key ? "var(--cn-text)" : "var(--cn-muted)",
                      boxShadow: sort === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.12s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt list */}
          {collections.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <p style={{ fontSize: 14, color: "var(--cn-muted)" }}>No prompts match your search.</p>
              {isFiltering && (
                <button
                  onClick={() => { setFilters({ query: "", model: "" }); router.push("/dashboard"); }}
                  style={{ marginTop: 10, fontSize: 14, color: "var(--cn-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ border: "1px solid var(--cn-border)", borderRadius: 12, overflow: "hidden" }}>
              {collections.map((collection, i) => (
                <PromptCollection
                  key={collection}
                  collection={collection}
                  prompts={promptsByCollection[collection]}
                  defaultOpen={collections.length <= 5 || !!activeCollection}
                  bordered={i < collections.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
