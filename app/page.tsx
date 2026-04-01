"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { useEffect, useState, useRef } from "react";

// Theme-aware CSS variable refs
const T = {
  bg:      "var(--cn-bg)",
  bgS1:    "var(--cn-bg-s1)",
  bgS2:    "var(--cn-bg-s2)",
  bgS3:    "var(--cn-bg-s3)",
  bgCard:  "var(--cn-bg-card)",
  text:    "var(--cn-text)",
  text2:   "var(--cn-text2)",
  muted:   "var(--cn-muted)",
  dim:     "var(--cn-dim)",
  border:  "var(--cn-border)",
  borderS: "var(--cn-border-s)",
  borderD: "var(--cn-border-d)",
  btnBg:   "var(--cn-btn-bg)",
  btnTx:   "var(--cn-btn-tx)",
  accent:  "var(--cn-accent)",
  badgeBg: "var(--cn-badge-bg)",
} as const;

// Editor/syntax constants (always dark regardless of theme)
const E = {
  bg:     "#2e1f1f",
  border: "#4e4b47",
  muted:  "#848185",
  dim:    "#525053",
  text2:  "#BAB6C0",
  purple: "#948AE3",
  pink:   "#FC618D",
  green:  "#7BD88F",
  cyan:   "#5AD4E6",
  yellow: "#F8E67A",
  orange: "#FD9353",
} as const;


type DiffSegment = { type: "neutral" | "del" | "ins"; text: string };
type CodeToken   = { text: string; color?: string };
type CodeLine    = CodeToken[];


const diffVersions: { v: string; date: string; segments: DiffSegment[] }[] = [
  {
    v: "v1", date: "Jan 3",
    segments: [
      { type: "neutral", text: "Act as a helpful assistant. Review this code and give me feedback." },
    ],
  },
  {
    v: "v2", date: "Jan 4",
    segments: [
      { type: "del",     text: "Act as a helpful assistant." },
      { type: "ins",     text: " You are a senior software engineer." },
      { type: "neutral", text: " Review this code and " },
      { type: "del",     text: "give me feedback." },
      { type: "ins",     text: "identify bugs, security issues, and performance problems. Be specific." },
    ],
  },
  {
    v: "v3", date: "Jan 5",
    segments: [
      { type: "neutral", text: "You are a senior software engineer. Review this code and identify bugs, security issues, and performance problems. Be specific." },
      { type: "ins",     text: " Format: 1) Critical 2) Warnings 3) Suggestions." },
    ],
  },
];


const row1 = [
  { name: "Alex Chen",     handle: "@alexchen_dev",  avatar: "AC", quote: "closedNote is what I didn't know I needed. My prompt library is organized and I can see exactly how my prompts evolved over time." },
  { name: "Sarah Kim",     handle: "@sarahkim_ai",   avatar: "SK", quote: "Version history is a game changer. I used to lose great prompts when experimenting. Never again with closedNote." },
  { name: "Marcus Rivera", handle: "@mrivera_llm",   avatar: "MR", quote: "Being able to diff two versions of a prompt is pure gold. I can see exactly what single change improved my results." },
  { name: "Jamie Lee",     handle: "@jamielee_eng",  avatar: "JL", quote: "The AI refinement feature is incredible. Give it a rough idea, get back a structured reusable prompt in seconds." },
];
const row2 = [
  { name: "Taylor Osei",   handle: "@tayloro_ml",    avatar: "TO", quote: "Private by default was the thing that sold me. My prompts are IP. I needed them off public marketplaces." },
  { name: "Priya Nair",    handle: "@priyanair_dev", avatar: "PN", quote: "The OCR import is wild. I photograph my whiteboard and it instantly becomes a saved, versioned prompt." },
  { name: "Jordan Walsh",  handle: "@jordanw_ai",    avatar: "JW", quote: "Switched from Notion for prompts to closedNote. The diff view makes iteration so much faster." },
  { name: "Casey Pham",    handle: "@caseypham_llm", avatar: "CP", quote: "Prompt chains are exactly what I needed for multi-step pipelines. No more copy-pasting between steps." },
];


