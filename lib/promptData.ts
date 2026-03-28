import { Prompt, PromptModel } from "./types";
import { supabase } from "./supabase";

export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[promptData] Failed to fetch prompts:", error);
      return [];
    }

    if (!prompts || prompts.length === 0) return [];

    return prompts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      model: p.model as PromptModel,
      collection: p.collection,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  } catch (err) {
    console.error("[promptData] Error fetching prompts:", err);
    return [];
  }
}

export async function getPromptById(id: string): Promise<Prompt | undefined> {
  try {
    const { data: prompt, error: promptError } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (promptError || !prompt) {
      console.error("[promptData] Failed to fetch prompt:", promptError);
      return undefined;
    }

    return {
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      model: prompt.model as PromptModel,
      collection: prompt.collection,
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at,
    };
  } catch (err) {
    console.error("[promptData] Error fetching prompt:", err);
    return undefined;
  }
}

export async function savePrompt(prompt: Prompt, skipVersion = false): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const { error: upsertError } = await supabase.from("prompts").upsert({
      id: prompt.id,
      user_id: session.user.id,
      title: prompt.title,
      content: prompt.content,
      model: prompt.model,
      collection: prompt.collection,
      created_at: prompt.createdAt,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) throw upsertError;

    if (!skipVersion) {
      const { count } = await supabase
        .from("prompt_versions")
        .select("*", { count: "exact", head: true })
        .eq("prompt_id", prompt.id);

      const { error: versionError } = await supabase
        .from("prompt_versions")
        .insert({
          prompt_id: prompt.id,
          title: prompt.title,
          content: prompt.content,
          version_number: (count ?? 0) + 1,
        });

      if (versionError) {
        console.error("[promptData] Failed to save version:", versionError);
      }
    }
  } catch (err) {
    console.error("[promptData] Error saving prompt:", err);
    throw err;
  }
}

export async function savePromptTags(promptId: string, tags: string[]): Promise<void> {
  if (!tags.length) return;
  const { error } = await supabase
    .from("tags")
    .insert(tags.map((tag) => ({ prompt_id: promptId, tag })));
  if (error) {
    console.error("[promptData] Failed to save tags:", error);
    throw error;
  }
}

export async function deletePrompt(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("prompts").delete().eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.error("[promptData] Error deleting prompt:", err);
    throw err;
  }
}

export function filterPrompts(
  prompts: Prompt[],
  filters: {
    query?: string;
    model?: PromptModel;
    collection?: string;
  }
): Prompt[] {
  return prompts.filter((prompt) => {
    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      const matchesQuery =
        prompt.title.toLowerCase().includes(queryLower) ||
        prompt.content.toLowerCase().includes(queryLower);
      if (!matchesQuery) return false;
    }
    if (filters.model && prompt.model !== filters.model) return false;
    if (filters.collection && prompt.collection !== filters.collection)
      return false;
    return true;
  });
}

export function groupPromptsByCollection(
  prompts: Prompt[]
): Record<string, Prompt[]> {
  return prompts.reduce(
    (acc, prompt) => {
      const collection = prompt.collection || "uncategorized";
      if (!acc[collection]) {
        acc[collection] = [];
      }
      acc[collection].push(prompt);
      return acc;
    },
    {} as Record<string, Prompt[]>
  );
}

