export type PromptModel = string

export interface Prompt {
  id: string
  title: string
  content: string
  model: PromptModel
  collection: string
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

export interface PromptVersion {
  id: string
  promptId: string
  title: string
  content: string
  versionNumber: number
  createdAt: string
}
