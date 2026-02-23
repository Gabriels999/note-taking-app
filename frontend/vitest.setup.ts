import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", { alt, ...props }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement("a", { href, ...props }, children),
}));
