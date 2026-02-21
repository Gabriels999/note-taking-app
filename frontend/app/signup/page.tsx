"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import EyeClosedIcon from "../../components/icons/eye-closed-icon";
import EyeOpenIcon from "../../components/icons/eye-open-icon";
import { ensureCsrfCookie, signupUser } from "../../services/api";

import signupCat from "../../assets/signup_cat.png";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ensureCsrfCookie().catch(() => {
      setStatus("Could not initialize CSRF cookie.");
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      await signupUser({ username, password });
      router.push("/home");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request failed.");
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
            className="login-plant-image signup-plant-image"
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
