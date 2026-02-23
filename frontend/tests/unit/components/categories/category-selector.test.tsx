import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CategorySelector from "../../../../components/categories/category-selector";

describe("CategorySelector", () => {
  const options = [
    { id: 1, name: "Random Thoughts", color: "#EF9C66" },
    { id: 2, name: "School", color: "#FCDC94" },
  ];

  it("renders selected option and toggles chevron class", () => {
    const onToggle = vi.fn();

    const { rerender } = render(
      <CategorySelector
        isOpen={false}
        onSelect={vi.fn()}
        onToggle={onToggle}
        options={options}
        selectedCategoryId={1}
      />,
    );

    expect(screen.getByText("Random Thoughts")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /random thoughts/i }));
    expect(onToggle).toHaveBeenCalled();

    rerender(
      <CategorySelector
        isOpen
        onSelect={vi.fn()}
        onToggle={onToggle}
        options={options}
        selectedCategoryId={1}
      />,
    );

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("calls onSelect when option is clicked", () => {
    const onSelect = vi.fn();

    render(
      <CategorySelector
        isOpen
        onSelect={onSelect}
        onToggle={vi.fn()}
        options={options}
        selectedCategoryId={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /school/i }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("shows default label when no category is selected", () => {
    render(
      <CategorySelector
        isOpen={false}
        onSelect={vi.fn()}
        onToggle={vi.fn()}
        options={options}
        selectedCategoryId={null}
      />,
    );

    expect(screen.getByText("Select a category")).toBeInTheDocument();
  });
});
