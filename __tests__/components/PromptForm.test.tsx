/**
 * Component tests for PromptForm.
 *
 * Tests cover: field rendering, unauthenticated redirect, optimistic update
 * on submission, collection defaulting, and background save + refresh behavior.
 *
 * All external dependencies (router, auth, data layer) are mocked so these
 * tests run entirely in-memory with no network calls.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptForm } from "@/components/PromptForm";

// ── Mocks ────────────────────────────────────────────────────────────────────

// jest.mock() is hoisted before variable declarations, so factories must only
// use jest.fn() inline — no outer variables. We then import the mocked hooks
// and call mockReturnValue() to inject our named jest.fn() references.
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/hooks/usePrompts", () => ({ usePrompts: jest.fn() }));
jest.mock("@/lib/promptData", () => ({ savePrompt: jest.fn(() => Promise.resolve()) }));
jest.mock("@/components/AuthProvider", () => ({ useAuth: jest.fn() }));

import { useRouter } from "next/navigation";
import { usePrompts } from "@/lib/hooks/usePrompts";
import { savePrompt } from "@/lib/promptData";
import { useAuth } from "@/components/AuthProvider";

const mockPush = jest.fn();
const mockAddOptimistic = jest.fn();
const mockRefresh = jest.fn(() => Promise.resolve());
const mockSavePrompt = savePrompt as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderWithAuth(user: object | null = { id: "user-1", email: "test@example.com" }) {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePrompts as jest.Mock).mockReturnValue({
    addOptimistic: mockAddOptimistic,
    refresh: mockRefresh,
    prompts: [],
    loading: false,
    error: null,
    updateOptimistic: jest.fn(),
    removeOptimistic: jest.fn(),
  });
  (useAuth as jest.Mock).mockReturnValue({ user });
  return render(<PromptForm />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PromptForm – rendering", () => {
  it("renders all form fields", () => {
    renderWithAuth();
    expect(screen.getByPlaceholderText("Give your prompt a name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your prompt here...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. coding")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save prompt/i })).toBeInTheDocument();
  });

  it("renders the model select with default value gpt-4o", () => {
    renderWithAuth();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("gpt-4o");
  });
});

describe("PromptForm – unauthenticated behavior", () => {
  it("redirects to /login on submit when user is not authenticated", async () => {
    renderWithAuth(null);
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "Test Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Some content");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockSavePrompt).not.toHaveBeenCalled();
  });
});

describe("PromptForm – authenticated submission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSavePrompt.mockResolvedValue(undefined);
    mockRefresh.mockResolvedValue(undefined);
  });

  it("calls addOptimistic and navigates home on valid submit", async () => {
    renderWithAuth();
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "My Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Prompt content");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    expect(mockAddOptimistic).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My Prompt", content: "Prompt content" })
    );
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("defaults collection to 'uncategorized' when left blank", async () => {
    renderWithAuth();
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Content");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    expect(mockAddOptimistic).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "uncategorized" })
    );
  });

  it("uses the entered collection name when provided", async () => {
    renderWithAuth();
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Content");
    await userEvent.type(screen.getByPlaceholderText("e.g. coding"), "engineering");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    expect(mockAddOptimistic).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "engineering" })
    );
  });

  it("calls savePrompt asynchronously after optimistic update", async () => {
    renderWithAuth();
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Content");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    await waitFor(() => {
      expect(mockSavePrompt).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Prompt", content: "Content" })
      );
    });
  });

  it("calls refresh after savePrompt resolves", async () => {
    renderWithAuth();
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Content");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it("still calls refresh when savePrompt rejects, to roll back the optimistic entry", async () => {
    mockSavePrompt.mockRejectedValueOnce(new Error("network error"));
    // PromptForm logs the error — silence it so Jest output stays clean
    jest.spyOn(console, "error").mockImplementation(() => {});
    renderWithAuth();
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Content");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it("generated prompt has a non-empty id and ISO timestamp", async () => {
    renderWithAuth();
    await userEvent.type(screen.getByPlaceholderText("Give your prompt a name"), "Prompt");
    await userEvent.type(screen.getByPlaceholderText("Enter your prompt here..."), "Content");
    await userEvent.click(screen.getByRole("button", { name: /save prompt/i }));

    const optimisticArg = mockAddOptimistic.mock.calls[0][0];
    expect(optimisticArg.id).toBeTruthy();
    expect(new Date(optimisticArg.createdAt).toISOString()).toBe(optimisticArg.createdAt);
  });
});
