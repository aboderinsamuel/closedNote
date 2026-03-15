"use client";

import Link from "next/link";
import { PoweredByCarousel } from "@/components/PoweredByCarousel";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";

const features = [
  {
    title: "Prompt Chains",
    description: "Thread prompts together in sequences. Each step feeds into the next, building complex AI workflows.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    title: "AI Refinement",
    description: "Improve any prompt with AI-powered suggestions. Get clarity, structure, and specificity analysis.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "OCR Extraction",
    description: "Upload screenshots or photos. GPT-4o Vision extracts text and converts it into clean prompts.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function MarketingHome() {
  const { prompts } = usePrompts();
  const { user } = useAuth();

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-4xl mx-auto py-6 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="font-serif-title text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
            closedNote
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            The prompt engineering platform. Create chains, organize prompts,
            and refine with AI.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link
                  href="/"
                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors"
                >
                  My Prompts
                </Link>
                <Link
                  href="/chains/new"
                  className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium rounded-full transition-colors"
                >
                  Create a Chain
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/docs"
                  className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium rounded-full transition-colors"
                >
                  Read the Docs
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-2 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Powered by
          </div>
          <PoweredByCarousel />
        </div>

        {/* Features Grid */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-8">
            Everything you need for prompt engineering
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 sm:p-12">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Start building better prompts
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-lg mx-auto">
            Join closedNote and take your prompt engineering to the next level
            with chains and AI-powered refinement.
          </p>
          <Link
            href={user ? "/prompts/new" : "/signup"}
            className="inline-flex px-6 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors"
          >
            {user ? "Create Your First Prompt" : "Sign Up Free"}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
