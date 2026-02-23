import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}));

describe("app/page", () => {
  it("redirects to signup", async () => {
    const module = await import("../../../app/page");
    module.default();
    expect(redirectMock).toHaveBeenCalledWith("/signup");
  });
});
