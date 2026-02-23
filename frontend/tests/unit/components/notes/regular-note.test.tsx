import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RegularNote from "../../../../components/notes/regular-note";

function toIsoDateOffset(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

describe("RegularNote", () => {
  it("shows Today for notes created today", () => {
    render(
      <RegularNote
        category="Personal"
        color="#78ABA8"
        content="Content"
        createdAt={toIsoDateOffset(0)}
        title="Title"
      />,
    );

    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows Yesterday for notes created yesterday", () => {
    render(
      <RegularNote
        category="School"
        color="#FCDC94"
        content="Content"
        createdAt={toIsoDateOffset(-1)}
        title="Title"
      />,
    );

    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("shows Month day for older notes", () => {
    const oldDate = "2025-05-10T12:00:00.000Z";

    render(
      <RegularNote
        category="Random Thoughts"
        color="#EF9C66"
        content="Content"
        createdAt={oldDate}
        title="Title"
      />,
    );

    expect(screen.getByText("May 10")).toBeInTheDocument();
  });

  it("handles invalid date without crashing", () => {
    render(
      <RegularNote
        category="Random Thoughts"
        color="#EF9C66"
        content="Content"
        createdAt="not-a-date"
        title="Title"
      />,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
  });
});
