"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";
import { saveChain } from "@/lib/chainData";
import { ChainStepCard, ChainStepData } from "@/components/ChainStepCard";

function createEmptyStep(): ChainStepData {
  return {
    id: crypto.randomUUID(),
    title: "",
    content: "",
    outputVariable: undefined,
  };
}

export default function NewChainPage() {
  const { prompts } = usePrompts();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<ChainStepData[]>([createEmptyStep()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleAddStep = () => {
    setSteps((prev) => [...prev, createEmptyStep()]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setSteps((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleStepChange = (index: number, updated: ChainStepData) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? updated : s)));
  };

  const handleSave = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title for your thread.");
      return;
    }

    const validSteps = steps.filter((s) => s.content.trim());
    if (validSteps.length === 0) {
      setError("Please add at least one step with content.");
      return;
    }

    setSaving(true);
    try {
      const chainId = crypto.randomUUID();
      const now = new Date().toISOString();

      await saveChain({
        id: chainId,
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic: false,
        createdAt: now,
        updatedAt: now,
        steps: validSteps.map((s, i) => ({
          stepOrder: i,
          title: s.title.trim() || `Step ${i + 1}`,
          content: s.content.trim(),
          outputVariable: s.outputVariable || undefined,
          inputMapping: {},
        })),
      });

      router.push("/chains");
    } catch (err) {
      console.error("[NewChainPage] Save failed:", err);
      setError(err instanceof Error ? err.message : "Failed to save chain");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: "var(--cn-muted)", marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border)",
    borderRadius: 8, fontSize: 13, color: "var(--cn-text)",
    outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  return (
    <Layout header={<Header />} sidebar={null}>
      <div className="animate-fade-up" style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Link
            href="/chains"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--cn-muted)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
          >
            ← Back to Threads
          </Link>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ width: 20, height: 2, background: "var(--cn-accent)", borderRadius: 2, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cn-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>New Thread</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em" }}>
            Build a Thread
          </h1>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 13, color: "#ef4444", marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blog Post Generator"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>
              Description <span style={{ fontWeight: 400, textTransform: "none", color: "var(--cn-dim)" }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this thread does..."
              rows={2}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--cn-text)" }}>Steps</h2>
            <span style={{ fontSize: 12, color: "var(--cn-dim)" }}>
              {steps.length} {steps.length === 1 ? "step" : "steps"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((step, index) => (
              <ChainStepCard
                key={step.id}
                step={step}
                index={index}
                totalCount={steps.length}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRemove={handleRemoveStep}
                onChange={handleStepChange}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddStep}
            style={{
              marginTop: 12, width: "100%", padding: "12px",
              border: "2px dashed var(--cn-border)", borderRadius: 10,
              fontSize: 13, fontWeight: 500, color: "var(--cn-muted)",
              background: "transparent", cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cn-accent)"; e.currentTarget.style.color = "var(--cn-accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cn-border)"; e.currentTarget.style.color = "var(--cn-muted)"; }}
          >
            + Add Step
          </button>
        </div>

        {/* Save */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--cn-border-s)" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "9px 24px",
              background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
              border: "none", borderRadius: 99,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              opacity: saving ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = saving ? "0.6" : "1"; }}
          >
            {saving ? "Saving..." : "Save Thread"}
          </button>
          <Link
            href="/chains"
            style={{ fontSize: 13, color: "var(--cn-muted)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
          >
            Cancel
          </Link>
        </div>
      </div>
    </Layout>
  );
}
