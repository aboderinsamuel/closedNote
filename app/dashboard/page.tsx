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
  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <p className="text-xs font-medium tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-3">
        You&apos;re in
      </p>
      <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        Welcome{userName ? `, ${userName}` : ""}.
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-10">
        closedNote is where you save, version, and refine your prompts. Here&apos;s how to get started.
      </p>

      <ol className="space-y-5 mb-10">
        {[
          ["Save a prompt", "Paste or type any prompt, give it a title, and hit save. Takes 10 seconds."],
          ["Edit freely, versions save automatically", "Every time you update a prompt, the previous version is kept. Restore any version in one click."],
          ["Refine with AI when you need it", "Open any prompt and ask AI to improve it. Add your OpenAI key in Settings to unlock GPT-4o."],
        ].map(([title, desc], i) => (
          <li key={i} className="flex gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-4">
        <Link
          href="/prompts/new"
          onClick={onDismiss}
          className="inline-flex items-center px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors text-sm"
        >
          + Create your first prompt
        </Link>
        <button
          onClick={onDismiss}
          className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
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
      header={<Header onSearch={setSearchQuery} promptCount={allPrompts.length} />}
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
          <div className="max-w-sm mx-auto text-center py-20">
            <p className="text-neutral-900 dark:text-neutral-100 font-medium mb-2">No prompts yet</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Create your first one and it&apos;ll show up here.
            </p>
            <Link
              href="/prompts/new"
              className="inline-flex items-center px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors text-sm"
            >
              + New prompt
            </Link>
          </div>
        )
      ) : (
        <div className="max-w-4xl mx-auto w-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              {activeCollection ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  >
                    All
                  </button>
                  <span className="text-xs text-neutral-300 dark:text-neutral-600">/</span>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                    {activeCollection}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  All prompts
                </span>
              )}
              <span className="text-xs text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? "prompt" : "prompts"}
                {isFiltering && allPrompts.length !== filteredPrompts.length && (
                  <span className="text-neutral-300 dark:text-neutral-600"> of {allPrompts.length}</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isFiltering && (
                <button
                  onClick={() => { setFilters({ query: "", model: "" }); router.push("/dashboard"); }}
                  className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Clear filters
                </button>
              )}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                {([["updated", "Recent"], ["created", "Oldest"], ["alpha", "A-Z"]] as [SortKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      sort === key
                        ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm font-medium"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt list */}
          {collections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No prompts match your search.</p>
              {isFiltering && (
                <button
                  onClick={() => { setFilters({ query: "", model: "" }); router.push("/dashboard"); }}
                  className="mt-3 text-sm text-neutral-900 dark:text-neutral-100 underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
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
