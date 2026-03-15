"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Prompt } from "./types";
import { getAllPrompts } from "./promptData";
import { useAuth } from "@/components/AuthProvider";

interface PromptsContextValue {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addOptimistic: (prompt: Prompt) => void;
  updateOptimistic: (prompt: Prompt) => void;
  removeOptimistic: (id: string) => void;
}

const PromptsContext = createContext<PromptsContextValue>({
  prompts: [],
  loading: true,
  error: null,
  refresh: async () => {},
  addOptimistic: () => {},
  updateOptimistic: () => {},
  removeOptimistic: () => {},
});

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrompts = async () => {
    if (!user) {
      setPrompts([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAllPrompts();
      setPrompts(data);
    } catch {
      setError("Failed to load prompts");
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Optimistic update helpers: callers mutate local state immediately so the
  // UI feels instant, then persist in the background. On failure, they call
  // refresh() to re-sync with the database and undo the optimistic change.

  const addOptimistic = (prompt: Prompt) => {
    // Prepend so the new prompt appears at the top of the list right away
    setPrompts((prev) => [prompt, ...prev]);
  };

  const updateOptimistic = (prompt: Prompt) => {
    // Swap the existing entry in-place by id
    setPrompts((prev) => prev.map((p) => (p.id === prompt.id ? prompt : p)));
  };

  const removeOptimistic = (id: string) => {
    // Drop the entry immediately; refresh() will restore it if the delete fails
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <PromptsContext.Provider value={{ prompts, loading, error, refresh: loadPrompts, addOptimistic, updateOptimistic, removeOptimistic }}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePromptsContext(): PromptsContextValue {
  return useContext(PromptsContext);
}
