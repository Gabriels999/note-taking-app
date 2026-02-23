import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const apiMocks = vi.hoisted(() => ({
  ensureCsrfCookie: vi.fn(),
  loginUser: vi.fn(),
}));

vi.mock("../../../services/api", () => apiMocks);

describe("login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.ensureCsrfCookie.mockResolvedValue(undefined);
  });

  it("submits login and redirects to home", async () => {
    apiMocks.loginUser.mockResolvedValue({ detail: "ok" });

    const LoginPage = (await import("../../../app/login/page")).default;
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(apiMocks.loginUser).toHaveBeenCalledWith({
        username: "john@example.com",
        password: "secret",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/home");
  });

  it("toggles password visibility", async () => {
    const LoginPage = (await import("../../../app/login/page")).default;
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("shows csrf initialization error", async () => {
    apiMocks.ensureCsrfCookie.mockRejectedValue(new Error("csrf"));

    const LoginPage = (await import("../../../app/login/page")).default;
    render(<LoginPage />);

    expect(
      await screen.findByText("Could not initialize CSRF cookie."),
    ).toBeInTheDocument();
  });

  it("shows submit error message on login failure", async () => {
    apiMocks.loginUser.mockRejectedValue(new Error("Invalid credentials"));

    const LoginPage = (await import("../../../app/login/page")).default;
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows fallback submit error for non-Error rejection", async () => {
    apiMocks.loginUser.mockRejectedValue("bad-login");

    const LoginPage = (await import("../../../app/login/page")).default;
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Request failed.")).toBeInTheDocument();
  });
});
