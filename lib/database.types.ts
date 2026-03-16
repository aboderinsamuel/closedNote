export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          model: string
          collection: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          model: string
          collection: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          model?: string
          collection?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          prompt_id: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          tag: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          tag?: string
          created_at?: string
        }
        Relationships: []
      }
      prompt_chains: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chain_steps: {
        Row: {
          id: string
          chain_id: string
          prompt_id: string | null
          step_order: number
          title: string
          content: string
          output_variable: string | null
          input_mapping: Json
          created_at: string
        }
        Insert: {
          id?: string
          chain_id: string
          prompt_id?: string | null
          step_order: number
          title?: string
          content?: string
          output_variable?: string | null
          input_mapping?: Json
          created_at?: string
        }
        Update: {
          id?: string
          chain_id?: string
          prompt_id?: string | null
          step_order?: number
          title?: string
          content?: string
          output_variable?: string | null
          input_mapping?: Json
          created_at?: string
        }
        Relationships: []
      }
      prompt_versions: {
        Row: {
          id: string
          prompt_id: string
          title: string
          content: string
          version_number: number
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          title: string
          content: string
          version_number: number
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          title?: string
          content?: string
          version_number?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
