"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import EyeClosedIcon from "../../components/icons/eye-closed-icon";
import EyeOpenIcon from "../../components/icons/eye-open-icon";

import signupCat from "../../assets/signup_cat.png";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function readCookie(name: string): string | null {
  const key = `${name}=`;
  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith(key));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(key.length));
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it in frontend/.env.local."
    );
  }

  const csrfUrl = `${API_BASE_URL}/api/auth/csrf/`;
  const signupUrl = `${API_BASE_URL}/api/auth/signup/`;

  useEffect(() => {
    fetch(csrfUrl, {
      credentials: "include",
    }).catch(() => {
      setStatus("Could not initialize CSRF cookie.");
    });
  }, [csrfUrl]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const csrfToken = readCookie("csrftoken");
      const response = await fetch(signupUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrfToken ?? "",
        },
        body: new URLSearchParams({
          username,
          password1: password,
          password2: password,
        }).toString(),
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus(payload.detail ?? "Signup failed.");
        return;
      }

      setStatus("Signup successful.");
    } catch {
      setStatus("Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-shell">
        <div className="login-plant signup-plant">
          <Image
            alt="Cat illustration"
            className="login-plant-image"
            priority
            src={signupCat}
          />
        </div>

        <h1 className="login-title">Yay, New Friend!</h1>

        <form className="login-form" onSubmit={onSubmit}>
          <input
            aria-label="Email address"
            autoComplete="username"
            className="login-input"
            id="signup-email"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Email address"
            required
            value={username}
          />

          <div className="login-password-wrap">
            <input
              aria-label="Password"
              autoComplete="new-password"
              className="login-input"
              id="signup-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="login-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeClosedIcon className="login-eye-icon" />
              ) : (
                <EyeOpenIcon className="login-eye-icon" />
              )}
            </button>
          </div>

          <button className="login-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {status ? <p className="login-status">{status}</p> : null}
        <p className="login-link-wrap">
          <Link className="login-link" href="/login">
            We&apos;re already friends!
          </Link>
        </p>
      </section>
    </main>
  );
}