const comparison = [
  { feature: "Version history + diff view",    cn: true,  pb: false, fg: false, notion: false },
  { feature: "Private by default",             cn: true,  pb: false, fg: false, notion: true  },
  { feature: "AI refinement (BYO key)",        cn: true,  pb: false, fg: false, notion: false },
  { feature: "OCR import from screenshots",    cn: true,  pb: false, fg: false, notion: false },
  { feature: "Prompt chaining",                cn: true,  pb: false, fg: true,  notion: false },
  { feature: "Built for prompt iteration",     cn: true,  pb: false, fg: false, notion: false },
];


const aiCode: CodeLine[] = [
  [{ text: "// Refine a rough idea into a clean prompt", color: E.dim }],
  [],
  [{ text: "const ", color: E.pink }, { text: "refined", color: E.cyan }, { text: " = await ", color: E.text2 }, { text: "closedNote", color: E.green }, { text: ".refine({", color: E.text2 }],
  [{ text: "  apiKey", color: E.cyan },    { text: ": process.env.", color: E.text2 }, { text: "OPENAI_API_KEY", color: E.yellow }, { text: ",", color: E.text2 }],
  [{ text: "  input", color: E.cyan },     { text: ': "', color: E.text2 }, { text: "you are a helpful code reviewer", color: E.yellow }, { text: '",', color: E.text2 }],
  [{ text: "  model", color: E.cyan },     { text: ': "', color: E.text2 }, { text: "gpt-4o", color: E.yellow }, { text: '",', color: E.text2 }],
  [{ text: "})", color: E.text2 }],
  [],
  [{ text: "// → Structured, role-based prompt created",   color: E.dim }],
  [{ text: "// → Saved as a new version automatically",    color: E.dim }],
  [{ text: 'console.', color: E.green }, { text: "log", color: E.cyan }, { text: "(refined.", color: E.text2 }, { text: "content", color: E.orange }, { text: ")", color: E.text2 }],
  [{ text: '// "You are a senior software engineer who…"', color: E.dim }],
];

const ocrCode: CodeLine[] = [
  [{ text: "// Import any image, whiteboard, screenshot, or chat", color: E.dim }],
  [],
  [{ text: "const ", color: E.pink }, { text: "result", color: E.cyan }, { text: " = await ", color: E.text2 }, { text: "closedNote", color: E.green }, { text: ".ocr({", color: E.text2 }],
  [{ text: "  image", color: E.cyan },      { text: ": ", color: E.text2 }, { text: "uploadedFile", color: E.orange }, { text: ",  // PNG / JPG / WEBP", color: E.dim }],
  [{ text: "  autoSave", color: E.cyan },   { text: ": ", color: E.text2 }, { text: "true", color: E.purple }, { text: ",", color: E.text2 }],
  [{ text: "  collection", color: E.cyan }, { text: ': "', color: E.text2 }, { text: "from-screenshots", color: E.yellow }, { text: '",', color: E.text2 }],
  [{ text: "})", color: E.text2 }],
  [],
  [{ text: "// Text extracted and versioned instantly", color: E.dim }],
  [{ text: 'console.', color: E.green }, { text: "log", color: E.cyan }, { text: "(result.", color: E.text2 }, { text: "promptId", color: E.orange }, { text: ")", color: E.text2 }],
  [{ text: "// pmt_8f3a9c2e1b47d", color: E.dim }],
];


function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => setShown(true);

    // Show immediately if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) { show(); return; }

    // Fallback: reveal after 300 ms in case observer never fires
    const timer = setTimeout(show, 300);

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { show(); obs.disconnect(); clearTimeout(timer); } },
      { threshold: 0, rootMargin: "0px 0px 100px 0px" }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:   shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.65s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.65s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
      }}
    >
      {children}
    </div>
  );
}


