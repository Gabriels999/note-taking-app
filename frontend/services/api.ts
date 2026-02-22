import type {
  AuthCredentials,
  CreateNotePayload,
  NoteCategory,
  NoteItem,
  UpdateNotePayload,
} from "./api-interfaces";

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

function getErrorMessage(data: Record<string, unknown>): string {
  return typeof data.detail === "string" ? data.detail : "Request failed.";
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNoteCategory(value: unknown): value is NoteCategory {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.color === "string"
  );
}

function isNoteItem(value: unknown): value is NoteItem {
  if (!isObjectRecord(value) || !isNoteCategory(value.category)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    typeof value.created_at === "string" &&
    typeof value.edited_at === "string" &&
    typeof value.user_id === "number"
  );
}

function parseNoteItemOrThrow(data: Record<string, unknown>): NoteItem {
  if (!isNoteItem(data)) {
    throw new Error("Unexpected note payload.");
  }

  return data;
}

async function getJson(path: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${requireApiBaseUrl()}${path}`, {
    credentials: "include",
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
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
    throw new Error(getErrorMessage(data));
  }

  return data;
}

async function patchJson(
  path: string,
  payload: UpdateNotePayload,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${requireApiBaseUrl()}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": readCookie("csrftoken") ?? "",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data));
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

export async function getNotes(): Promise<NoteItem[]> {
  const data = await getJson("/api/notes/");
  if (!Array.isArray(data.notes)) {
    return [];
  }

  return data.notes.filter(isNoteItem);
}

export async function getCategories(): Promise<NoteCategory[]> {
  const data = await getJson("/api/categories/");
  if (!Array.isArray(data.categories)) {
    return [];
  }

  return data.categories.filter(isNoteCategory);
}

export async function createNote(
  payload: CreateNotePayload,
): Promise<NoteItem> {
  const data = await postForm("/api/notes/", {
    title: payload.title,
    content: payload.content,
    category_id: String(payload.category_id),
  });
  return parseNoteItemOrThrow(data);
}

export async function getNote(noteId: number): Promise<NoteItem> {
  const data = await getJson(`/api/notes/${noteId}/`);
  return parseNoteItemOrThrow(data);
}

export async function updateNote(
  noteId: number,
  payload: UpdateNotePayload,
): Promise<NoteItem> {
  const data = await patchJson(`/api/notes/${noteId}/`, payload);
  return parseNoteItemOrThrow(data);
}
