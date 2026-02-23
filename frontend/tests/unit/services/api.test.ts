import { beforeEach, describe, expect, it, vi } from "vitest";

function mockJsonResponse(
  body: Record<string, unknown>,
  options?: { ok?: boolean; status?: number },
): Response {
  const ok = options?.ok ?? true;
  const status = options?.status ?? (ok ? 200 : 400);
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("services/api", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000");
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "csrftoken=test-csrf-token",
      writable: true,
    });
  });

  it("getNotes returns valid note items", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockJsonResponse({
        notes: [
          {
            id: 1,
            title: "Note",
            content: "Text",
            created_at: "2026-01-01T00:00:00Z",
            edited_at: "2026-01-01T00:00:00Z",
            category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
            user_id: 10,
          },
          { invalid: true },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { getNotes } = await import("../../../services/api");
    const notes = await getNotes();

    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/notes/",
      { credentials: "include" },
    );
  });

  it("getCategories returns valid category items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse({
          categories: [
            { id: 1, name: "School", color: "#FCDC94" },
            { id: "bad", name: "Invalid", color: "#000000" },
          ],
        }),
      ),
    );

    const { getCategories } = await import("../../../services/api");
    const categories = await getCategories();

    expect(categories).toEqual([{ id: 1, name: "School", color: "#FCDC94" }]);
  });

  it("createNote throws when API returns invalid note payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({})));

    const { createNote } = await import("../../../services/api");
    await expect(
      createNote({ title: "A", content: "B", category_id: 1 }),
    ).rejects.toThrow("Unexpected note payload.");
  });

  it("getNote surfaces API error detail on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse(
          { detail: "Authentication required" },
          { ok: false, status: 401 },
        ),
      ),
    );

    const { getNote } = await import("../../../services/api");
    await expect(getNote(12)).rejects.toThrow("Authentication required");
  });

  it("uses fallback error message when detail is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({}, { ok: false, status: 500 })),
    );

    const { getNote } = await import("../../../services/api");
    await expect(getNote(1)).rejects.toThrow("Request failed.");
  });

  it("getNotes returns empty list when notes is not an array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({ notes: "invalid" })),
    );

    const { getNotes } = await import("../../../services/api");
    await expect(getNotes()).resolves.toEqual([]);
  });

  it("getCategories returns empty list when categories is not an array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({ categories: "invalid" })),
    );

    const { getCategories } = await import("../../../services/api");
    await expect(getCategories()).resolves.toEqual([]);
  });

  it("ensureCsrfCookie throws when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({}, { ok: false, status: 500 })),
    );

    const { ensureCsrfCookie } = await import("../../../services/api");
    await expect(ensureCsrfCookie()).rejects.toThrow(
      "Could not initialize CSRF cookie.",
    );
  });

  it("ensureCsrfCookie resolves when response is ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({})));

    const { ensureCsrfCookie } = await import("../../../services/api");
    await expect(ensureCsrfCookie()).resolves.toBeUndefined();
  });

  it("loginUser sends form body and csrf header", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ detail: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    const { loginUser } = await import("../../../services/api");
    await loginUser({ username: "user@example.com", password: "secret" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/auth/login/",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": "test-csrf-token",
        }),
      }),
    );
  });

  it("uses empty csrf token when cookie is missing", async () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "",
      writable: true,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ detail: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    const { loginUser } = await import("../../../services/api");
    await loginUser({ username: "user@example.com", password: "secret" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/auth/login/",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-CSRFToken": "",
        }),
      }),
    );
  });

  it("signupUser sends expected payload keys", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ detail: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    const { signupUser } = await import("../../../services/api");
    await signupUser({ username: "user@example.com", password: "secret" });

    const options = fetchMock.mock.calls[0][1] as { body?: string };
    expect(options.body).toContain("username=user%40example.com");
    expect(options.body).toContain("password1=secret");
    expect(options.body).toContain("password2=secret");
  });

  it("updateNote sends patch json and throws on invalid response payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({}));
    vi.stubGlobal("fetch", fetchMock);

    const { updateNote } = await import("../../../services/api");
    await expect(
      updateNote(7, { title: "x", content: "y", category_id: 2 }),
    ).rejects.toThrow("Unexpected note payload.");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/notes/7/",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-CSRFToken": "test-csrf-token",
        }),
      }),
    );
  });

  it("updateNote sends empty csrf token when cookie is missing", async () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "",
      writable: true,
    });
    const fetchMock = vi.fn().mockResolvedValue(
      mockJsonResponse({
        id: 7,
        title: "x",
        content: "y",
        created_at: "2026-01-01T00:00:00Z",
        edited_at: "2026-01-01T00:00:00Z",
        category: { id: 2, name: "School", color: "#FCDC94" },
        user_id: 1,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { updateNote } = await import("../../../services/api");
    await updateNote(7, { title: "x", content: "y", category_id: 2 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/notes/7/",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-CSRFToken": "",
        }),
      }),
    );
  });

  it("throws API detail on login non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse(
          { detail: "Bad credentials" },
          { ok: false, status: 400 },
        ),
      ),
    );

    const { loginUser } = await import("../../../services/api");
    await expect(
      loginUser({ username: "user@example.com", password: "wrong" }),
    ).rejects.toThrow("Bad credentials");
  });

  it("throws API detail on updateNote non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse(
          { detail: "Validation error" },
          { ok: false, status: 400 },
        ),
      ),
    );

    const { updateNote } = await import("../../../services/api");
    await expect(
      updateNote(9, { title: "t", content: "c", category_id: 2 }),
    ).rejects.toThrow("Validation error");
  });

  it("createNote and getNote return parsed note payloads", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          id: 5,
          title: "",
          content: "",
          created_at: "2026-01-01T00:00:00Z",
          edited_at: "2026-01-01T00:00:00Z",
          category: { id: 1, name: "Random Thoughts", color: "#EF9C66" },
          user_id: 1,
        }),
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          id: 6,
          title: "A",
          content: "B",
          created_at: "2026-01-01T00:00:00Z",
          edited_at: "2026-01-02T00:00:00Z",
          category: { id: 2, name: "School", color: "#FCDC94" },
          user_id: 1,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { createNote, getNote } = await import("../../../services/api");
    const created = await createNote({ title: "", content: "", category_id: 1 });
    const loaded = await getNote(6);

    expect(created.id).toBe(5);
    expect(loaded.id).toBe(6);
  });

  it("handles invalid json by returning fallback object", async () => {
    const badJsonResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockRejectedValue(new Error("invalid json")),
    } as unknown as Response;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(badJsonResponse));

    const { getNote } = await import("../../../services/api");
    await expect(getNote(1)).rejects.toThrow("Request failed.");
  });

  it("throws when NEXT_PUBLIC_API_BASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.stubGlobal("fetch", vi.fn());
    vi.resetModules();

    const { getNotes } = await import("../../../services/api");
    await expect(getNotes()).rejects.toThrow(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it in frontend/.env.",
    );
  });
});
