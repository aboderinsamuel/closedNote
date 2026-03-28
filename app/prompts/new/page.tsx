"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PromptForm } from "@/components/PromptForm";
import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { usePrompts } from "@/lib/hooks/usePrompts";

export default function NewPromptPage() {
  const { prompts } = usePrompts();
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);

  // Warn on browser refresh / tab close when form has unsaved content
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Leave without saving?"
      );
      if (!confirmed) return;
    }
    router.push("/dashboard");
  }, [isDirty, router]);

  return (
    <Layout header={<Header promptCount={prompts.length} />} sidebar={null}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-8"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 mb-8">
          New prompt
        </h1>
        <PromptForm onDirtyChange={setIsDirty} />
      </div>
    </Layout>
  );
}
