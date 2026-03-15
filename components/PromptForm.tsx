"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PromptModel } from "@/lib/types";
import { savePrompt } from "@/lib/promptData";
import { useAuth } from "./AuthProvider";
import { usePrompts } from "@/lib/hooks/usePrompts";

export function PromptForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { addOptimistic, refresh } = usePrompts();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [model, setModel] = useState<PromptModel>("gpt-4o");
  const [collection, setCollection] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newPrompt = {
      id,
      title,
      content,
      model,
      collection: collection.trim() || "uncategorized",
      createdAt: now,
      updatedAt: now,
    };

    // Add to UI immediately, navigate now
    addOptimistic(newPrompt);
    router.push("/");

    // Persist in background, then sync
    savePrompt(newPrompt)
      .then(() => refresh())
      .catch((err) => {
        console.error("Error saving prompt:", err);
        refresh(); // re-sync to remove optimistic entry on failure
      });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your prompt a name"
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Prompt
          </label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Enter your prompt here..."
            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-shadow resize-y"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Collection
            </label>
            <input
              type="text"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="e.g. coding"
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as PromptModel)}
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-shadow"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3.5">Claude 3.5</option>
              <option value="claude-3">Claude 3</option>
              <option value="gemini-2">Gemini 2</option>
              <option value="gemini-pro">Gemini Pro</option>
              <option value="mistral">Mistral</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Save prompt
        </button>
      </form>
    </div>
  );
}
