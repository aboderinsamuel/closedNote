import { User } from "./types";
import { supabase } from "./supabase";

// Register a new user with Supabase Auth

export async function registerUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ ok: true; needsEmailConfirmation?: boolean } | { ok: false; error: string }> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { ok: false, error: "Email and password are required" };
    }

    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters" };
    }

    console.log("[auth] Attempting signup for:", email);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName?.trim() || email.split("@")[0],
        },
      },
    });

    if (error) {
      console.error("[auth] Signup error:", error);
      
      // Check if user already exists
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        return { ok: false, error: "This email is already registered. Please login instead." };
      }
      
      return { ok: false, error: error.message || "Failed to sign up" };
    }

    if (!data.user) {
      return { ok: false, error: "Failed to create user" };
    }

    console.log("[auth] Signup successful:", data.user.id);
    console.log("[auth] Session exists:", !!data.session);
    
    // Check if user already exists (Supabase might return success for existing users)
    // If identities array is empty, it means email confirmation is needed
    const needsEmailConfirmation = !data.session || (data.user.identities && data.user.identities.length === 0);
    
    console.log("[auth] Email confirmation required:", needsEmailConfirmation);
    
    return { ok: true, needsEmailConfirmation };
  } catch (err) {
    console.error("[auth] Registration error:", err);
    const errorMessage = err instanceof Error ? err.message : "Network error - please check your connection";
    return { ok: false, error: errorMessage };
  }
}

 //Authenticate user with email and password

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { ok: false, error: "Email and password are required" };
    }

    console.log("[auth] Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("[auth] Login error:", error);
      
      // Provide more helpful error messages
      if (error.message.includes("Invalid login credentials")) {
        return { ok: false, error: "Invalid email or password" };
      }
      if (error.message.includes("Email not confirmed")) {
        return { ok: false, error: "Please verify your email first" };
      }
      if (error.message.includes("fetch")) {
        return { ok: false, error: "Network error - please check your internet connection" };
      }
      
      return { ok: false, error: error.message };
    }

    if (!data.user) {
      return { ok: false, error: "Invalid credentials" };
    }

    console.log("[auth] Login successful:", data.user.id);
    return { ok: true };
  } catch (err) {
    console.error("[auth] Login error:", err);
    const errorMessage = err instanceof Error ? err.message : "Network error - please check your connection";
    return { ok: false, error: errorMessage };
  }
}


 // Get the current authenticated user

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    // Fetch user profile from database
    const { data: profileData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    const profile = profileData as { id: string; email: string; display_name: string; created_at: string; updated_at: string } | null;

    if (error || !profile) {
      // Profile row missing - build user from auth metadata so login still works
      console.warn("[auth] User profile not found, using auth metadata fallback");
      return {
        id: authUser.id,
        email: authUser.email || "",
        displayName:
          (authUser.user_metadata?.display_name as string | undefined) ||
          authUser.email?.split("@")[0] ||
          "User",
        createdAt: authUser.created_at,
        updatedAt: authUser.updated_at || authUser.created_at,
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  } catch (err) {
    console.error("[auth] Failed to get current user:", err);
    return null;
  }
}


 //Get the current session
 
export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error("[auth] Failed to get session:", err);
    return null;
  }
}


 // Logout the current user
 
export async function logoutUser(): Promise<void> {
  try {
    console.log("[auth] Logging out user...");
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[auth] Logout error:", error);
    }
    
    console.log("[auth] Logout successful");
  } catch (err) {
    console.error("[auth] Logout error:", err);
  }
}


 // Delete the current user's account and all associated data
 
export async function deleteAccount(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "No user logged in" };
    }

    // Delete user from Supabase Auth (RLS + CASCADE will handle prompts/tags/user row)
    const { error } = await supabase.rpc("delete_user");

    if (error) {
      console.error("[auth] Account deletion error:", error);
      return { ok: false, error: error.message };
    }

    // Sign out after deletion
    await supabase.auth.signOut();
    return { ok: true };
  } catch (err) {
    console.error("[auth] Account deletion failed:", err);
    return { ok: false, error: "Failed to delete account" };
  }
}


 // Listen to auth state changes

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("[auth] Auth state change event:", event, "Session exists:", !!session);

    if (!session?.user) {
      callback(null);
      return;
    }

    // Build user directly from the session, no extra network calls.
    // All needed data (id, email, display_name, timestamps) is already present
    // in the session object. Doing an async DB fetch here caused timing bugs:
    // multiple in-flight fetches on rapid page loads led to stale callbacks
    // calling setLoading(false) out of order and leaving the app stuck.
    const authUser = session.user;
    callback({
      id: authUser.id,
      email: authUser.email || "",
      displayName:
        (authUser.user_metadata?.display_name as string | undefined) ||
        authUser.email?.split("@")[0] ||
        "User",
      createdAt: authUser.created_at,
      updatedAt: authUser.updated_at || authUser.created_at,
    });
  });

  return () => {
    subscription.unsubscribe();
  };
}
