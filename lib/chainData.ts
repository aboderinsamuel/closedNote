import { PromptChain, ChainStep } from "./types";
import { supabase } from "./supabase";
import { Database } from "./database.types";

type ChainRow = Database["public"]["Tables"]["prompt_chains"]["Row"];
type StepRow = Database["public"]["Tables"]["chain_steps"]["Row"];

export async function getAllChains(): Promise<PromptChain[]> {
  try {
    const { data: chainsData, error } = await supabase
      .from("prompt_chains")
      .select("*")
      .order("created_at", { ascending: false });
    const chains = chainsData as ChainRow[] | null;

    if (error || !chains) {
      console.error("[chainData] Failed to fetch chains:", error);
      return [];
    }

    const chainIds = chains.map((c) => c.id);
    if (chainIds.length === 0) return [];

    const { data: stepsData, error: stepsError } = await supabase
      .from("chain_steps")
      .select("*")
      .in("chain_id", chainIds)
      .order("step_order", { ascending: true });
    const steps = stepsData as StepRow[] | null;

    if (stepsError) {
      console.warn("[chainData] Failed to fetch steps:", stepsError);
    }

    const stepsByChain: Record<string, ChainStep[]> = {};
    if (steps) {
      steps.forEach((s) => {
        if (!stepsByChain[s.chain_id]) stepsByChain[s.chain_id] = [];
        stepsByChain[s.chain_id].push({
          id: s.id,
          chainId: s.chain_id,
          promptId: s.prompt_id || undefined,
          stepOrder: s.step_order,
          title: s.title,
          content: s.content,
          outputVariable: s.output_variable || undefined,
          inputMapping: (s.input_mapping as Record<string, string>) || {},
          createdAt: s.created_at,
        });
      });
    }

    return chains.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description || undefined,
      isPublic: c.is_public,
      steps: stepsByChain[c.id] || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  } catch (err) {
    console.error("[chainData] Error:", err);
    return [];
  }
}

export async function getChainById(id: string): Promise<PromptChain | undefined> {
  try {
    const { data: chainData, error } = await supabase
      .from("prompt_chains")
      .select("*")
      .eq("id", id)
      .single();
    const chain = chainData as ChainRow | null;

    if (error || !chain) return undefined;

    const { data: stepsData2 } = await supabase
      .from("chain_steps")
      .select("*")
      .eq("chain_id", id)
      .order("step_order", { ascending: true });
    const steps = stepsData2 as StepRow[] | null;

    return {
      id: chain.id,
      title: chain.title,
      description: chain.description || undefined,
      isPublic: chain.is_public,
      steps: (steps || []).map((s) => ({
        id: s.id,
        chainId: s.chain_id,
        promptId: s.prompt_id || undefined,
        stepOrder: s.step_order,
        title: s.title,
        content: s.content,
        outputVariable: s.output_variable || undefined,
        inputMapping: (s.input_mapping as Record<string, string>) || {},
        createdAt: s.created_at,
      })),
      createdAt: chain.created_at,
      updatedAt: chain.updated_at,
    };
  } catch (err) {
    console.error("[chainData] Error:", err);
    return undefined;
  }
}

export async function saveChain(
  chain: Omit<PromptChain, "steps"> & { steps: Omit<ChainStep, "id" | "chainId" | "createdAt">[] }
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if chain already exists
  const { data: existingData } = await supabase
    .from("prompt_chains")
    .select("id")
    .eq("id", chain.id)
    .maybeSingle();
  const existing = existingData as { id: string } | null;

  if (existing) {
    const { error } = await supabase
      .from("prompt_chains")
      .update({
        title: chain.title,
        description: chain.description || null,
        is_public: chain.isPublic,
      })
      .eq("id", chain.id);
    if (error) throw error;

    // Delete old steps and re-insert
    await supabase.from("chain_steps").delete().eq("chain_id", chain.id);
  } else {
    const { error } = await supabase.from("prompt_chains").insert({
      id: chain.id,
      user_id: user.id,
      title: chain.title,
      description: chain.description || null,
      is_public: chain.isPublic,
    });
    if (error) throw error;
  }

  // Insert steps
  if (chain.steps.length > 0) {
    const stepInserts = chain.steps.map((s, i) => ({
      chain_id: chain.id,
      prompt_id: s.promptId || null,
      step_order: i,
      title: s.title,
      content: s.content,
      output_variable: s.outputVariable || null,
      input_mapping: s.inputMapping || {},
    }));
    const { error } = await supabase.from("chain_steps").insert(stepInserts);
    if (error) throw error;
  }

  return chain.id;
}

export async function deleteChain(id: string): Promise<void> {
  const { error } = await supabase.from("prompt_chains").delete().eq("id", id);
  if (error) throw error;
}
