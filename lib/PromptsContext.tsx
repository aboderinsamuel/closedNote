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
}

const PromptsContext = createContext<PromptsContextValue>({
  prompts: [],
  loading: true,
  error: null,
  refresh: async () => {},
  addOptimistic: () => {},
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
  }, [user]);

  const addOptimistic = (prompt: Prompt) => {
    setPrompts((prev) => [prompt, ...prev]);
  };

  return (
    <PromptsContext.Provider value={{ prompts, loading, error, refresh: loadPrompts, addOptimistic }}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePromptsContext(): PromptsContextValue {
  return useContext(PromptsContext);
}
