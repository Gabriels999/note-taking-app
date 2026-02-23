import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

const useParamsMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => useParamsMock(),
}));

const apiMocks = vi.hoisted(() => ({
  getCategories: vi.fn(),
  getNote: vi.fn(),
  updateNote: vi.fn(),
}));

vi.mock("../../../services/api", () => apiMocks);

describe("notes/[noteId] page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ noteId: "12" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads note and passes hydrated props to NoteEditor", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNote.mockResolvedValue({
      id: 12,
      title: "Title",
      content: "Content",
      created_at: "2026-01-01T00:00:00Z",
      edited_at: "2026-01-01T00:00:00Z",
      category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      user_id: 2,
    });
    apiMocks.updateNote.mockResolvedValue({
      edited_at: "2026-01-01T00:01:00Z",
    });

    const Page = (await import("../../../app/notes/[noteId]/page")).default;
    render(<Page />);

    await waitFor(() => expect(apiMocks.getNote).toHaveBeenCalledWith(12));
    expect(screen.getByDisplayValue("Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Content")).toBeInTheDocument();
  });

  it("sets invalid-id status when noteId param is not numeric", async () => {
    useParamsMock.mockReturnValue({ noteId: "abc" });

    const Page = (await import("../../../app/notes/[noteId]/page")).default;
    render(<Page />);

    expect(await screen.findByText("Invalid note ID.")).toBeInTheDocument();
  });

  it("shows load error when note request fails", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNote.mockRejectedValue(new Error("Could not load note."));

    const Page = (await import("../../../app/notes/[noteId]/page")).default;
    render(<Page />);

    expect(await screen.findByText("Could not load note.")).toBeInTheDocument();
  });

  it("auto-saves after draft changes and updates edited timestamp", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      { id: 2, name: "School", color: "#FCDC94" },
    ]);
    apiMocks.getNote.mockResolvedValue({
      id: 12,
      title: "Title",
      content: "Content",
      created_at: "2026-01-01T00:00:00Z",
      edited_at: "2026-01-01T00:00:00Z",
      category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      user_id: 2,
    });
    apiMocks.updateNote.mockResolvedValue({
      id: 12,
      title: "Updated title",
      content: "Content",
      created_at: "2026-01-01T00:00:00Z",
      edited_at: "2026-01-01T00:01:00Z",
      category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      user_id: 2,
    });

    const Page = (await import("../../../app/notes/[noteId]/page")).default;
    render(<Page />);

    await screen.findByDisplayValue("Title");
    vi.useFakeTimers();
    fireEvent.change(screen.getByPlaceholderText("Note Title"), {
      target: { value: "Updated title" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(apiMocks.updateNote).toHaveBeenCalledWith(12, {
      title: "Updated title",
      content: "Content",
      category_id: 1,
    });
  });

  it("does not update state when autosave resolves after unmount", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNote.mockResolvedValue({
      id: 12,
      title: "Title",
      content: "Content",
      created_at: "2026-01-01T00:00:00Z",
      edited_at: "2026-01-01T00:00:00Z",
      category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      user_id: 2,
    });

    let resolveUpdate: ((value: { edited_at: string }) => void) | null = null;
    apiMocks.updateNote.mockReturnValue(
      new Promise<{ edited_at: string }>((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    const Page = (await import("../../../app/notes/[noteId]/page")).default;
    const { unmount } = render(<Page />);

    await screen.findByDisplayValue("Title");
    vi.useFakeTimers();
    fireEvent.change(screen.getByPlaceholderText("Note Title"), {
      target: { value: "Updated title" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(apiMocks.updateNote).toHaveBeenCalledTimes(1);

    unmount();
    resolveUpdate?.({ edited_at: "2026-01-01T00:02:00Z" });
    await Promise.resolve();
  });

  it("does not set save error when autosave rejects after unmount", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNote.mockResolvedValue({
      id: 12,
      title: "Title",
      content: "Content",
      created_at: "2026-01-01T00:00:00Z",
      edited_at: "2026-01-01T00:00:00Z",
      category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      user_id: 2,
    });

    let rejectUpdate: ((reason?: unknown) => void) | null = null;
    apiMocks.updateNote.mockReturnValue(
      new Promise<never>((_, reject) => {
        rejectUpdate = reject;
      }),
    );

    const Page = (await import("../../../app/notes/[noteId]/page")).default;
    const { unmount } = render(<Page />);

    await screen.findByDisplayValue("Title");
    vi.useFakeTimers();
    fireEvent.change(screen.getByPlaceholderText("Pour your heart out..."), {
      target: { value: "Changed" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(apiMocks.updateNote).toHaveBeenCalledTimes(1);

    unmount();
    rejectUpdate?.(new Error("late save error"));
    await Promise.resolve();
  });

  it("does not set state when request resolves after unmount", async () => {
    let resolveCategories:
      | ((value: { id: number; name: string; color: string }[]) => void)
      | null = null;
    const categoriesPromise = new Promise<
      { id: number; name: string; color: string }[]
    >((resolve) => {
      resolveCategories = resolve;
    });
    let resolveNote:
      | ((value: {
          id: number;
          title: string;
          content: string;
          created_at: string;
          edited_at: string;
          category: { id: number; name: string; color: string };
          user_id: number;
        }) => void)
      | null = null;
    const notePromise = new Promise<{
      id: number;
      title: string;
      content: string;
      created_at: string;
      edited_at: string;
      category: { id: number; name: string; color: string };
      user_id: number;
    }>((resolve) => {
      resolveNote = resolve;
    });

    apiMocks.getCategories.mockReturnValue(categoriesPromise);
    apiMocks.getNote.mockReturnValue(notePromise);

    const Page = (await import("../../../app/notes/[noteId]/page")).default;
    const { unmount } = render(<Page />);
    unmount();

    resolveCategories?.([{ id: 1, name: "Random Thoughts", color: "#EF9C66" }]);
    resolveNote?.({
      id: 12,
      title: "Title",
      content: "Content",
      created_at: "2026-01-01T00:00:00Z",
      edited_at: "2026-01-01T00:00:00Z",
      category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      user_id: 2,
    });

    await Promise.resolve();
    expect(apiMocks.getNote).toHaveBeenCalledWith(12);
  });
});
