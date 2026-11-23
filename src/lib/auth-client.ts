import type { Role } from "@/lib/types";

/**
 * Optional Better Auth integration.
 *
 * The client runs in a self-contained demo mode out of the box. When
 * `NEXT_PUBLIC_API_URL` is configured, authentication requests are sent to the
 * Express + Better Auth server instead of the local demo store.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
export const remoteAuthEnabled = API_URL.length > 0;

const AUTH_BASE = "/api/auth";

export interface RemoteAuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  isBlocked?: boolean | null;
  businessName?: string | null;
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: string | null;
  phone?: string | null;
  location?: string | null;
  createdAt?: string | null;
}

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new AuthApiError(
      "Could not reach the PizzaHub auth server. Check your connection and try again.",
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
    const body = payload as { message?: string; error?: string } | string | null;
    const message =
      (typeof body === "string" ? body : body?.message ?? body?.error) ||
      "The authentication request failed.";
    throw new AuthApiError(message, response.status);
  }

  return payload as T;
}

export function normalizeRole(value?: string | null): Role {
  if (value === "vendor" || value === "admin" || value === "customer") {
    return value;
  }
  return "customer";
}

export async function remoteSignIn(email: string, password: string) {
  const data = await authFetch<{ user?: RemoteAuthUser }>("/sign-in/email", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!data?.user) {
    throw new AuthApiError("The auth server did not return a user session.");
  }
  return data.user;
}

export async function remoteSignUp(input: {
  name: string;
  email: string;
  password: string;
  role: "customer" | "vendor";
  image?: string;
}) {
  const data = await authFetch<{ user?: RemoteAuthUser }>("/sign-up/email", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!data?.user) {
    throw new AuthApiError("The auth server did not return a user session.");
  }
  return data.user;
}

export async function remoteSignOut() {
  try {
    await authFetch("/sign-out", { method: "POST", body: "{}" });
  } catch {
    // A failed sign-out request should never trap the user in the UI.
  }
}

export async function getRemoteSession(): Promise<RemoteAuthUser | null> {
  try {
    const data = await authFetch<{ user?: RemoteAuthUser } | null>("/get-session");
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function remoteGoogleSignIn(callbackURL: string) {
  const data = await authFetch<{ url?: string; redirect?: boolean }>("/sign-in/social", {
    method: "POST",
    body: JSON.stringify({ provider: "google", callbackURL }),
  });
  if (!data?.url) {
    throw new AuthApiError("Google sign-in could not be started.");
  }
  return data.url;
}

export async function remoteRequestPasswordReset(email: string, redirectTo: string) {
  await authFetch("/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email, redirectTo }),
  });
}

export async function remoteResetPassword(token: string, newPassword: string) {
  await authFetch("/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function remoteChangePassword(currentPassword: string, newPassword: string) {
  await authFetch("/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions: true }),
  });
}