function DiffDemo() {
  const [active, setActive] = useState(1);
  const [vis, setVis]       = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVis(false);
      setTimeout(() => { setActive(v => (v + 1) % diffVersions.length); setVis(true); }, 280);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  const cur = diffVersions[active];

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${E.border}`, background: E.bg, boxShadow: "0 20px 60px rgba(0,0,0,0.45)", fontFamily: "ui-monospace,'Cascadia Code','Fira Code',monospace" }}>
      {/* Chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: `1px solid ${E.border}`, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: E.muted }}>Code Review Expert.txt</span>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${E.border}`, background: "rgba(0,0,0,0.1)" }}>
        {diffVersions.map((item, i) => (
          <button key={item.v}
            onClick={() => { setVis(false); setTimeout(() => { setActive(i); setVis(true); }, 220); }}
            style={{
              padding: "7px 16px", fontSize: 12,
              fontWeight: i === active ? 600 : 400,
              color: i === active ? "#F7F1FF" : E.muted,
              background: i === active ? "rgba(148,138,227,0.14)" : "transparent",
              borderBottom: i === active ? `2px solid ${E.purple}` : "2px solid transparent",
              border: "none", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            {item.v} <span style={{ color: E.dim, fontWeight: 400 }}>· {item.date}</span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ padding: "20px", minHeight: 130, fontSize: 13.5, lineHeight: 1.75, transition: "opacity 0.28s", opacity: vis ? 1 : 0 }}>
        {cur.segments.map((seg, i) =>
          seg.type === "del" ? (
            <span key={i} style={{ background: "rgba(252,97,141,0.16)", color: E.pink, textDecoration: "line-through", padding: "1px 3px", borderRadius: 3 }}>{seg.text}</span>
          ) : seg.type === "ins" ? (
            <span key={i} style={{ background: "rgba(123,216,143,0.15)", color: E.green, padding: "1px 3px", borderRadius: 3 }}>{seg.text}</span>
          ) : (
            <span key={i} style={{ color: E.text2 }}>{seg.text}</span>
          )
        )}
      </div>
      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderTop: `1px solid ${E.border}`, background: "rgba(0,0,0,0.15)" }}>
        <span style={{ fontSize: 11, color: E.dim }}>Showing diff · {cur.v}</span>
        <button style={{ padding: "4px 12px", background: E.purple, color: "#F7F1FF", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Restore {cur.v}
        </button>
      </div>
    </div>
  );
}


function SyntaxBlock({ title, lines }: { title: string; lines: CodeLine[] }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${E.border}`, background: E.bg, boxShadow: "0 20px 60px rgba(0,0,0,0.45)", fontFamily: "ui-monospace,'Cascadia Code','Fira Code',monospace" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: `1px solid ${E.border}`, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: E.muted }}>{title}</span>
      </div>
      <div style={{ padding: "20px", fontSize: 13, lineHeight: 1.75 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ minHeight: "1.75em" }}>
            {line.map((tok, j) => <span key={j} style={{ color: tok.color ?? E.text2 }}>{tok.text}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}


function TestiCard({ name, handle, avatar, quote }: { name: string; handle: string; avatar: string; quote: string }) {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", width: 308, flexShrink: 0, boxShadow: "0 14px 24px rgba(5,5,5,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${E.purple}, ${E.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {avatar}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{name}</div>
          <div style={{ fontSize: 12, color: T.muted }}>{handle}</div>
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: T.text2, margin: 0 }}>&ldquo;{quote}&rdquo;</p>
    </div>
  );
}


function Marquee({ items, reverse = false }: { items: typeof row1; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div
        className={reverse ? "animate-marquee-reverse" : "animate-marquee"}
        style={{ display: "flex", gap: 14, width: "max-content" }}
      >
        {doubled.map((t, i) => <TestiCard key={i} {...t} />)}
      </div>
    </div>
  );
}


function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 18, height: 1.5, background: T.accent, display: "inline-block", borderRadius: 2 }} />
      {children}
    </div>
  );
}


const Check = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={E.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>;
const X     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={E.dim}  strokeWidth={2}   strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;


function Footer() {
  const cols = [
    { title: "Product",    links: [{ l: "Version History", h: "/#features" }, { l: "AI Refinement", h: "/#features" }, { l: "OCR Import", h: "/ocr" }, { l: "Prompt Chains", h: "/chains" }, { l: "Dashboard", h: "/dashboard" }] },
    { title: "Developers", links: [{ l: "Docs", h: "/docs" }, { l: "New Prompt", h: "/prompts/new" }, { l: "Collections", h: "/dashboard" }, { l: "Settings", h: "/settings" }] },
    { title: "Compare",    links: [{ l: "vs PromptBase", h: "/#compare" }, { l: "vs FlowGPT", h: "/#compare" }, { l: "vs Notion", h: "/#compare" }] },
    { title: "Company",    links: [{ l: "About", h: "#" }, { l: "Privacy", h: "#" }, { l: "Terms", h: "#" }, { l: "Contact", h: "#" }] },
  ];
  return (
    <footer className="cn-section" style={{ background: T.bg, paddingTop: 64, paddingBottom: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontWeight: 900, fontSize: 20, color: T.text, letterSpacing: "-0.025em", marginBottom: 8 }}>
            closed<span style={{ color: T.accent }}>Note</span>
          </div>
          <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>The prompt manager that remembers every version.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>{col.title}</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(link => (
                  <li key={link.l}>
                    <Link href={link.h} style={{ fontSize: 14, color: T.muted, textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = T.text)}
                      onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                    >{link.l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${T.borderS}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, color: T.dim }}>©2026 closedNote. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Twitter / X", "GitHub"].map(s => (
              <a key={s} href="#" style={{ fontSize: 13, color: T.dim, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = T.text)}
                onMouseLeave={e => (e.currentTarget.style.color = T.dim)}
              >{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


function PixelRow() {
  return (
    <div style={{ background: T.bgS3, borderTop: `1px solid ${T.borderS}`, borderBottom: `1px solid ${T.borderS}`, padding: "28px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="2" y="6" width="40" height="32" rx="4" fill={T.bgCard} stroke={T.border} strokeWidth="2"/><rect x="8" y="14" width="4" height="4" fill={E.pink}/><rect x="12" y="14" width="4" height="4" fill={E.pink}/><rect x="8" y="18" width="4" height="4" fill={E.yellow}/><rect x="12" y="18" width="8" height="4" fill={E.yellow}/><rect x="8" y="22" width="20" height="4" fill={E.green}/><rect x="20" y="14" width="6" height="4" fill={E.cyan}/></svg>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="4" width="28" height="4" fill={E.purple}/><rect x="4" y="8" width="4" height="28" fill={E.purple}/><rect x="36" y="8" width="4" height="28" fill={E.purple}/><rect x="8" y="36" width="28" height="4" fill={E.purple}/><rect x="12" y="14" width="4" height="12" fill={E.cyan}/><rect x="12" y="22" width="10" height="4" fill={E.cyan}/></svg>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="8" width="28" height="4" fill={E.pink}/><rect x="4" y="12" width="8" height="20" fill={E.pink}/><rect x="32" y="12" width="8" height="20" fill={E.pink}/><rect x="8" y="32" width="28" height="4" fill={E.pink}/><rect x="12" y="18" width="20" height="8" fill={T.bgCard}/><rect x="16" y="20" width="4" height="4" fill={E.yellow}/><rect x="24" y="20" width="4" height="4" fill={E.yellow}/></svg>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="4" y="17" width="16" height="10" rx="5" stroke={E.orange} strokeWidth="3" fill="none"/><rect x="24" y="17" width="16" height="10" rx="5" stroke={E.orange} strokeWidth="3" fill="none"/><rect x="18" y="20" width="8" height="4" fill={E.orange}/></svg>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="4" y="12" width="36" height="26" rx="4" fill={T.bgCard} stroke={T.border} strokeWidth="2"/><rect x="16" y="7" width="12" height="5" rx="2.5" fill={T.border}/><circle cx="22" cy="25" r="8" stroke={E.cyan} strokeWidth="2.5" fill="none"/><circle cx="22" cy="25" r="3.5" fill={E.cyan}/></svg>
    </div>
  );
}


function PrimaryBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", background: T.btnBg, color: T.btnTx, borderRadius: 99, fontWeight: 700, fontSize: 15, textDecoration: "none", transition: "opacity 0.15s", fontFamily: "inherit" }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >{children}</Link>
  );
}

function OutlineBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 99, fontWeight: 500, fontSize: 15, textDecoration: "none", background: "transparent", transition: "color 0.15s, border-color 0.15s", fontFamily: "inherit" }}
      onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.muted; }}
      onMouseLeave={e => { e.currentTarget.style.color = T.text2; e.currentTarget.style.borderColor = T.border; }}
    >{children}</Link>
  );
}


function QuickStart() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", background: T.bgS2, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, fontFamily: "ui-monospace,'Cascadia Code',monospace" }}>
      <span style={{ color: T.muted }}>→</span>
      <span><span style={{ color: E.green }}>closednote</span><span style={{ color: T.muted }}>.app/</span><span style={{ color: E.cyan }}>signup</span></span>
      <span style={{ color: T.dim, fontSize: 11 }}>{`// free, no card needed`}</span>
    </div>
  );
}


