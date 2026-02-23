import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const apiMocks = vi.hoisted(() => ({
  createNote: vi.fn(),
  getCategories: vi.fn(),
  getNotes: vi.fn(),
}));

vi.mock("../../../services/api", () => apiMocks);

describe("home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders notes and filters by category", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      { id: 2, name: "School", color: "#FCDC94" },
    ]);
    apiMocks.getNotes.mockResolvedValue([
      {
        id: 10,
        title: "A",
        content: "One",
        created_at: new Date().toISOString(),
        edited_at: new Date().toISOString(),
        category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
        user_id: 1,
      },
      {
        id: 11,
        title: "B",
        content: "Two",
        created_at: new Date().toISOString(),
        edited_at: new Date().toISOString(),
        category: { id: 2, name: "School", color: "#FCDC94" },
        user_id: 1,
      },
    ]);

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    await waitFor(() => expect(apiMocks.getNotes).toHaveBeenCalled());

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("School")[0]);
    expect(screen.queryByText("A")).not.toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("creates note and redirects when clicking New Note", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNotes.mockResolvedValue([]);
    apiMocks.createNote.mockResolvedValue({ id: 55 });

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    await waitFor(() => expect(apiMocks.getCategories).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /new note/i }));

    await waitFor(() =>
      expect(apiMocks.createNote).toHaveBeenCalledWith({
        title: "",
        content: "",
        category_id: 1,
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/notes/55");
  });

  it("shows error when creating note without categories", async () => {
    apiMocks.getCategories.mockResolvedValue([]);
    apiMocks.getNotes.mockResolvedValue([]);

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    await waitFor(() => expect(apiMocks.getCategories).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /new note/i }));

    expect(
      await screen.findByText("Could not create note: category list is empty."),
    ).toBeInTheDocument();
  });

  it("shows load error when initial fetch fails", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNotes.mockRejectedValue(new Error("Could not load notes."));

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    expect(await screen.findByText("Could not load notes.")).toBeInTheDocument();
  });

  it("shows create error and allows opening note card", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
      { id: 2, name: "School", color: "#FCDC94" },
    ]);
    apiMocks.getNotes.mockResolvedValue([
      {
        id: 12,
        title: "Open me",
        content: "Body",
        created_at: new Date().toISOString(),
        edited_at: new Date().toISOString(),
        category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
        user_id: 1,
      },
    ]);
    apiMocks.createNote.mockRejectedValue(new Error("Could not create note."));

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    await waitFor(() => expect(apiMocks.getNotes).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /new note/i }));
    expect(
      await screen.findByText("Could not create note."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open me/i }));
    expect(pushMock).toHaveBeenCalledWith("/notes/12");

    fireEvent.click(screen.getByText("All Categories"));
    expect(screen.getByText("Open me")).toBeInTheDocument();
  });

  it("uses the first category when Random Thoughts does not exist", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 7, name: "School", color: "#FCDC94" },
    ]);
    apiMocks.getNotes.mockResolvedValue([]);
    apiMocks.createNote.mockResolvedValue({ id: 99 });

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    await waitFor(() => expect(apiMocks.getCategories).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /new note/i }));

    await waitFor(() =>
      expect(apiMocks.createNote).toHaveBeenCalledWith({
        title: "",
        content: "",
        category_id: 7,
      }),
    );
  });

  it("shows fallback messages for non-Error failures", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNotes.mockRejectedValue("bad-load");

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    expect(await screen.findByText("Could not load notes.")).toBeInTheDocument();
  });

  it("shows fallback create message for non-Error failures", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    ]);
    apiMocks.getNotes.mockResolvedValue([]);
    apiMocks.createNote.mockRejectedValue("bad-create");

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    await waitFor(() => expect(apiMocks.getCategories).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /new note/i }));

    expect(await screen.findByText("Could not create note.")).toBeInTheDocument();
  });

  it("keeps rendered category count stable when notes include unknown categories", async () => {
    apiMocks.getCategories.mockResolvedValue([
      { id: 2, name: "School", color: "#FCDC94" },
    ]);
    apiMocks.getNotes.mockResolvedValue([
      {
        id: 21,
        title: "Outside list",
        content: "Body",
        created_at: new Date().toISOString(),
        edited_at: new Date().toISOString(),
        category: { id: 9, name: "Drama", color: "#AABBCC" },
        user_id: 1,
      },
    ]);

    const HomePage = (await import("../../../app/home/page")).default;
    render(<HomePage />);

    await waitFor(() => expect(apiMocks.getNotes).toHaveBeenCalled());
    expect(screen.getByText("School")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("does not update state when initial load resolves after unmount", async () => {
    let resolveCategories:
      | ((value: { id: number; name: string; color: string }[]) => void)
      | null = null;
    let resolveNotes:
      | ((value: {
          id: number;
          title: string;
          content: string;
          created_at: string;
          edited_at: string;
          category: { id: number; name: string; color: string };
          user_id: number;
        }[]) => void)
      | null = null;

    apiMocks.getCategories.mockReturnValue(
      new Promise<{ id: number; name: string; color: string }[]>((resolve) => {
        resolveCategories = resolve;
      }),
    );
    apiMocks.getNotes.mockReturnValue(
      new Promise<
        {
          id: number;
          title: string;
          content: string;
          created_at: string;
          edited_at: string;
          category: { id: number; name: string; color: string };
          user_id: number;
        }[]
      >((resolve) => {
        resolveNotes = resolve;
      }),
    );

    const HomePage = (await import("../../../app/home/page")).default;
    const { unmount } = render(<HomePage />);
    unmount();

    resolveCategories?.([{ id: 1, name: "Random Thoughts", color: "#EF9C66" }]);
    resolveNotes?.([
      {
        id: 1,
        title: "A",
        content: "B",
        created_at: new Date().toISOString(),
        edited_at: new Date().toISOString(),
        category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
        user_id: 1,
      },
    ]);

    await Promise.resolve();
    expect(apiMocks.getCategories).toHaveBeenCalledTimes(1);
  });

  it("does not update error state when initial load rejects after unmount", async () => {
    let rejectCategories: ((reason?: unknown) => void) | null = null;
    apiMocks.getCategories.mockReturnValue(
      new Promise<never>((_, reject) => {
        rejectCategories = reject;
      }),
    );
    apiMocks.getNotes.mockReturnValue(
      new Promise<never>(() => {
        return;
      }),
    );

    const HomePage = (await import("../../../app/home/page")).default;
    const { unmount } = render(<HomePage />);
    unmount();

    rejectCategories?.(new Error("late load error"));
    await Promise.resolve();
    expect(apiMocks.getNotes).toHaveBeenCalledTimes(1);
  });
});
