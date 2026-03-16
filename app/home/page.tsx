"use client";

import Link from "next/link";
import { PoweredByCarousel } from "@/components/PoweredByCarousel";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const comparison = [
  { feature: "Version history & diff view", closedNote: true, promptBase: false, flowGPT: false, notion: false },
  { feature: "Private by default", closedNote: true, promptBase: false, flowGPT: false, notion: true },
  { feature: "AI prompt refinement", closedNote: true, promptBase: false, flowGPT: false, notion: false },
  { feature: "OCR — import from screenshots", closedNote: true, promptBase: false, flowGPT: false, notion: false },
  { feature: "Prompt chaining", closedNote: true, promptBase: false, flowGPT: true, notion: false },
  { feature: "Built specifically for prompts", closedNote: true, promptBase: true, flowGPT: true, notion: false },
];

const features = [
  {
    badge: "NEW",
    title: "Version History",
    description: "Every edit is tracked. See exactly what changed between drafts with a visual diff, and restore any previous version in one click.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    badge: null,
    title: "AI Refinement",
    description: "Paste a rough idea and let AI restructure it into a clean, reusable prompt — using your own API key.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    badge: null,
    title: "OCR Import",
    description: "Photograph a whiteboard, screenshot a chat, or upload any image — closedNote extracts the text and saves it as a prompt.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    badge: null,
    title: "Prompt Chains",
    description: "String prompts together into multi-step workflows. Output from one step feeds directly into the next.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
];

export default function MarketingHome() {
  const { prompts } = usePrompts();
  const { user } = useAuth();

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-5xl mx-auto py-4 sm:py-8 px-4">

        {/* ── Hero ── */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            New — Version History is live
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-[1.05]">
            <span className="bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
              Prompts are living
            </span>
            <br />
            <span className="bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
              documents.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            PromptBase stores them. Notion organizes them. closedNote is the only tool that
            <span className="text-neutral-900 dark:text-neutral-100 font-medium"> remembers how they evolved</span> — every draft, every edit, every version.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link href="/" className="px-6 py-3 bg-neutral-900 hover:bg-neutral-700 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors text-sm">
                  Open my prompts
                </Link>
                <Link href="/prompts/new" className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-full transition-colors text-sm">
                  New prompt
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="px-6 py-3 bg-neutral-900 hover:bg-neutral-700 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors text-sm">
                  Get started free
                </Link>
                <Link href="/docs" className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-full transition-colors text-sm">
                  Read the docs
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Powered by ── */}
        <div className="mb-10">
          <p className="text-center text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">Powered by</p>
          <PoweredByCarousel />
        </div>

        {/* ── The Problem ── */}
        <div className="mb-14">
          <div className="text-center mb-7">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">The gap</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Every tool stores prompts.
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">None of them remember.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "PromptBase / FlowGPT",
                verdict: "Built for sharing, not crafting",
                description: "Great marketplaces for discovering prompts. But your prompts are public by default, and there's no memory of how they were built. When something stops working, you're starting from scratch.",
                tone: "neutral",
              },
              {
                label: "Notion / Notes apps",
                verdict: "Flexible but completely dumb",
                description: "Notion doesn't know a prompt from a grocery list. No AI awareness, no refinement, no version tracking. You're just storing text with extra friction.",
                tone: "neutral",
              },
              {
                label: "closedNote",
                verdict: "Private, versioned, intelligent",
                description: "Your prompts stay yours. Every edit is tracked with a visual diff. Iterate with AI refinement, import with OCR, and always know how you got to the version that works.",
                tone: "highlight",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-xl p-6 border transition-colors ${
                  card.tone === "highlight"
                    ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                }`}
              >
                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${card.tone === "highlight" ? "text-neutral-400 dark:text-neutral-600" : "text-neutral-400 dark:text-neutral-500"}`}>
                  {card.label}
                </p>
                <p className={`text-base font-semibold mb-3 ${card.tone === "highlight" ? "text-white dark:text-neutral-900" : "text-neutral-900 dark:text-neutral-100"}`}>
                  {card.verdict}
                </p>
                <p className={`text-sm leading-relaxed ${card.tone === "highlight" ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-500 dark:text-neutral-400"}`}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">How we stack up</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">Built different.</h2>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left px-5 py-4 text-neutral-500 dark:text-neutral-400 font-medium w-1/2">Feature</th>
                  <th className="px-4 py-4 text-center font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800/50">closedNote</th>
                  <th className="px-4 py-4 text-center text-neutral-400 dark:text-neutral-500 font-medium hidden sm:table-cell">PromptBase</th>
                  <th className="px-4 py-4 text-center text-neutral-400 dark:text-neutral-500 font-medium hidden sm:table-cell">FlowGPT</th>
                  <th className="px-4 py-4 text-center text-neutral-400 dark:text-neutral-500 font-medium hidden sm:table-cell">Notion</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-neutral-100 dark:border-neutral-800/60 last:border-0 ${i % 2 === 0 ? "" : "bg-neutral-50/50 dark:bg-neutral-800/20"}`}>
                    <td className="px-5 py-3.5 text-neutral-700 dark:text-neutral-300">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center bg-neutral-50 dark:bg-neutral-800/50">
                      <span className="flex justify-center">{row.closedNote ? <CheckIcon /> : <XIcon />}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="flex justify-center">{row.promptBase ? <CheckIcon /> : <XIcon />}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="flex justify-center">{row.flowGPT ? <CheckIcon /> : <XIcon />}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="flex justify-center">{row.notion ? <CheckIcon /> : <XIcon />}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Version History Spotlight ── */}
        <div className="mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Version History
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
                Git for your prompts.
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                Every time you save an edit, closedNote snapshots the version. Jump back to any point in time, see exactly what changed line-by-line, and restore with one click — without overwriting your history.
              </p>
              <ul className="space-y-3">
                {[
                  "Full version timeline on every prompt",
                  "Visual diff — green added, red removed",
                  "Restore any version without losing history",
                  "No bloat — only versions when content changes",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-300">
                    <CheckIcon />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual mockup */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-lg">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <span className="ml-2 text-xs text-neutral-400">Version History — Code Review Prompt</span>
              </div>
              <div className="flex min-h-[200px]">
                {/* Timeline */}
                <div className="w-24 shrink-0 border-r border-neutral-100 dark:border-neutral-800 p-2.5 space-y-1.5 bg-neutral-50/50 dark:bg-neutral-950/50">
                  {[
                    { v: "v3", date: "Mar 16", active: false },
                    { v: "v2", date: "Mar 15", active: true },
                    { v: "v1", date: "Mar 14", active: false },
                  ].map((item) => (
                    <div
                      key={item.v}
                      className={`px-2.5 py-2 rounded-md text-xs cursor-default ${
                        item.active
                          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                          : "bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <div className="font-semibold">{item.v}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{item.date}</div>
                    </div>
                  ))}
                </div>
                {/* Diff */}
                <div className="flex-1 p-4 font-mono text-xs leading-7 text-neutral-700 dark:text-neutral-300 overflow-hidden">
                  <del className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 no-underline px-0.5 rounded line-through">
                    Act as a coding assistant.
                  </del>
                  {" "}
                  <ins className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 no-underline px-0.5 rounded">
                    You are an expert software engineer.
                  </ins>
                  {" "}
                  Review the following code and identify bugs, security issues, or performance problems.{" "}
                  <ins className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 no-underline px-0.5 rounded">
                    Be specific and actionable.
                  </ins>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end">
                <span className="text-xs px-3 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md cursor-default">
                  Restore v2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features Grid ── */}
        <div className="mb-14">
          <div className="text-center mb-7">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">Everything included</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">One tool. Everything you need.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{feature.title}</h3>
                      {feature.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 sm:p-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Your prompts deserve better.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Stop losing great drafts. Start building a prompt library that actually remembers how it was built.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={user ? "/" : "/signup"}
              className="px-8 py-3 bg-neutral-900 hover:bg-neutral-700 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors"
            >
              {user ? "Go to my prompts" : "Get started — it's free"}
            </Link>
            {!user && (
              <Link
                href="/login"
                className="px-8 py-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-full transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
