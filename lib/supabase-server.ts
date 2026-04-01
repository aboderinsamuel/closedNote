import { createClient } from "@supabase/supabase-js";

// Server-side client: no localStorage dependency, safe for API route handlers
function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) return null;

  const supabase = createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  return error ? null : user;
}
