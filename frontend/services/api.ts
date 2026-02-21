import type { AuthCredentials } from "./api-interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it in frontend/.env.",
    );
  }

  return API_BASE_URL;
}

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

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function postForm(
  path: string,
  payload: Record<string, string>,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${requireApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRFToken": readCookie("csrftoken") ?? "",
    },
    body: new URLSearchParams(payload).toString(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : "Request failed.",
    );
  }

  return data;
}

export async function ensureCsrfCookie(): Promise<void> {
  const response = await fetch(`${requireApiBaseUrl()}/api/auth/csrf/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not initialize CSRF cookie.");
  }
}

export async function loginUser(
  params: AuthCredentials,
): Promise<Record<string, unknown>> {
  return postForm("/api/auth/login/", {
    username: params.username,
    password: params.password,
  });
}

export async function signupUser(
  params: AuthCredentials,
): Promise<Record<string, unknown>> {
  return postForm("/api/auth/signup/", {
    username: params.username,
    password1: params.password,
    password2: params.password,
  });
}
