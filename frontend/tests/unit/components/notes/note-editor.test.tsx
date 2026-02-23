import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NoteEditor from "../../../../components/notes/note-editor";

describe("NoteEditor", () => {
  const categories = [
    { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    { id: 2, name: "School", color: "#FCDC94" },
  ];

  it("renders loading state", () => {
    render(
      <NoteEditor
        categories={categories}
        draft={null}
        editedAt=""
        isLoading
        onClose={vi.fn()}
        onDraftChange={vi.fn()}
        status=""
      />,
    );

    expect(screen.getByText("Loading note...")).toBeInTheDocument();
  });

  it("handles title/content changes and close action", () => {
    const onClose = vi.fn();
    const onDraftChange = vi.fn();

    render(
      <NoteEditor
        categories={categories}
        draft={{ title: "Old", content: "Old content", category_id: 1 }}
        editedAt="2026-01-01T00:00:00Z"
        isLoading={false}
        onClose={onClose}
        onDraftChange={onDraftChange}
        status=""
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Note Title"), {
      target: { value: "New title" },
    });
    fireEvent.change(screen.getByPlaceholderText("Pour your heart out..."), {
      target: { value: "New content" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Close editor" }));

    expect(onDraftChange).toHaveBeenCalledWith({
      title: "New title",
      content: "Old content",
      category_id: 1,
    });
    expect(onDraftChange).toHaveBeenCalledWith({
      title: "Old",
      content: "New content",
      category_id: 1,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("returns empty formatted date for invalid editedAt and handles category select when draft is null", () => {
    const onDraftChange = vi.fn();

    render(
      <NoteEditor
        categories={categories}
        draft={null}
        editedAt="not-a-date"
        isLoading={false}
        onClose={vi.fn()}
        onDraftChange={onDraftChange}
        status=""
      />,
    );

    expect(screen.getByText(/Last Edited:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select a category" }));
    fireEvent.click(screen.getByRole("button", { name: "School" }));

    expect(onDraftChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("updates category when selecting an option with a loaded draft", () => {
    const onDraftChange = vi.fn();

    render(
      <NoteEditor
        categories={categories}
        draft={{ title: "Title", content: "Content", category_id: 1 }}
        editedAt="2026-01-01T00:00:00Z"
        isLoading={false}
        onClose={vi.fn()}
        onDraftChange={onDraftChange}
        status=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Random Thoughts" }));
    fireEvent.click(screen.getByRole("button", { name: "School" }));

    expect(onDraftChange).toHaveBeenCalledWith({
      title: "Title",
      content: "Content",
      category_id: 2,
    });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
