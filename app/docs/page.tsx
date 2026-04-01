import Link from "next/link";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";

export const metadata = {
  title: "Documentation - closedNote",
  description: "Architecture, features, and deployment guide for closedNote.",
};

const toc = [
  { id: "why", label: "Why closedNote?" },
  { id: "version-history", label: "Version History" },
  { id: "architecture", label: "Architecture" },
  { id: "ocr", label: "OCR & AI Refinement" },
  { id: "ai-provider", label: "AI Provider" },
  { id: "database", label: "Database" },
  { id: "security", label: "Security" },
  { id: "deployment", label: "Deployment" },
  { id: "contributing", label: "Contributing" },
];

export default function DocsPage() {
  return (
    <Layout header={<Header />} sidebar={null}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-10 pb-10 border-b border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
            Engineering
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-5 leading-tight tracking-tight">
            How closedNote works
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
            Technical overview of the architecture, features, and design decisions behind closedNote, the only prompt manager that tracks how your prompts evolve.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600 flex items-center justify-center text-white text-sm font-semibold select-none">
              S
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Samuel Aboderin</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Computer Engineering · UNILAG · v1.1</p>
            </div>
          </div>
        </div>

        {/* TOC */}
        <nav className="mb-12 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
            Contents
          </p>
          <ol className="space-y-1.5">
            {toc.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  <span className="w-5 text-right text-xs text-neutral-400 dark:text-neutral-600 font-mono flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                  {item.id === "version-history" && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      new
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-14">

          {/* Why */}
          <section id="why">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Why closedNote?
            </h2>
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>
                PromptBase stores prompts. Notion organizes them. FlowGPT shares them.
                None of them remember how they got there.
              </p>
              <p>
                In real life, prompts evolve. You tweak your &quot;code review prompt&quot; three
                times, and by the fourth iteration you&apos;ve forgotten what made version 2
                actually work. closedNote is built on one thesis:{" "}
                <strong className="text-neutral-900 dark:text-neutral-100">
                  a prompt is not a sticky note, it&apos;s a document with a history.
                </strong>
              </p>
              <p>
                Beyond versioning, closedNote adds structure: prompts organized into collections,
                chained into multi-step workflows, refined by AI, and importable from any image
                via OCR, all private by default, all in one place.
              </p>
            </div>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Version History */}
          <section id="version-history">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Version History
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                new
              </span>
            </div>
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
              <p>
                Every time a user saves an edit to a prompt, closedNote snapshots it
                into a <code className="text-sm font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">prompt_versions</code> table.
                A version history panel on the prompt detail page shows the full timeline.
                Clicking any version renders a live diff against the current content using
                Google&apos;s{" "}
                <code className="text-sm font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">diff-match-patch</code>{" "}
                library, additions in green, removals in red.
              </p>
              <p>
                Restoring a version updates the prompt content without creating a new version
                entry, preserving the history chain exactly as it was. A new version is only
                created when the user edits and saves content that differs from the last saved state.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Behaviour</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Creates new version?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {[
                    ["Save with changed content or title", "Yes"],
                    ["Save with no changes", "No"],
                    ["Restore a previous version", "No"],
                    ["Edit after restore, content differs", "Yes"],
                  ].map(([behaviour, creates]) => (
                    <tr key={behaviour} className="bg-white dark:bg-transparent">
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{behaviour}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className={creates === "Yes"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-neutral-400 dark:text-neutral-500"}>
                          {creates}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Key files</p>
              <ul className="space-y-2 text-sm font-mono">
                <li><span className="text-amber-400">supabase/migrations/004_prompt_versions.sql</span><span className="text-neutral-500 ml-2">- table + RLS policies</span></li>
                <li><span className="text-amber-400">lib/promptData.ts</span><span className="text-neutral-500 ml-2">- savePrompt() with skipVersion flag</span></li>
                <li><span className="text-amber-400">app/api/prompts/[id]/versions/route.ts</span><span className="text-neutral-500 ml-2">- authenticated GET endpoint</span></li>
                <li><span className="text-amber-400">components/VersionHistory.tsx</span><span className="text-neutral-500 ml-2">- timeline + diff UI</span></li>
              </ul>
            </div>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Architecture */}
          <section id="architecture">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Architecture
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
              closedNote is a Next.js 14 App Router application with a Supabase backend.
              Almost all pages are client components; only the docs page is server-rendered.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">Frontend</p>
                <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <li><span className="font-medium">Next.js 14</span>, App Router, RSC</li>
                  <li><span className="font-medium">React 18</span>, hooks, client components</li>
                  <li><span className="font-medium">Tailwind CSS 3.4</span>, utility-first styling</li>
                  <li><span className="font-medium">TypeScript 5.5</span>, full type safety</li>
                  <li><span className="font-medium">diff-match-patch</span>, version diff engine</li>
                </ul>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">Backend</p>
                <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <li><span className="font-medium">Supabase</span>, PostgreSQL + Auth</li>
                  <li><span className="font-medium">PKCE flow</span>, secure auth</li>
                  <li><span className="font-medium">Row Level Security</span>, per-user isolation</li>
                  <li><span className="font-medium">Vercel</span>, edge deployment</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Key files</p>
              <ul className="space-y-2 text-sm font-mono">
                <li><span className="text-amber-400">lib/hooks/usePrompts.ts</span><span className="text-neutral-500 ml-2">- data fetching hook</span></li>
                <li><span className="text-amber-400">lib/promptData.ts</span><span className="text-neutral-500 ml-2">- prompt CRUD + versioning</span></li>
                <li><span className="text-amber-400">lib/chainData.ts</span><span className="text-neutral-500 ml-2">- chain CRUD</span></li>
                <li><span className="text-amber-400">components/AuthProvider.tsx</span><span className="text-neutral-500 ml-2">- auth context</span></li>
                <li><span className="text-amber-400">components/VersionHistory.tsx</span><span className="text-neutral-500 ml-2">- version timeline + diff</span></li>
                <li><span className="text-amber-400">app/api/chat/route.ts</span><span className="text-neutral-500 ml-2">- AI refinement proxy</span></li>
                <li><span className="text-amber-400">app/api/ocr/route.ts</span><span className="text-neutral-500 ml-2">- OCR endpoint</span></li>
                <li><span className="text-amber-400">app/api/prompts/[id]/versions/route.ts</span><span className="text-neutral-500 ml-2">- version history endpoint</span></li>
              </ul>
            </div>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* OCR */}
          <section id="ocr">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              OCR & AI Refinement
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
              Upload a screenshot, photo, or scan, and GPT-4o Vision pulls out the text.
              The refinement step cleans it up into something reusable.
              Tesseract.js kicks in as a fallback when you&apos;re offline.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Online (GPT-4o Vision)</p>
                <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <li>Printed &amp; handwritten text</li>
                  <li>High accuracy on complex layouts</li>
                  <li>Requires an OpenAI API key</li>
                </ul>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Offline (Tesseract.js)</p>
                <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <li>Runs entirely in the browser</li>
                  <li>No API key required</li>
                  <li>Works offline and on flights</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              The app attempts the online route first and silently falls back to Tesseract
              if the API is unavailable or unconfigured.
            </p>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* AI Provider */}
          <section id="ai-provider">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              AI Provider
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Chain runs and chat refinement use HuggingFace&apos;s Zephyr-7B by default,
              free, no billing required. If you add your own OpenAI key in{" "}
              <Link href="/settings" className="underline underline-offset-2 text-neutral-900 dark:text-neutral-100 hover:opacity-70 transition-opacity">
                Settings
              </Link>
              , it takes priority and unlocks GPT-4o Mini for all AI features.
            </p>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 p-5 text-sm font-mono">
              <p className="text-neutral-500 mb-2"># .env.local</p>
              <p><span className="text-amber-400">NEXT_PUBLIC_SUPABASE_URL</span><span className="text-neutral-300">=https://xxx.supabase.co</span><span className="text-neutral-600 ml-4"># required</span></p>
              <p><span className="text-amber-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span><span className="text-neutral-300">=eyJ...</span><span className="text-neutral-600 ml-4"># required</span></p>
              <p className="mt-2"><span className="text-amber-400">OPENAI_API_KEY</span><span className="text-neutral-300">=sk-...</span><span className="text-neutral-600 ml-4"># optional, enables GPT-4o OCR + AI</span></p>
              <p><span className="text-amber-400">HUGGINGFACE_API_KEY</span><span className="text-neutral-300">=hf_...</span><span className="text-neutral-600 ml-4"># optional, free AI fallback</span></p>
            </div>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Database */}
          <section id="database">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Database
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5">
              Six tables in PostgreSQL via Supabase. All have RLS enabled, every
              query is automatically scoped to the authenticated user.
            </p>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300 font-mono">Table</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {[
                    ["users", "Auth profile, synced from Supabase Auth on signup"],
                    ["prompts", "Title, content, model, collection, user_id"],
                    ["prompt_versions", "Versioned snapshots of each prompt, powers the diff view"],
                    ["tags", "Many-to-many; cascade-deletes with prompt"],
                    ["prompt_chains", "Titled sequences of steps, owned by user"],
                    ["chain_steps", "Ordered steps with content and output variables"],
                  ].map(([table, desc]) => (
                    <tr key={table} className="bg-white dark:bg-transparent">
                      <td className="px-4 py-3 font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {table}
                        {table === "prompt_versions" && (
                          <span className="ml-2 text-[10px] font-bold px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide align-middle">
                            new
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Security */}
          <section id="security">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Security
            </h2>
            <ul className="space-y-4">
              {[
                ["Row Level Security", "All tables enforce RLS. Every query is automatically filtered to the authenticated user's data at the database level, including prompt_versions."],
                ["PKCE Auth Flow", "Supabase Auth uses PKCE (Proof Key for Code Exchange). Sessions are stored ephemerally, cleared when the browser closes."],
                ["API key privacy", "User-supplied OpenAI keys are stored only in localStorage and passed per-request. They are never persisted server-side."],
                ["Authenticated API routes", "The /api/prompts/[id]/versions endpoint validates the user's JWT before any query. No RLS bypass is possible."],
                ["HTTPS", "All traffic is encrypted in transit. Enforced by Vercel on production."],
              ].map(([title, desc]) => (
                <li key={title as string} className="flex gap-4">
                  <div className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Deployment */}
          <section id="deployment">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Deployment
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5">
              Optimised for Vercel, but runs on any platform that supports Next.js 14.
            </p>
            <ol className="space-y-4">
              {[
                ["Fork the repo", "Clone or fork from GitHub: github.com/aboderinsamuel/closedNote"],
                ["Create a Supabase project", "Run all four migration files in order from supabase/migrations/ via the Supabase SQL Editor. The fourth migration (004_prompt_versions.sql) creates the version history table."],
                ["Set environment variables", "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Optionally add OPENAI_API_KEY for GPT-4o OCR."],
                ["Deploy to Vercel", "Connect the repo, add the env vars, and deploy. Update your Supabase Auth redirect URLs to match your production domain."],
              ].map(([title, desc], i) => (
                <li key={title as string} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Contributing */}
          <section id="contributing">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Contributing
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5">
              closedNote is open source. Whether you&apos;re fixing a typo or building
              a feature, contributions are welcome.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                "AI-powered tag suggestions",
                "Team sharing & collaboration",
                "Export to PDF / Markdown",
                "Browser extension",
                "Pagination & infinite scroll",
                "Prompt templates with variables",
              ].map((idea) => (
                <div key={idea} className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 flex-shrink-0" />
                  {idea}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://github.com/aboderinsamuel/closedNote"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </Link>
              <Link
                href="https://www.linkedin.com/in/samuelaboderin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Contact
              </Link>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Built by{" "}
              <Link href="https://github.com/aboderinsamuel" className="text-neutral-700 dark:text-neutral-300 hover:underline">
                Samuel Aboderin
              </Link>
              {" "}· Computer Engineering · UNILAG
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Home</Link>
              <Link href="/prompts/new" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">New Prompt</Link>
              <Link href="/ocr" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">OCR</Link>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
