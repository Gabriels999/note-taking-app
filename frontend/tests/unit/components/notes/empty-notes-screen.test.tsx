import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EmptyNotesScreen from "../../../../components/notes/empty-notes-screen";

describe("EmptyNotesScreen", () => {
  it("renders waiting message and image", () => {
    render(<EmptyNotesScreen />);

    expect(
      screen.getByText("I'm just here waiting for your charming notes..."),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Cute boba tea waiting for notes"),
    ).toBeInTheDocument();
  });
});
