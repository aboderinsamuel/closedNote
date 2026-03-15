/**
 * Unit tests for lib/auth.ts
 * Tests input validation and error handling without hitting Supabase.
 */

// Mock the Supabase client before importing auth functions
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
    })),
  },
}));

import { registerUser, authenticateUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

// ─── registerUser ────────────────────────────────────────────────────────────

describe("registerUser – input validation", () => {
  it("rejects empty email and password", async () => {
    const result = await registerUser("", "");
    expect(result).toEqual({ ok: false, error: "Email and password are required" });
  });

  it("rejects missing email", async () => {
    const result = await registerUser("", "validpassword");
    expect(result).toEqual({ ok: false, error: "Email and password are required" });
  });

  it("rejects missing password", async () => {
    const result = await registerUser("user@example.com", "");
    expect(result).toEqual({ ok: false, error: "Email and password are required" });
  });

  it("rejects password shorter than 6 characters", async () => {
    const result = await registerUser("user@example.com", "abc");
    expect(result).toEqual({ ok: false, error: "Password must be at least 6 characters" });
  });

  it("accepts password of exactly 6 characters", async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: "123", identities: [{}] }, session: { access_token: "tok" } },
      error: null,
    });
    const result = await registerUser("user@example.com", "abc123");
    expect(result.ok).toBe(true);
  });
});

describe("registerUser – Supabase error handling", () => {
  it("returns error message from Supabase on failure", async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });
    const result = await registerUser("user@example.com", "password123");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("already registered");
    }
  });

  it("flags needsEmailConfirmation when no session returned", async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: "abc", identities: [{}] }, session: null },
      error: null,
    });
    const result = await registerUser("user@example.com", "password123");
    expect(result).toMatchObject({ ok: true, needsEmailConfirmation: true });
  });

  it("returns network error message on thrown exception", async () => {
    (mockAuth.signUp as jest.Mock).mockRejectedValueOnce(new Error("fetch failed"));
    const result = await registerUser("user@example.com", "password123");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/fetch failed/i);
  });
});

// ─── authenticateUser ────────────────────────────────────────────────────────

describe("authenticateUser – input validation", () => {
  it("rejects empty email and password", async () => {
    const result = await authenticateUser("", "");
    expect(result).toEqual({ ok: false, error: "Email and password are required" });
  });

  it("rejects missing email", async () => {
    const result = await authenticateUser("", "password123");
    expect(result).toEqual({ ok: false, error: "Email and password are required" });
  });

  it("rejects missing password", async () => {
    const result = await authenticateUser("user@example.com", "");
    expect(result).toEqual({ ok: false, error: "Email and password are required" });
  });
});

describe("authenticateUser – Supabase error handling", () => {
  it("maps invalid credentials to a friendly message", async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });
    const result = await authenticateUser("user@example.com", "wrongpassword");
    expect(result).toEqual({ ok: false, error: "Invalid email or password" });
  });

  it("maps unconfirmed email to a friendly message", async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Email not confirmed" },
    });
    const result = await authenticateUser("user@example.com", "password123");
    expect(result).toEqual({ ok: false, error: "Please verify your email first" });
  });

  it("returns ok:true on successful login", async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: "user-1" }, session: { access_token: "tok" } },
      error: null,
    });
    const result = await authenticateUser("user@example.com", "password123");
    expect(result).toEqual({ ok: true });
  });

  it("returns network error message on thrown exception", async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockRejectedValueOnce(
      new Error("Network request failed")
    );
    const result = await authenticateUser("user@example.com", "password123");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/network request failed/i);
  });
});
