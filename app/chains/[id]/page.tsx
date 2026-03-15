"use client";

import { useState, useEffect, useCallback } from "react";
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

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-3xl mx-auto">
        <Link
          href="/chains"
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6 sm:mb-8"
        >
          &larr; Back to Chains
        </Link>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading chain...
            </div>
          </div>
        )}

        {/* Error state (when chain not found) */}
        {!loading && error && !chain && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
            <Link
              href="/chains"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-full transition-colors"
            >
              Back to Chains
            </Link>
          </div>
        )}

        {/* Chain content */}
        {!loading && chain && (
          <>
            {/* Inline error banner */}
            {error && (
              <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 mb-6">
                {error}
              </div>
            )}

            {/* ====== EDIT MODE ====== */}
            {editing ? (
              <>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Chain title"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Description
                      <span className="ml-1 text-neutral-400 dark:text-neutral-500 font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Describe what this chain does..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-y"
                    />
                  </div>
                </div>

                {/* Steps editor */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100">
                      Steps
                    </h2>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {editSteps.length}{" "}
                      {editSteps.length === 1 ? "step" : "steps"}
                    </span>
                  </div>

                  <div className="space-y-4">
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
                    className="mt-4 w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  >
                    + Add Step
                  </button>
                </div>

                {/* Edit actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              /* ====== VIEW MODE ====== */
              <>
                {/* Chain header */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {chain.title}
                    </h1>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={startEditing}
                        className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  {chain.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                      {chain.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
                    <span>
                      {chain.steps.length}{" "}
                      {chain.steps.length === 1 ? "step" : "steps"}
                    </span>
                    <span>
                      Created{" "}
                      {new Date(chain.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {chain.isPublic && <span>Public</span>}
                  </div>
                </div>

                {/* Steps display */}
                <div className="mb-8">
                  <h2 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                    Steps
                  </h2>
                  {chain.steps.length === 0 ? (
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 py-8 text-center">
                      This chain has no steps. Click Edit to add some.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {chain.steps.map((step, index) => (
                        <ChainStepCard
                          key={step.id}
                          step={{
                            id: step.id,
                            title: step.title,
                            content: step.content,
                            outputVariable: step.outputVariable,
                          }}
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

                {/* Delete section */}
                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      Delete this chain
                    </button>
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
                      <p className="text-sm text-neutral-900 dark:text-neutral-100 mb-3">
                        Are you sure you want to delete &ldquo;{chain.title}
                        &rdquo;? This action cannot be undone.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                          className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm font-medium rounded-full transition-colors"
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
