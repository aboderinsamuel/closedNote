"use client";

import { Suspense } from "react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { groupPromptsByCollection, filterPrompts } from "@/lib/promptData";
import { PromptModel } from "@/lib/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Layout } from "@/components/Layout";
import { PromptCollection } from "@/components/PromptCollection";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";

const ONBOARDING_KEY = (userId: string) => `closednote_onboarded_${userId}`;

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
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center">
            1
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Save a prompt</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Paste or type any prompt, give it a title, and hit save. Takes 10 seconds.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center">
            2
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Edit freely, versions save automatically</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Every time you update a prompt, the previous version is kept. Restore any version in one click.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center">
            3
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Refine with AI when you need it</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Open any prompt and ask AI to improve it. Add your OpenAI key in Settings to unlock GPT-4o.
            </p>
          </div>
        </li>
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

function DashboardContent() {
  const { prompts: allPrompts, loading, error } = usePrompts();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    query: string;
    model: PromptModel | "";
  }>({ query: "", model: "" });
  const [activeCollection, setActiveCollection] = useState<
    string | undefined
  >();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const collection = urlParams.get("collection");
      if (collection) setActiveCollection(collection);
    }
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, query: searchQuery }));
  }, [searchQuery]);

  // Show welcome only once per account, on first login with no prompts
  useEffect(() => {
    if (!user || authLoading || loading) return;
    if (allPrompts.length > 0) return;
    const key = ONBOARDING_KEY(user.id);
    if (!localStorage.getItem(key)) {
      setShowWelcome(true);
    }
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

  const promptsByCollection = useMemo(() => {
    return groupPromptsByCollection(filteredPrompts);
  }, [filteredPrompts]);

  const collections = Object.keys(promptsByCollection).sort();

  return (
    <Layout
      header={
        <Header onSearch={setSearchQuery} promptCount={allPrompts.length} />
      }
      sidebar={
        allPrompts.length > 0 ? (
          <Sidebar prompts={allPrompts} activeCollection={activeCollection} />
        ) : null
      }
    >
      {error ? (
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            <p className="font-medium">Failed to load prompts</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : (authLoading || loading) ? (
        <div className="max-w-5xl mx-auto w-full animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-20 mb-2 mx-3" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-neutral-100 dark:bg-neutral-900 rounded-md mb-1 mx-1" />
              ))}
            </div>
          ))}
        </div>
      ) : allPrompts.length === 0 ? (
        showWelcome ? (
          <WelcomeBanner
            userName={user?.displayName?.split(" ")[0] ?? ""}
            onDismiss={dismissWelcome}
          />
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
        <div className="max-w-5xl mx-auto w-full">
          <div>
            {collections.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No prompts found matching your filters.
                </p>
              </div>
            ) : (
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
                {collections.map((collection) => (
                  <PromptCollection
                    key={collection}
                    collection={collection}
                    prompts={promptsByCollection[collection]}
                  />
                ))}
              </div>
            )}
          </div>
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
