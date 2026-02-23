import { describe, expect, it } from "vitest";
import RootLayout, { metadata } from "../../../app/layout";

describe("app/layout", () => {
  it("exports metadata", () => {
    expect(metadata.title).toBe("Note Taking App");
  });

  it("returns html tree with provided children", () => {
    const tree = RootLayout({
      children: <div>Child Content</div>,
    });

    expect(tree.type).toBe("html");
    const body = tree.props.children[1];
    expect(body.type).toBe("body");
    expect(body.props.children.props.children).toBe("Child Content");
  });
});
