"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import EyeClosedIcon from "../../components/icons/eye-closed-icon";
import EyeOpenIcon from "../../components/icons/eye-open-icon";
import { ensureCsrfCookie, signupUser } from "../../services/api";

import signupCat from "../../assets/signup_cat.png";
import styles from "./signup.module.css";

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
    <main className={styles.screen}>
      <section className={styles.shell}>
        <div className={`${styles.plant} ${styles.signupPlant}`}>
          <Image
            alt="Cat illustration"
            className={`${styles.plantImage} ${styles.signupPlantImage}`}
            priority
            src={signupCat}
          />
        </div>

        <h1 className={styles.title}>Yay, New Friend!</h1>

        <form className={styles.form} onSubmit={onSubmit}>
          <input
            aria-label="Email address"
            autoComplete="username"
            className={styles.input}
            id="signup-email"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Email address"
            required
            value={username}
          />

          <div className={styles.passwordWrap}>
            <input
              aria-label="Password"
              autoComplete="new-password"
              className={styles.input}
              id="signup-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={styles.passwordToggle}
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeClosedIcon className={styles.eyeIcon} />
              ) : (
                <EyeOpenIcon className={styles.eyeIcon} />
              )}
            </button>
          </div>

          <button
            className={styles.submitButton}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {status ? <p className={styles.status}>{status}</p> : null}
        <p className={styles.linkWrap}>
          <Link className={styles.link} href="/login">
            We&apos;re already friends!
          </Link>
        </p>
      </section>
    </main>
  );
}
