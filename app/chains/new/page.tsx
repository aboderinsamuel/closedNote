"use client";

import { useState, useEffect } from "react";
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
      setError("Please enter a title for your chain.");
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

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-3xl mx-auto">
        <Link
          href="/chains"
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6 sm:mb-8"
        >
          &larr; Back to Chains
        </Link>

        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6 sm:mb-8">
          New Chain
        </h1>

        {/* Error display */}
        {error && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 mb-6">
            {error}
          </div>
        )}

        {/* Chain metadata */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blog Post Generator"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this chain does..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-y"
            />
          </div>
        </div>

        {/* Steps section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Steps
            </h2>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {steps.length} {steps.length === 1 ? "step" : "steps"}
            </span>
          </div>

          <div className="space-y-4">
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
            className="mt-4 w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            + Add Step
          </button>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Chain"}
          </button>
          <Link
            href="/chains"
            className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </Layout>
  );
}
