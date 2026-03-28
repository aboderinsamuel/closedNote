// Quick script to check if environment variables are loaded in production
// Add this to your browser console on your deployed site

console.log("Environment Check for closedNote");
console.log("=====================================");
console.log("");

// Check if running in browser
if (typeof window === "undefined") {
  console.log("Not running in browser");
} else {
  console.log("Running in browser");
}

// Check environment variables
console.log("");
console.log("Environment Variables:");
console.log("----------------------");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl) {
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
} else {
  console.log("NEXT_PUBLIC_SUPABASE_URL: NOT SET");
}

if (supabaseKey) {
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseKey.substring(0, 20) + "..."
  );
} else {
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY: NOT SET");
}

// Check localStorage
console.log("");
console.log("LocalStorage Auth Keys:");
console.log("-----------------------");
const authKeys = Object.keys(localStorage).filter(
  (key) =>
    key.includes("supabase") || key.includes("auth") || key.startsWith("sb-")
);

if (authKeys.length > 0) {
  authKeys.forEach((key) => {
    console.log(key);
  });
} else {
  console.log("No auth keys found (not logged in)");
}

// Check current URL
console.log("");
console.log("Current Location:");
console.log("-----------------");
console.log("URL:", window.location.href);
console.log("Origin:", window.location.origin);

console.log("");
console.log("=====================================");
console.log("Copy this output when reporting issues!");
