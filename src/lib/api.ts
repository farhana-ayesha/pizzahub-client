import { API_URL } from "@/lib/auth-client";

/**
 * Small fetch wrapper for the PizzaHub REST API.
 *
 * The API returns `{ success: true, data: ... }`, so this helper unwraps the
 * `data` payload and turns error responses into readable `ApiError` messages.
 * Better Auth sessions are cookie based, therefore every request is sent with
 * `credentials: "include"`.
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const remoteApiEnabled = API_URL.length > 0;

/**
 * Access tokens are kept in memory only. The server also accepts the Better
 * Auth session cookie, but sending the JWT exercises the explicit token
 * verification middleware and avoids exposing credentials to localStorage.
 */
let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function primeAccessToken(force = false): Promise<string | null> {
  if (!API_URL) return null;
  if (accessToken && !force) return accessToken;
  accessToken = null;

  try {
    const response = await fetch(`${API_URL}/api/auth/token`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: { token?: unknown } };
    accessToken =
      typeof payload?.data?.token === "string" ? payload.data.token : null;
    return accessToken;
  } catch {
    return null;
  }
}

async function sendRequest(
  path: string,
  init: RequestInit,
  token: string | null,
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      "The PizzaHub API is not configured. Set NEXT_PUBLIC_API_URL to enable live data.",
      0,
    );
  }

  let response: Response;
  try {
    response = await sendRequest(path, init, accessToken);
    if (response.status === 401 && accessToken) {
      const refreshed = await primeAccessToken(true);
      if (refreshed) {
        response = await sendRequest(path, init, refreshed);
      }
    }
  } catch {
    throw new ApiError(
      "Could not reach the PizzaHub server. Check your connection and try again.",
      0,
    );
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const body = payload as
      | { message?: string; error?: string }
      | string
      | null;
    const message =
      (typeof body === "string" ? body : body?.message ?? body?.error) ||
      "The PizzaHub request failed.";
    throw new ApiError(message, response.status);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
