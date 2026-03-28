"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const comparison = [
  { feature: "Version history + diff view", closedNote: true, promptBase: false, flowGPT: false, notion: false },
  { feature: "Private by default", closedNote: true, promptBase: false, flowGPT: false, notion: true },
  { feature: "AI prompt refinement (BYO key)", closedNote: true, promptBase: false, flowGPT: false, notion: false },
  { feature: "OCR import from screenshots", closedNote: true, promptBase: false, flowGPT: false, notion: false },
  { feature: "Prompt chaining", closedNote: true, promptBase: false, flowGPT: true, notion: false },
  { feature: "Built specifically for prompts", closedNote: true, promptBase: true, flowGPT: true, notion: false },
];

type DiffSegment = { type: "neutral" | "del" | "ins"; text: string };

const diffVersions: { v: string; date: string; segments: DiffSegment[] }[] = [
  {
    v: "v1",
    date: "Jan 3",
    segments: [
      { type: "neutral", text: "Act as a helpful assistant. Review this code and give me feedback." },
    ],
  },
  {
    v: "v2",
    date: "Jan 4",
    segments: [
      { type: "del", text: "Act as a helpful assistant." },
      { type: "ins", text: " You are a senior software engineer." },
      { type: "neutral", text: " Review this code and " },
      { type: "del", text: "give me feedback." },
      { type: "ins", text: "identify any bugs, security issues, or performance problems. Be specific and actionable." },
    ],
  },
  {
    v: "v3",
    date: "Jan 5",
    segments: [
      { type: "neutral", text: "You are a senior software engineer. Review this code and identify any bugs, security issues, or performance problems. Be specific and actionable." },
      { type: "ins", text: " Format as: 1) Critical 2) Warnings 3) Suggestions." },
    ],
  },
];

// ─── Animated diff demo ────────────────────────────────────────────────────────

