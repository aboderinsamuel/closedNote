"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getPromptById } from "@/lib/promptData";
import { Prompt } from "@/lib/types";
import { PromptDetail } from "@/components/PromptDetail";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";

export default function PromptPage({ params }: { params: { id: string } }) {
  const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { prompts: allPrompts } = usePrompts();

  useEffect(() => {
    const loadPrompt = async () => {
      setLoading(true);
      const foundPrompt = await getPromptById(params.id);
      setPrompt(foundPrompt);
      setLoading(false);
    };

    loadPrompt();
  }, [params.id]);

  if (loading) {
    return null;
  }

  if (!prompt) {
    notFound();
  }

  return (
    <Layout
      header={<Header promptCount={allPrompts.length} />}
      sidebar={<Sidebar prompts={allPrompts} activeCollection={prompt.collection} />}
    >
      <div className="max-w-2xl mx-auto">
        <PromptDetail prompt={prompt} />
      </div>
    </Layout>
  );
}
