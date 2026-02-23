import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EyeClosedIcon from "../../../../components/icons/eye-closed-icon";
import EyeOpenIcon from "../../../../components/icons/eye-open-icon";

describe("icon components", () => {
  it("renders eye-open icon", () => {
    const { container } = render(<EyeOpenIcon className="open" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders eye-closed icon", () => {
    const { container } = render(<EyeClosedIcon className="closed" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
