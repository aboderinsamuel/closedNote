import { Prompt } from "@/lib/types";
import { PromptListItem } from "./PromptListItem";

interface PromptCollectionProps {
  collection: string;
  prompts: Prompt[];
}

export function PromptCollection({ collection, prompts }: PromptCollectionProps) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 capitalize">
          {collection}
        </h2>
        <span className="text-xs text-neutral-300 dark:text-neutral-600 font-medium">
          {prompts.length}
        </span>
      </div>
      <div className="py-1">
        {prompts.map((prompt) => (
          <PromptListItem key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}
