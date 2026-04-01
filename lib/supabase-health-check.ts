import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const results = {
    envVarsConfigured: false,
    urlFormat: false,
    connectionTest: false,
    authReady: false,
    errors: [] as string[],
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    results.errors.push("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return results;
  }
  results.envVarsConfigured = true;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    results.urlFormat = true;
  } else {
    results.errors.push("Invalid URL format: must start with http:// or https://");
    return results;
  }

  try {
    const { error } = await supabase.from("users").select("count").limit(0);
    if (error) {
      results.errors.push(`Database connection error: ${error.message}`);
    } else {
      results.connectionTest = true;
    }
  } catch (err) {
    results.errors.push(`Connection test failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      results.errors.push(`Auth service error: ${error.message}`);
    } else {
      results.authReady = true;
    }
  } catch (err) {
    results.errors.push(`Auth test failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  return results;
}

export async function logSupabaseHealth() {
  const results = await testSupabaseConnection();

  console.log("Supabase health check");
  console.log("env vars:", results.envVarsConfigured ? "ok" : "failed");
  console.log("url format:", results.urlFormat ? "ok" : "failed");
  console.log("db:", results.connectionTest ? "ok" : "failed");
  console.log("auth:", results.authReady ? "ok" : "failed");

  if (results.errors.length > 0) {
    results.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  return results;
}
