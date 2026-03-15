"use client";

// All prompt state is managed by PromptsProvider in the root layout.
// This hook is a thin wrapper so existing imports keep working.
export { usePromptsContext as usePrompts } from "@/lib/PromptsContext";
