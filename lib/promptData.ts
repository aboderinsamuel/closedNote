import { Prompt, PromptModel } from "./types";
import { supabase } from "./supabase";

export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*, tags(*)")
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
      tags: p.tags ? (p.tags as unknown as { tag: string }[]).map((t) => t.tag) : [],
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

    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("*")
      .eq("prompt_id", id);

    if (tagsError) {
      console.warn("[promptData] Failed to fetch tags:", tagsError);
    }

    return {
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      model: prompt.model as PromptModel,
      collection: prompt.collection,
      tags: tags ? tags.map((t) => t.tag) : [],
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at,
    };
  } catch (err) {
    console.error("[promptData] Error fetching prompt:", err);
    return undefined;
  }
}

export async function savePrompt(prompt: Prompt): Promise<void> {
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

    // Handle tags: delete old ones and insert new ones
    const { error: deleteTagsError } = await supabase
      .from("tags")
      .delete()
      .eq("prompt_id", prompt.id);

    if (deleteTagsError) {
      console.warn("[promptData] Failed to delete old tags:", deleteTagsError);
    }

    if (prompt.tags && prompt.tags.length > 0) {
      const tagInserts = prompt.tags.map((tag) => ({
        prompt_id: prompt.id,
        tag,
      }));

      const { error: insertTagsError } = await supabase
        .from("tags")
        .insert(tagInserts);

      if (insertTagsError) {
        console.warn("[promptData] Failed to insert tags:", insertTagsError);
      }
    }
  } catch (err) {
    console.error("[promptData] Error saving prompt:", err);
    throw err;
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
    tag?: string;
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
    if (filters.tag) {
      const tag = filters.tag;
      const inPrimary = prompt.collection === tag;
      const inExtra = (prompt.tags || []).includes(tag);
      if (!inPrimary && !inExtra) return false;
    }
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

export function groupPromptsByTag(
  prompts: Prompt[]
): Record<string, Prompt[]> {
  const groups: Record<string, Prompt[]> = {};
  for (const p of prompts) {
    const tags = [p.collection || "uncategorized", ...(p.tags || [])];
    const uniqueTags = Array.from(new Set(tags));
    for (const t of uniqueTags) {
      if (!groups[t]) groups[t] = [];
      groups[t].push(p);
    }
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.title.localeCompare(b.title));
  }
  return groups;
}
