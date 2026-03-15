import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client safe for use in Next.js API route handlers (server-side).
 * Unlike the browser client in lib/supabase.ts, this does not depend on localStorage
 * or any browser APIs, so it can run in Node.js edge/serverless environments.
 */
function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Validates a Supabase Bearer token from an Authorization header and returns
 * the associated user, or null if the token is missing or invalid.
 *
 * Usage in API routes:
 *   const user = await getUserFromRequest(request);
 *   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 */
export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  // Expect "Bearer <token>" format
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
