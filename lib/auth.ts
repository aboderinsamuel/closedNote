import { User } from "./types";
import { supabase } from "./supabase";

export async function registerUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ ok: true; needsEmailConfirmation?: boolean } | { ok: false; error: string }> {
  try {
    if (!email || !password) {
      return { ok: false, error: "Email and password are required" };
    }

    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters" };
    }

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
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        return { ok: false, error: "This email is already registered. Please login instead." };
      }
      return { ok: false, error: error.message || "Failed to sign up" };
    }

    if (!data.user) {
      return { ok: false, error: "Failed to create user" };
    }

    // Empty identities means the user needs to confirm their email before the session is granted
    const needsEmailConfirmation = !data.session || (data.user.identities && data.user.identities.length === 0);

    return { ok: true, needsEmailConfirmation };
  } catch (err) {
    console.error("[auth] registerUser:", err);
    const errorMessage = err instanceof Error ? err.message : "Network error - please check your connection";
    return { ok: false, error: errorMessage };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!email || !password) {
      return { ok: false, error: "Email and password are required" };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
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

    return { ok: true };
  } catch (err) {
    console.error("[auth] authenticateUser:", err);
    const errorMessage = err instanceof Error ? err.message : "Network error - please check your connection";
    return { ok: false, error: errorMessage };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: profileData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    const profile = profileData as { id: string; email: string; display_name: string; created_at: string; updated_at: string } | null;

    if (error || !profile) {
      // Profile row missing - build user from auth metadata so login still works
      console.warn("[auth] profile missing, falling back to auth metadata");
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
    console.error("[auth] getCurrentUser:", err);
    return null;
  }
}

export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error("[auth] getSession:", err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[auth] signOut:", error);
  } catch (err) {
    console.error("[auth] logoutUser:", err);
  }
}

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

    // RLS + CASCADE on the RPC handles prompt/tag/user-row cleanup
    const { error } = await supabase.rpc("delete_user");

    if (error) {
      console.error("[auth] deleteAccount:", error);
      return { ok: false, error: error.message };
    }

    await supabase.auth.signOut();
    return { ok: true };
  } catch (err) {
    console.error("[auth] deleteAccount:", err);
    return { ok: false, error: "Failed to delete account" };
  }
}

export async function resetPasswordForEmail(
  email: string,
  redirectTo: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!email) return { ok: false, error: "Email is required" };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function signInWithOAuth(
  provider: "google" | "github",
  redirectTo: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    // Build user directly from the session, no extra network calls.
    // All needed data is already in the session object. Doing an async DB fetch
    // here caused timing bugs: multiple in-flight fetches on rapid page loads led
    // to stale callbacks calling setLoading(false) out of order.
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
