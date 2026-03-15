"use client";

import { Suspense } from "react";
import { useState, useMemo, useEffect } from "react";
import { groupPromptsByCollection, filterPrompts } from "@/lib/promptData";
import { Prompt, PromptModel } from "@/lib/types";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Layout } from "@/components/Layout";
import { PromptCollection } from "@/components/PromptCollection";
import { UseCasesShowcase } from "@/components/UseCasesShowcase";
import { PoweredByCarousel } from "@/components/PoweredByCarousel";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";

function HomeContent() {
  const { prompts: allPrompts, loading, error } = usePrompts();
  const { loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    query: string;
    model: PromptModel | "";
  }>({ query: "", model: "" });
  const [activeCollection, setActiveCollection] = useState<
    string | undefined
  >();
  const [activeTag, setActiveTag] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const collection = urlParams.get("collection");
      if (collection) setActiveCollection(collection);
      const tag = urlParams.get("tag");
      if (tag) setActiveTag(tag);
    }
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, query: searchQuery }));
  }, [searchQuery]);

  const filteredPrompts = useMemo(() => {
    return filterPrompts(allPrompts, {
      query: filters.query || undefined,
      model: filters.model || undefined,
      collection: activeCollection,
      tag: activeTag,
    });
  }, [filters, allPrompts, activeCollection, activeTag]);

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
          <Sidebar prompts={allPrompts} activeTag={activeTag} />
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif-title text-4xl sm:text-5xl font-normal text-neutral-900 dark:text-neutral-100 mb-4">
              closedNote
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Your personal prompt notebook. Create, organize, and refine AI
              prompts with speed and clarity.
            </p>
          </div>
          <div className="mb-8">
            <div className="text-center mb-2 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Powered by
            </div>
            <PoweredByCarousel />
          </div>
          <UseCasesShowcase />
        </div>
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
