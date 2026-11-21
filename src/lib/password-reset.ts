const RESET_KEY = "pizzahub-reset-v1";
const RESET_TTL_MS = 15 * 60 * 1000;

interface StoredReset {
  token: string;
  email: string;
  expiresAt: number;
}

function encode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

function readStore(): StoredReset | null {
  try {
    const raw = window.localStorage.getItem(RESET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredReset;
    if (!parsed.token || !parsed.email || !parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createLocalResetToken(email: string) {
  const expiresAt = Date.now() + RESET_TTL_MS;
  const token = encode(JSON.stringify({ email, expiresAt }));
  try {
    window.localStorage.setItem(
      RESET_KEY,
      JSON.stringify({ token, email, expiresAt } satisfies StoredReset),
    );
  } catch {
    // The form can still continue if storage is unavailable.
  }
  return token;
}

export function readLocalResetToken(token: string) {
  const stored = readStore();
  if (!stored || stored.token !== token || stored.expiresAt < Date.now()) {
    return null;
  }
  try {
    const decoded = JSON.parse(decode(token)) as {
      email?: string;
      expiresAt?: number;
    };
    if (decoded.email !== stored.email || (decoded.expiresAt ?? 0) < Date.now()) {
      return null;
    }
    return stored.email;
  } catch {
    return null;
  }
}

export function clearLocalResetToken() {
  try {
    window.localStorage.removeItem(RESET_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}
