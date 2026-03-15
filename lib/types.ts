export type PromptModel = "gpt-4" | "gpt-4o" | "gpt-4o-mini" | "gpt-3.5" | "claude-3" | "claude-3.5" | "gemini-pro" | "gemini-2" | "mistral" | "other"

export interface Prompt {
  id: string
  title: string
  content: string
  model: PromptModel
  collection: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
}

export interface PromptChain {
  id: string
  title: string
  description?: string
  isPublic: boolean
  steps: ChainStep[]
  createdAt: string
  updatedAt: string
}

export interface ChainStep {
  id: string
  chainId: string
  promptId?: string
  prompt?: Prompt
  stepOrder: number
  title: string
  content: string
  outputVariable?: string
  inputMapping?: Record<string, string>
  createdAt: string
}
