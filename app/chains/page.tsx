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
    if (!authLoading && !user) router.push("/login");
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

  if (authLoading || !user) return null;

  return (
    <Layout header={<Header />} sidebar={null}>
      <div className="animate-fade-up max-w-4xl mx-auto">

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 20, height: 2, background: "var(--cn-accent)", borderRadius: 2, display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cn-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Threads</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em", marginBottom: 6 }}>
              Prompt Threads
            </h1>
            <p style={{ fontSize: 14, color: "var(--cn-muted)" }}>
              String prompts together and run them in sequence.
            </p>
          </div>
          <Link
            href="/chains/new"
            style={{
              display: "inline-flex", alignItems: "center", padding: "9px 20px",
              background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
              borderRadius: 99, fontWeight: 600, fontSize: 13, textDecoration: "none", transition: "opacity 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            + New Thread
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 13, color: "#ef4444", marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse" style={{ height: 88, borderRadius: 12, background: "var(--cn-bg-s2)" }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && chains.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "64px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg fill="none" stroke="var(--cn-muted)" viewBox="0 0 24 24" style={{ width: 28, height: 28 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--cn-text)", marginBottom: 8, letterSpacing: "-0.01em" }}>No threads yet</h2>
            <p style={{ fontSize: 13, color: "var(--cn-muted)", lineHeight: 1.6, maxWidth: 320, marginBottom: 24 }}>
              Create a thread to chain prompts and run them one by one.
            </p>
            <Link
              href="/chains/new"
              style={{
                display: "inline-flex", alignItems: "center", padding: "9px 20px",
                background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
                borderRadius: 99, fontWeight: 600, fontSize: 13, textDecoration: "none", transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Create your first thread
            </Link>
          </div>
        )}

        {/* Chain cards */}
        {!loading && chains.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {chains.map((chain) => (
              <Link
                key={chain.id}
                href={`/chains/${chain.id}`}
                style={{
                  display: "block", textDecoration: "none",
                  background: "var(--cn-bg-card)", border: "1px solid var(--cn-border)",
                  borderRadius: 12, padding: "18px 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cn-accent)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cn-border)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--cn-text)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>
                    {chain.title}
                  </h3>
                  <span style={{
                    flexShrink: 0, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                    background: "var(--cn-bg-s2)", color: "var(--cn-muted)",
                    border: "1px solid var(--cn-border-s)",
                  }}>
                    {chain.steps.length} {chain.steps.length === 1 ? "step" : "steps"}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "var(--cn-muted)", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {chain.description || <span style={{ fontStyle: "italic", color: "var(--cn-dim)" }}>No description</span>}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--cn-dim)" }}>
                    {new Date(chain.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {chain.isPublic && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--cn-muted)" }}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 11, height: 11 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
