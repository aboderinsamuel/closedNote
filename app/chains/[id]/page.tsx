"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { useAuth } from "@/components/AuthProvider";
import { getChainById, saveChain, deleteChain } from "@/lib/chainData";
import { PromptChain } from "@/lib/types";
import { ChainStepCard, ChainStepData } from "@/components/ChainStepCard";

function createEmptyStep(): ChainStepData {
  return {
    id: crypto.randomUUID(),
    title: "",
    content: "",
    outputVariable: undefined,
  };
}

export default function ChainDetailPage() {
  const { prompts } = usePrompts();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chainId = params.id as string;

  const [chain, setChain] = useState<PromptChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSteps, setEditSteps] = useState<ChainStepData[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadChain = useCallback(async () => {
    if (!chainId || !user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getChainById(chainId);
      if (!data) {
        setError("Chain not found");
        return;
      }
      setChain(data);
    } catch (err) {
      console.error("[ChainDetailPage] Failed to load chain:", err);
      setError("Failed to load chain");
    } finally {
      setLoading(false);
    }
  }, [chainId, user]);

  useEffect(() => {
    loadChain();
  }, [loadChain]);

  // Enter edit mode
  const startEditing = () => {
    if (!chain) return;
    setEditTitle(chain.title);
    setEditDescription(chain.description || "");
    setEditSteps(
      chain.steps.map((s) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        outputVariable: s.outputVariable,
      }))
    );
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
  };

  // Step editor handlers
  const handleAddStep = () => {
    setEditSteps((prev) => [...prev, createEmptyStep()]);
  };

  const handleRemoveStep = (index: number) => {
    setEditSteps((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setEditSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setEditSteps((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleStepChange = (index: number, updated: ChainStepData) => {
    setEditSteps((prev) => prev.map((s, i) => (i === index ? updated : s)));
  };

  // Save edits
  const handleSave = async () => {
    setError(null);

    if (!editTitle.trim()) {
      setError("Please enter a title for your chain.");
      return;
    }

    const validSteps = editSteps.filter((s) => s.content.trim());
    if (validSteps.length === 0) {
      setError("Please add at least one step with content.");
      return;
    }

    setSaving(true);
    try {
      await saveChain({
        id: chainId,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        isPublic: chain?.isPublic || false,
        createdAt: chain?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: validSteps.map((s, i) => ({
          stepOrder: i,
          title: s.title.trim() || `Step ${i + 1}`,
          content: s.content.trim(),
          outputVariable: s.outputVariable || undefined,
          inputMapping: {},
        })),
      });

      setEditing(false);
      await loadChain();
    } catch (err) {
      console.error("[ChainDetailPage] Save failed:", err);
      setError(err instanceof Error ? err.message : "Failed to save chain");
    } finally {
      setSaving(false);
    }
  };

  // Delete chain
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteChain(chainId);
      router.push("/chains");
    } catch (err) {
      console.error("[ChainDetailPage] Delete failed:", err);
      setError(err instanceof Error ? err.message : "Failed to delete chain");
      setDeleting(false);
      setShowDeleteConfirm(false);
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

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <span style={{ fontSize: 13, color: "var(--cn-muted)" }}>Loading thread...</span>
          </div>
        )}

        {/* Error - not found */}
        {!loading && error && !chain && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", textAlign: "center", gap: 16 }}>
            <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
            <Link
              href="/chains"
              style={{ padding: "9px 20px", background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)", borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Back to Threads
            </Link>
          </div>
        )}

        {/* Content */}
        {!loading && chain && (
          <>
            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 13, color: "#ef4444", marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* ── EDIT MODE ── */}
            {editing ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                  <div>
                    <label style={labelStyle}>Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Thread title"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Description <span style={{ fontWeight: 400, textTransform: "none", color: "var(--cn-dim)" }}>(optional)</span>
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Describe what this thread does..."
                      rows={2}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--cn-text)" }}>Steps</h2>
                    <span style={{ fontSize: 12, color: "var(--cn-dim)" }}>{editSteps.length} {editSteps.length === 1 ? "step" : "steps"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {editSteps.map((step, index) => (
                      <ChainStepCard
                        key={step.id}
                        step={step}
                        index={index}
                        totalCount={editSteps.length}
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

                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--cn-border-s)" }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: "9px 24px",
                      background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
                      border: "none", borderRadius: 99,
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      opacity: saving ? 0.6 : 1, transition: "opacity 0.15s",
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    style={{ fontSize: 13, color: "var(--cn-muted)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              /* ── VIEW MODE ── */
              <>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--cn-text)", letterSpacing: "-0.025em" }}>
                      {chain.title}
                    </h1>
                    <button
                      onClick={startEditing}
                      style={{
                        padding: "7px 16px", fontSize: 12, fontWeight: 600,
                        background: "var(--cn-bg-s2)", color: "var(--cn-text2)",
                        border: "1px solid var(--cn-border)", borderRadius: 99,
                        cursor: "pointer", transition: "background 0.15s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--cn-bg-s3)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--cn-bg-s2)")}
                    >
                      Edit
                    </button>
                  </div>
                  {chain.description && (
                    <p style={{ fontSize: 14, color: "var(--cn-muted)", marginBottom: 12 }}>{chain.description}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--cn-dim)" }}>
                    <span>{chain.steps.length} {chain.steps.length === 1 ? "step" : "steps"}</span>
                    <span>Created {new Date(chain.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {chain.isPublic && <span>Public</span>}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--cn-text)", marginBottom: 16 }}>Steps</h2>
                  {chain.steps.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--cn-muted)", textAlign: "center", padding: "32px 0" }}>
                      This thread has no steps. Click Edit to add some.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {chain.steps.map((step, index) => (
                        <ChainStepCard
                          key={step.id}
                          step={{ id: step.id, title: step.title, content: step.content, outputVariable: step.outputVariable }}
                          index={index}
                          totalCount={chain.steps.length}
                          onMoveUp={() => {}}
                          onMoveDown={() => {}}
                          onRemove={() => {}}
                          onChange={() => {}}
                          readonly
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--cn-border-s)" }}>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ fontSize: 13, color: "#ef4444", background: "none", border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      Delete this thread
                    </button>
                  ) : (
                    <div style={{ padding: "16px", borderRadius: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
                      <p style={{ fontSize: 13, color: "var(--cn-text)", marginBottom: 12 }}>
                        Are you sure you want to delete &ldquo;{chain.title}&rdquo;? This cannot be undone.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          style={{
                            padding: "7px 16px",
                            background: "#ef4444", color: "#fff",
                            border: "none", borderRadius: 99,
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            opacity: deleting ? 0.6 : 1,
                          }}
                        >
                          {deleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                          style={{
                            padding: "7px 16px",
                            background: "var(--cn-bg-s2)", color: "var(--cn-text2)",
                            border: "1px solid var(--cn-border)", borderRadius: 99,
                            fontSize: 13, fontWeight: 500, cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
