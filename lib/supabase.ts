import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Use a valid placeholder URL for demo mode
const DEFAULT_SUPABASE_URL = "https://demo.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU0MjQwMCwiZXhwIjoxOTU4MTE4NDAwfQ.demo-key-placeholder";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Missing Supabase environment variables! Using demo mode with local storage."
  );
  console.warn("📖 See SUPABASE_SETUP.md for production setup instructions");
}

// Validate URL format if provided
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  console.error("❌ Invalid NEXT_PUBLIC_SUPABASE_URL format. Must start with http:// or https://");
  console.warn("Using demo mode instead.");
}

// Use valid defaults for demo mode to prevent client creation errors
const finalUrl = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : DEFAULT_SUPABASE_URL;
const finalKey = supabaseAnonKey || DEFAULT_SUPABASE_KEY;

export const supabase = createClient<Database>(
  finalUrl,
  finalKey,
  {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'closednote-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-client-info': 'closednote@0.1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    },
    db: {
      schema: 'public',
    },
  }
);
