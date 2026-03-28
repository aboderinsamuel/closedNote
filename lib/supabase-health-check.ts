import { supabase } from "./supabase";


export async function testSupabaseConnection() {
  const results = {
    envVarsConfigured: false,
    urlFormat: false,
    connectionTest: false,
    authReady: false,
    errors: [] as string[],
  };

  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    results.errors.push("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return results;
  }
  results.envVarsConfigured = true;

  // Check URL format
  if (url.startsWith("http://") || url.startsWith("https://")) {
    results.urlFormat = true;
  } else {
    results.errors.push("Invalid URL format: must start with http:// or https://");
    return results;
  }

  // Test basic connection
  try {
    const { data, error } = await supabase.from("users").select("count").limit(0);
    
    if (error) {
      results.errors.push(`Database connection error: ${error.message}`);
    } else {
      results.connectionTest = true;
    }
  } catch (err) {
    results.errors.push(`Connection test failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  // Test auth service
  try {
    const { data, error } = await supabase.auth.getSession();
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


 // Log health check results to console
 
export async function logSupabaseHealth() {
  console.log("Supabase Health Check");
  console.log("========================");

  const results = await testSupabaseConnection();

  console.log("Environment Variables:", results.envVarsConfigured ? "OK" : "FAILED");
  console.log("URL Format:", results.urlFormat ? "OK" : "FAILED");
  console.log("Database Connection:", results.connectionTest ? "OK" : "FAILED");
  console.log("Auth Service:", results.authReady ? "OK" : "FAILED");

  if (results.errors.length > 0) {
    console.log("\nErrors:");
    results.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  } else {
    console.log("\nAll systems operational.");
  }
  
  return results;
}