export default function MarketingHome() {
  const { user } = useAuth();

  const learnMore: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 14, fontWeight: 600, color: T.accent, textDecoration: "none", transition: "gap 0.15s",
  };

  return (
    <div
      style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Inter',system-ui,-apple-system,sans-serif", overflowX: "hidden", transition: "background 0.3s, color 0.3s" }}
    >
      <Header />

      {/* hero */}
      <section style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 72px", background: T.bg }}>

        <div className="animate-fade-up" style={{ animationDelay: "0ms",
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", border: `1px solid ${T.borderS}`, borderRadius: 99,
          fontSize: 13, color: T.muted, background: T.badgeBg, marginBottom: 36,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: E.green, display: "inline-block", boxShadow: `0 0 8px ${E.green}` }} />
          Version history is live · Free forever
        </div>

        <h1 className="animate-fade-up" style={{ animationDelay: "100ms",
          fontSize: "clamp(36px, 6.5vw, 62px)", fontWeight: 900, color: T.text,
          letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: 820, margin: "0 0 24px",
        }}>
          The prompt manager that<br />keeps your AI on track.
        </h1>

        <p className="animate-fade-up" style={{ animationDelay: "200ms",
          fontSize: 18, color: T.text2, maxWidth: 500, lineHeight: 1.65, margin: "0 0 36px",
        }}>
          Save every version of your AI prompts. See what changed. Go back to any draft.
          <br />Your prompts stay private, only you can see them.
        </p>

        <div className="animate-fade-up" style={{ animationDelay: "300ms", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 40 }}>
          <PrimaryBtn href={user ? "/dashboard" : "/signup"}>
            {user ? "Open my prompts" : "Start building free"}
          </PrimaryBtn>
          {!user && <OutlineBtn href="/docs">Read the docs →</OutlineBtn>}
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "400ms", marginBottom: 60 }}>
          <QuickStart />
        </div>

        <div className="animate-scale-in w-full max-w-[720px]" style={{ animationDelay: "500ms" }}>
          <DiffDemo />
        </div>
      </section>

      <section id="features" className="cn-section" style={{ background: T.bgS1 }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal>
            <Label>Version History</Label>
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 900, color: T.text, letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 20px" }}>
              Every edit,<br />remembered.
            </h2>
            <p style={{ fontSize: 17, color: T.text2, lineHeight: 1.72, margin: "0 0 16px" }}>
              Every time you save, closedNote creates a new snapshot automatically, no setup, no config. See exactly what changed between versions.
            </p>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.72, margin: "0 0 32px" }}>
              Never lose a great draft to an experiment that didn&apos;t pan out. Your entire revision history is preserved forever.
            </p>
            <a href="/docs" style={learnMore}
              onMouseEnter={e => (e.currentTarget.style.gap = "10px")}
              onMouseLeave={e => (e.currentTarget.style.gap = "6px")}
            >Learn more →</a>
          </Reveal>
          <Reveal delay={100}><DiffDemo /></Reveal>
        </div>
      </section>

      <section className="cn-section" style={{ background: T.bgS2 }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal delay={100} className="order-2 md:order-1">
            <SyntaxBlock title="closedNote/refine.ts" lines={aiCode} />
          </Reveal>
          <Reveal className="order-1 md:order-2">
            <Label>AI Refinement</Label>
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 900, color: T.text, letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 20px" }}>
              AI refinement,<br />built right in.
            </h2>
            <p style={{ fontSize: 17, color: T.text2, lineHeight: 1.72, margin: "0 0 16px" }}>
              Turn a rough idea into a clean, structured, reusable prompt. Use your own OpenAI API key, nothing passes through our servers.
            </p>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.72, margin: "0 0 32px" }}>
              The refined output is automatically saved as a new version, so your full refinement journey stays traceable and reversible.
            </p>
            <a href="/docs" style={learnMore}>Learn more →</a>
          </Reveal>
        </div>
      </section>

      <section className="cn-section" style={{ background: T.bgS3 }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal>
            <Label>OCR Import</Label>
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 900, color: T.text, letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 20px" }}>
              Import from<br />anywhere.
            </h2>
            <p style={{ fontSize: 17, color: T.text2, lineHeight: 1.72, margin: "0 0 16px" }}>
              Photograph a whiteboard, screenshot a conversation, or upload any image. closedNote extracts the text and saves it as a versioned prompt, automatically.
            </p>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.72, margin: "0 0 32px" }}>
              Supports PNG, JPG, and WEBP. Works on handwriting, printed text, and everything in between.
            </p>
            <Link href="/ocr" style={learnMore}>Try OCR import →</Link>
          </Reveal>
          <Reveal delay={100}><SyntaxBlock title="closedNote/ocr.ts" lines={ocrCode} /></Reveal>
        </div>
      </section>

      <section className="cn-section" style={{ background: T.bgS1, textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, color: T.text, letterSpacing: "-0.025em", margin: "0 0 20px" }}>
              People who use AI love closedNote
            </h2>
            <p style={{ fontSize: 18, color: T.text2, lineHeight: 1.7, margin: "0 0 48px" }}>
              Every prompt you write is saved with its full history. You can always see what changed, go back to any version, and never lose something that was working.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
              {[
                { label: "Version History",  desc: "Every time you save, closedNote keeps a copy. Click any older version to bring it back.",    color: E.purple },
                { label: "AI Refinement",   desc: "Type a rough idea and let AI turn it into a clean, ready-to-use prompt. Uses your own API key.", color: E.cyan   },
                { label: "Prompt Chains",   desc: "Link prompts together in order, like steps in a recipe. The output of one feeds into the next.", color: E.orange },
              ].map(f => (
                <div key={f.label} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 18px" }}>
                  <div style={{ width: 32, height: 3, background: f.color, borderRadius: 2, marginBottom: 12 }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <PrimaryBtn href={user ? "/dashboard" : "/signup"}>Start building free</PrimaryBtn>
          </div>
        </Reveal>
      </section>

      <section className="cn-section marquee-wrap" style={{ background: T.bgS2, padding: "80px 0", borderTop: `1px solid ${T.borderS}` }}>
        <Reveal>
          <div style={{ textAlign: "center", padding: "0 24px", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, color: T.text, letterSpacing: "-0.025em", margin: "0 0 12px" }}>
              Loved even by grandmas
            </h2>
            <p style={{ fontSize: 17, color: T.text2, margin: 0 }}>
              What people building with AI are saying about closedNote.
            </p>
          </div>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
          <Marquee items={row1} />
          <Marquee items={row2} reverse />
        </div>
      </section>

      <section id="compare" className="cn-section" style={{ background: T.bgS3 }}>
        <Reveal>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Label>How we stack up</Label>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, color: T.text, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
                Built different.
              </h2>
              <p style={{ fontSize: 17, color: T.text2, maxWidth: 500, margin: "0 auto" }}>
                closedNote is the only tool designed from the ground up for prompt iteration.
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}` }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ textAlign: "left", padding: "16px 20px", color: T.muted, fontWeight: 500, background: T.bgCard, fontFamily: "inherit", minWidth: 200 }}>Feature</th>
                    <th style={{ padding: "16px 20px", textAlign: "center", color: T.text,  fontWeight: 700, background: T.bgCard, fontFamily: "inherit" }}>closedNote</th>
                    <th style={{ padding: "16px 20px", textAlign: "center", color: T.muted, fontWeight: 500, background: T.bgCard, fontFamily: "inherit" }}>PromptBase</th>
                    <th style={{ padding: "16px 20px", textAlign: "center", color: T.muted, fontWeight: 500, background: T.bgCard, fontFamily: "inherit" }}>FlowGPT</th>
                    <th style={{ padding: "16px 20px", textAlign: "center", color: T.muted, fontWeight: 500, background: T.bgCard, fontFamily: "inherit" }}>Notion</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={row.feature} style={{ borderBottom: i < comparison.length - 1 ? `1px solid ${T.borderD}` : "none" }}>
                      <td style={{ padding: "13px 20px", color: T.text2, background: T.bgCard, fontFamily: "inherit" }}>{row.feature}</td>
                      <td style={{ padding: "13px 20px", textAlign: "center", background: T.bgCard }}><span style={{ display: "flex", justifyContent: "center" }}>{row.cn     ? <Check /> : <X />}</span></td>
                      <td style={{ padding: "13px 20px", textAlign: "center", background: T.bgCard }}><span style={{ display: "flex", justifyContent: "center" }}>{row.pb     ? <Check /> : <X />}</span></td>
                      <td style={{ padding: "13px 20px", textAlign: "center", background: T.bgCard }}><span style={{ display: "flex", justifyContent: "center" }}>{row.fg     ? <Check /> : <X />}</span></td>
                      <td style={{ padding: "13px 20px", textAlign: "center", background: T.bgCard }}><span style={{ display: "flex", justifyContent: "center" }}>{row.notion ? <Check /> : <X />}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="cn-section" style={{ background: T.bgS1, textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 20px" }}>
              Get up and running<br />in under a minute.
            </h2>
            <p style={{ fontSize: 18, color: T.text2, lineHeight: 1.65, margin: "0 0 40px" }}>
              Stop losing great drafts to experiments you can&apos;t undo.
              Start building a prompt library that actually remembers.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              <PrimaryBtn href={user ? "/dashboard" : "/signup"}>
                {user ? "Go to my prompts" : "Start free, no card needed"}
              </PrimaryBtn>
              {!user && <OutlineBtn href="/docs">Read the docs</OutlineBtn>}
            </div>

            <QuickStart />
          </div>
        </Reveal>
      </section>

      <PixelRow />

      <Footer />
    </div>
  );
}
