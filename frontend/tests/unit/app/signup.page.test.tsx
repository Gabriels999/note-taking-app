import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const apiMocks = vi.hoisted(() => ({
  ensureCsrfCookie: vi.fn(),
  signupUser: vi.fn(),
}));

vi.mock("../../../services/api", () => apiMocks);

describe("signup page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.ensureCsrfCookie.mockResolvedValue(undefined);
  });

  it("submits signup and redirects to home", async () => {
    apiMocks.signupUser.mockResolvedValue({ detail: "ok" });

    const SignupPage = (await import("../../../app/signup/page")).default;
    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(apiMocks.signupUser).toHaveBeenCalledWith({
        username: "john@example.com",
        password: "secret",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/home");
  });

  it("shows csrf error when initialization fails", async () => {
    apiMocks.ensureCsrfCookie.mockRejectedValue(new Error("csrf"));

    const SignupPage = (await import("../../../app/signup/page")).default;
    render(<SignupPage />);

    expect(
      await screen.findByText("Could not initialize CSRF cookie."),
    ).toBeInTheDocument();
  });

  it("toggles password visibility and handles signup failure", async () => {
    apiMocks.signupUser.mockRejectedValue(new Error("Signup failed"));

    const SignupPage = (await import("../../../app/signup/page")).default;
    render(<SignupPage />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("Signup failed")).toBeInTheDocument();
  });

  it("shows fallback submit error for non-Error rejection", async () => {
    apiMocks.signupUser.mockRejectedValue("bad-signup");

    const SignupPage = (await import("../../../app/signup/page")).default;
    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("Request failed.")).toBeInTheDocument();
  });
});
