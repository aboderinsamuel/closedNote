"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";
import { getAllChains } from "@/lib/chainData";
import { PromptChain } from "@/lib/types";

export default function ChainsPage() {
  const { prompts } = usePrompts();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [chains, setChains] = useState<PromptChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const loadChains = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllChains();
        setChains(data);
      } catch (err) {
        console.error("[ChainsPage] Failed to load chains:", err);
        setError("Failed to load chains");
      } finally {
        setLoading(false);
      }
    };

    loadChains();
  }, [user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Prompt Threads
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Build multi-step prompt workflows and run them sequentially.
            </p>
          </div>
          <Link
            href="/chains/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-full transition-colors self-start sm:self-auto"
          >
            + New Thread
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading threads...
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && chains.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 sm:mb-6">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400 dark:text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No threads yet
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
              Create your first prompt thread to build multi-step AI workflows. Thread prompts together and run them in sequence.
            </p>
            <Link
              href="/chains/new"
              className="inline-flex items-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-full transition-colors"
            >
              Create your first thread
            </Link>
          </div>
        )}

        {/* Chain card grid */}
        {!loading && chains.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chains.map((chain) => (
              <Link
                key={chain.id}
                href={`/chains/${chain.id}`}
                className="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors line-clamp-1">
                    {chain.title}
                  </h3>
                  <span className="flex-shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {chain.steps.length} {chain.steps.length === 1 ? "step" : "steps"}
                  </span>
                </div>

                {chain.description && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                    {chain.description}
                  </p>
                )}

                {!chain.description && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 italic mb-3">
                    No description
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                  <span>
                    {new Date(chain.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {chain.isPublic && (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Public
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