function DiffDemo() {
  const [active, setActive] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActive((v) => (v + 1) % diffVersions.length);
        setVisible(true);
      }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const current = diffVersions[active];

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xl">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-500">closedNote, Code Review Prompt</span>
      </div>

      <div className="flex min-h-[180px]">
        {/* Version timeline */}
        <div className="w-20 shrink-0 border-r border-neutral-100 dark:border-neutral-800 p-2.5 space-y-1.5 bg-neutral-50/50 dark:bg-neutral-950/50">
          {diffVersions.map((item, i) => (
            <button
              key={item.v}
              onClick={() => { setVisible(false); setTimeout(() => { setActive(i); setVisible(true); }, 200); }}
              className={`w-full px-2.5 py-2 rounded-md text-xs text-left transition-all duration-200 ${
                i === active
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
            >
              <div className="font-semibold">{item.v}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{item.date}</div>
            </button>
          ))}
        </div>

        {/* Diff content */}
        <div
          className="flex-1 p-5 font-mono text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {current.segments.map((seg, i) =>
            seg.type === "del" ? (
              <span key={i} className="diff-del">{seg.text}</span>
            ) : seg.type === "ins" ? (
              <span key={i} className="diff-ins">{seg.text}</span>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between">
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          Showing diff for {current.v}
        </span>
        <span className="text-xs px-3 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md cursor-default">
          Restore {current.v}
        </span>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MarketingHome() {
  const { prompts } = usePrompts();
  const { user } = useAuth();

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-5xl mx-auto px-4 pb-16">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="text-center pt-6 sm:pt-12 pb-14 sm:pb-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 mb-6 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Version history is live. Free forever.
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.04] mb-5 animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <span className="bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              The Git for your
            </span>
            <br />
            <span className="bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              AI prompts.
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-8 leading-relaxed animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Version every edit. Diff every change. Restore any draft.
            <br className="hidden sm:block" />
            Private by default. Built for engineers who ship.
          </p>

          <div
            className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            {user ? (
              <>
                <Link href="/dashboard" className="px-7 py-3 bg-neutral-900 hover:bg-neutral-700 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors text-sm shadow-sm">
                  Open my prompts
                </Link>
                <Link href="/prompts/new" className="px-7 py-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-full transition-colors text-sm">
                  New prompt
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="px-7 py-3 bg-neutral-900 hover:bg-neutral-700 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-medium rounded-full transition-colors text-sm shadow-sm">
                  Start free, no card needed
                </Link>
                <Link href="/login" className="px-7 py-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-full transition-colors text-sm">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Trust strip */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-400 dark:text-neutral-500 animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            {["Private by default", "BYO API key", "No vendor lock-in", "Free forever"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckIcon />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Live demo ────────────────────────────────────────────────────── */}
        <div className="mb-20 animate-scale-in" style={{ animationDelay: "400ms" }}>
          <DiffDemo />
        </div>

        {/* ── The problem ──────────────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {/* Pain */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-6">
                The problem
              </p>
              {/* Decorative large quote mark */}
              <span className="absolute top-12 right-6 text-[9rem] leading-none font-serif text-neutral-100 dark:text-neutral-800 select-none pointer-events-none" aria-hidden>
                &ldquo;
              </span>
              <blockquote className="relative text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-snug mb-6">
                I had a prompt that worked perfectly. Then I improved it. Now it doesn&apos;t. I can&apos;t get back.
              </blockquote>
              <div className="mt-auto space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                {[
                  ["Notes apps", "don\u2019t track changes"],
                  ["PromptBase", "is built for sharing, not iterating"],
                  ["Nothing", "was made to help you improve prompts"],
                ].map(([tool, flaw]) => (
                  <p key={tool} className="text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{tool}</span> {flaw}.
                  </p>
                ))}
              </div>
            </div>

            {/* Solution */}
            <div className="rounded-xl border border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-white p-8 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-6">
                The solution
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-neutral-900 leading-snug mb-6">
                closedNote remembers every version, so you don&apos;t have to.
              </h2>
              <ul className="mt-auto space-y-3">
                {[
                  "Every save creates a snapshot, automatically",
                  "Visual diff shows exactly what changed",
                  "Restore any version without losing history",
                  "AI refinement to level up your drafts",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-neutral-300 dark:text-neutral-600 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Up and running in 30 seconds.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Save a prompt",
                desc: "Paste or type any prompt. Give it a title and collection. Done in under 10 seconds.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Edit freely",
                desc: "Every time you save an edit, a new version is created automatically. No setup required.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Restore any version",
                desc: "See the diff, pick the version that worked, and restore it in one click. History is preserved.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="landing-card p-6 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-neutral-300 dark:text-neutral-600 tracking-widest">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">{item.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── What makes us different ───────────────────────────────────────── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
              Why closedNote
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Every other tool stores prompts.
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">None of them remember.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "PromptBase / FlowGPT",
                verdict: "Marketplaces, not managers",
                desc: "Built for sharing and discovering prompts publicly. Your prompts are exposed by default, there's no memory of how they evolved, and when something breaks you start from scratch.",
                highlight: false,
              },
              {
                label: "Notion / Notes apps",
                verdict: "Flexible, but completely dumb",
                desc: "Notion doesn't know a prompt from a grocery list. No AI awareness, no version tracking, no refinement. You're just storing text with extra clicks.",
                highlight: false,
              },
              {
                label: "closedNote",
                verdict: "Private. Versioned. Intelligent.",
                desc: "Your prompts stay yours. Every edit is tracked with a visual diff. Iterate with AI refinement, import with OCR, and always know how you got to the version that works.",
                highlight: true,
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-xl p-6 border transition-all duration-200 ${
                  card.highlight
                    ? "border-neutral-900 dark:border-neutral-200 bg-neutral-900 dark:bg-white shadow-lg scale-[1.02]"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${card.highlight ? "text-neutral-500 dark:text-neutral-400" : "text-neutral-400 dark:text-neutral-500"}`}>
                  {card.label}
                </p>
                <p className={`text-base font-semibold mb-3 leading-snug ${card.highlight ? "text-white dark:text-neutral-900" : "text-neutral-900 dark:text-neutral-100"}`}>
                  {card.verdict}
                </p>
                <p className={`text-sm leading-relaxed ${card.highlight ? "text-neutral-400 dark:text-neutral-600" : "text-neutral-500 dark:text-neutral-400"}`}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature deep-dives ────────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
              Everything included
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              One tool. Everything you need.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                badge: "Signature feature",
                badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                title: "Version History",
                desc: "Every edit is tracked. See exactly what changed between drafts with a visual diff, and restore any previous version in one click. Full history is always preserved.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                badge: "BYO key",
                badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                title: "AI Refinement",
                desc: "Paste a rough idea and let AI restructure it into a clean, reusable prompt, using your own API key. Nothing is sent to our servers.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                badge: "Unique",
                badgeColor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
                title: "OCR Import",
                desc: "Photograph a whiteboard, screenshot a chat, or upload any image. closedNote pulls the text and saves it as a prompt automatically.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                badge: null,
                badgeColor: "",
                title: "Prompt Chains",
                desc: "String prompts into multi-step workflows. Output from one step feeds directly into the next, building pipelines without writing code.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="landing-card p-6 group animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0 transition-colors duration-200">
                    {feature.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{feature.title}</h3>
                      {feature.badge && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${feature.badgeColor}`}>
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
              How we stack up
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Built different.
            </h2>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left px-5 py-4 text-neutral-500 dark:text-neutral-400 font-medium w-[45%]">Feature</th>
                  <th className="px-4 py-4 text-center font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800/60">closedNote</th>
                  <th className="px-4 py-4 text-center text-neutral-400 dark:text-neutral-500 font-medium hidden sm:table-cell">PromptBase</th>
                  <th className="px-4 py-4 text-center text-neutral-400 dark:text-neutral-500 font-medium hidden sm:table-cell">FlowGPT</th>
                  <th className="px-4 py-4 text-center text-neutral-400 dark:text-neutral-500 font-medium hidden sm:table-cell">Notion</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-neutral-100 dark:border-neutral-800/60 last:border-0 ${i % 2 !== 0 ? "bg-neutral-50/50 dark:bg-neutral-800/20" : ""}`}
                  >
                    <td className="px-5 py-3.5 text-neutral-700 dark:text-neutral-300">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center bg-neutral-50 dark:bg-neutral-800/60">
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

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-900 dark:border-neutral-200 bg-neutral-900 dark:bg-white p-10 sm:p-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
            Get started
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-neutral-900 mb-4 leading-tight">
            Your prompts deserve a<br />real home.
          </h2>
          <p className="text-neutral-400 dark:text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            Stop losing great drafts to edits you can&apos;t undo. Start building a prompt library that actually remembers.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="px-8 py-3 bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-white text-neutral-900 font-semibold rounded-full transition-colors text-sm shadow-sm"
            >
              {user ? "Go to my prompts" : "Start free, no card needed"}
            </Link>
            {!user && (
              <Link
                href="/docs"
                className="px-8 py-3 border border-neutral-700 dark:border-neutral-300 hover:border-neutral-500 dark:hover:border-neutral-400 text-neutral-400 dark:text-neutral-600 hover:text-neutral-200 dark:hover:text-neutral-800 font-medium rounded-full transition-colors text-sm"
              >
                Read the docs
              </Link>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
