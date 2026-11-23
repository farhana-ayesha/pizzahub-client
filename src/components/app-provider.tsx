"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { demoState } from "@/lib/data";
import {
  getRemoteSession,
  normalizeRole,
  remoteAuthEnabled,
  remoteChangePassword,
  remoteRequestPasswordReset,
  remoteResetPassword,
  remoteSignIn,
  remoteSignOut,
  remoteSignUp,
  type RemoteAuthUser,
} from "@/lib/auth-client";
import { apiErrorMessage, apiFetch, clearAccessToken, primeAccessToken } from "@/lib/api";
import {
  clearLocalResetToken,
  createLocalResetToken,
  readLocalResetToken,
} from "@/lib/password-reset";
import type {
  DemoState,
  MenuItem,
  Order,
  OrderStatus,
  Role,
  Transaction,
  User,
} from "@/lib/types";

const DATA_KEY = "pizzahub-demo-v1";
const SESSION_KEY = "pizzahub-session-v1";
const FAVOURITES_KEY = "pizzahub-favourites-v1";

type Result = { ok: boolean; error?: string };
type AuthResult = Result & { role?: Role };
type RedirectResult = Result & { url?: string };

interface ProfileInput {
  name: string;
  image: string;
  phone?: string;
  location?: string;
  businessName?: string;
}

interface NewMenuItemInput {
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
}

interface NewOrderInput {
  itemId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
  quantity: number;
}

interface RemoteStatePayload {
  currentUser?: RemoteAuthUser | null;
  users?: RemoteAuthUser[];
  menuItems?: MenuItem[];
  orders?: Order[];
  transactions?: Transaction[];
}

interface AppContextValue extends DemoState {
  currentUser: User | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  favourites: string[];
  toggleFavourite: (itemId: string) => Result;
  isFavourite: (itemId: string) => boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    role: "customer" | "vendor";
    image?: string;
  }) => Promise<AuthResult>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<Result & { resetLink?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<Result>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
  updateProfile: (input: ProfileInput) => Promise<Result>;
  addMenuItem: (input: NewMenuItemInput) => Promise<Result & { id?: string }>;
  updateMenuItem: (id: string, input: NewMenuItemInput) => Promise<Result>;
  deleteMenuItem: (id: string) => Promise<Result>;
  setMenuStatus: (id: string, status: MenuItem["status"]) => Promise<Result>;
  toggleMenuItemActive: (id: string, active: boolean) => Promise<Result>;
  createOrder: (input: NewOrderInput) => Promise<Result & { id?: string }>;
  cancelOrder: (id: string) => Promise<Result>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Result>;
  toggleBlockUser: (id: string) => Promise<Result>;
  upgradeSubscription: () => Promise<RedirectResult>;
  openBillingPortal: () => Promise<RedirectResult>;
}

const AppContext = createContext<AppContextValue | null>(null);

const EMPTY_STATE: DemoState = {
  users: [],
  menuItems: [],
  orders: [],
  transactions: [],
};

function readStoredState(): DemoState {
  if (typeof window === "undefined") return demoState;
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (!raw) return demoState;
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return {
      users: Array.isArray(parsed.users) && parsed.users.length ? parsed.users : demoState.users,
      menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems : demoState.menuItems,
      orders: Array.isArray(parsed.orders) ? parsed.orders : demoState.orders,
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : demoState.transactions,
    };
  } catch {
    return demoState;
  }
}

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

function readStoredFavourites(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FAVOURITES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: Record<string, string[]> = {};
    Object.entries(parsed).forEach(([userId, value]) => {
      if (Array.isArray(value)) {
        result[userId] = value.filter((entry): entry is string => typeof entry === "string");
      }
    });
    return result;
  } catch {
    return {};
  }
}

function mapRemoteUser(remote: RemoteAuthUser, fallback?: User): User {
  const email = remote.email || fallback?.email || "";
  return {
    id: remote.id || fallback?.id || `u-${Date.now()}`,
    name: remote.name || fallback?.name || "PizzaHub user",
    email,
    password: "",
    image:
      remote.image ||
      fallback?.image ||
      (email
        ? `https://i.pravatar.cc/150?u=${encodeURIComponent(email || remote.id)}`
        : ""),
    role: normalizeRole(remote.role ?? fallback?.role),
    isBlocked: Boolean(remote.isBlocked ?? fallback?.isBlocked),
    businessName: remote.businessName ?? fallback?.businessName,
    subscriptionPlan:
      remote.subscriptionPlan === "premium" || remote.subscriptionPlan === "free"
        ? remote.subscriptionPlan
        : fallback?.subscriptionPlan,
    subscriptionExpiresAt:
      remote.subscriptionExpiresAt ?? fallback?.subscriptionExpiresAt,
    phone: remote.phone ?? fallback?.phone,
    location: remote.location ?? fallback?.location,
    createdAt: remote.createdAt ?? fallback?.createdAt ?? new Date().toISOString(),
  };
}

function mapRemoteState(payload: RemoteStatePayload): DemoState {
  return {
    users: Array.isArray(payload.users)
      ? payload.users.map((entry) => mapRemoteUser(entry))
      : [],
    menuItems: Array.isArray(payload.menuItems) ? payload.menuItems : [],
    orders: Array.isArray(payload.orders) ? payload.orders : [],
    transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
  };
}

function isStrongPassword(value: string) {
  return value.length >= 6 && /[A-Z]/.test(value) && /[a-z]/.test(value);
}

const passwordRuleMessage =
  "Password must be 6+ characters with one uppercase and one lowercase letter.";

function upsertUser(users: User[], incoming: User) {
  const exists = users.some((user) => user.id === incoming.id);
  if (!exists) return [...users, incoming];
  return users.map((user) =>
    user.id === incoming.id
      ? { ...user, ...incoming, password: user.password || incoming.password }
      : user,
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() =>
    remoteAuthEnabled ? EMPTY_STATE : demoState,
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [favouritesByUser, setFavouritesByUser] = useState<Record<string, string[]>>({});
  const [hydrated, setHydrated] = useState(false);

  /**
   * Loads the scoped snapshot for the current session. The server decides which
   * records a visitor, customer, vendor or admin is allowed to see.
   */
  const refreshState = useCallback(async (): Promise<RemoteStatePayload> => {
    const payload = await apiFetch<RemoteStatePayload>("/api/state");
    const next = mapRemoteState(payload);
    if (payload.currentUser) {
      const self = mapRemoteUser(payload.currentUser);
      next.users = upsertUser(next.users, self);
      setState(next);
      setCurrentUserId(self.id);
    } else {
      setState(next);
      setCurrentUserId(null);
    }
    return payload;
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (remoteAuthEnabled) {
      (async () => {
        const remoteUser = await getRemoteSession();
        if (cancelled) return;
        if (remoteUser) await primeAccessToken();
        if (cancelled) return;

        try {
          const payload = await apiFetch<RemoteStatePayload>("/api/state");
          if (cancelled) return;
          const next = mapRemoteState(payload);
          const sessionUser = payload.currentUser ?? remoteUser ?? null;
          if (sessionUser) {
            const self = mapRemoteUser(sessionUser);
            next.users = upsertUser(next.users, self);
            setState(next);
            setCurrentUserId(self.id);
          } else {
            setState(next);
            setCurrentUserId(null);
          }
        } catch {
          if (remoteUser) {
            const self = mapRemoteUser(remoteUser);
            setState({ ...EMPTY_STATE, users: [self] });
            setCurrentUserId(self.id);
          } else {
            setState(EMPTY_STATE);
            setCurrentUserId(null);
          }
        } finally {
          if (!cancelled) setHydrated(true);
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    // localStorage is only available in the browser, so the stored demo state is
    // loaded once after mount. Deferring the update keeps this a single
    // non-cascading commit.
    const stored = readStoredState();
    let localSession: string | null = null;
    try {
      localSession = window.localStorage.getItem(SESSION_KEY);
    } catch {
      // Ignore unavailable storage.
    }

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setState(stored);
      setFavouritesByUser(readStoredFavourites());
      setCurrentUserId(
        localSession && stored.users.some((user) => user.id === localSession)
          ? localSession
          : null,
      );
      setHydrated(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || remoteAuthEnabled) return;
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(state));
    } catch {
      // Storage can be full or unavailable; the demo still works in memory.
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated || remoteAuthEnabled) return;
    try {
      if (currentUserId) {
        window.localStorage.setItem(SESSION_KEY, currentUserId);
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore unavailable storage.
    }
  }, [currentUserId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favouritesByUser));
    } catch {
      // Ignore unavailable storage.
    }
  }, [favouritesByUser, hydrated]);

  const refresh = useCallback(async () => {
    if (!remoteAuthEnabled) return;
    await refreshState();
  }, [refreshState]);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === currentUserId) ?? null,
    [state.users, currentUserId],
  );

  const favourites = useMemo(() => {
    if (!currentUserId) return [];
    const ids = favouritesByUser[currentUserId] ?? [];
    return ids.filter((id) => state.menuItems.some((menuItem) => menuItem.id === id));
  }, [currentUserId, favouritesByUser, state.menuItems]);

  const isFavourite = useCallback(
    (itemId: string) => favourites.includes(itemId),
    [favourites],
  );

  const toggleFavourite = useCallback(
    (itemId: string): Result => {
      if (!currentUser) return { ok: false, error: "Sign in to save favourites." };
      if (currentUser.role !== "customer") {
        return { ok: false, error: "Only customers can save favourites." };
      }
      if (!state.menuItems.some((menuItem) => menuItem.id === itemId)) {
        return { ok: false, error: "Menu item not found." };
      }
      setFavouritesByUser((prev) => {
        const existing = prev[currentUser.id] ?? [];
        const next = existing.includes(itemId)
          ? existing.filter((id) => id !== itemId)
          : [...existing, itemId];
        return { ...prev, [currentUser.id]: next };
      });
      return { ok: true };
    },
    [currentUser, state.menuItems],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (remoteAuthEnabled) {
        try {
          const remoteUser = await remoteSignIn(email.trim(), password);
          const existing = state.users.find(
            (user) => user.id === remoteUser.id || user.email === remoteUser.email,
          );
          const mapped = mapRemoteUser(remoteUser, existing);
          if (mapped.isBlocked) {
            return {
              ok: false,
              error: "This account has been blocked. Please contact support.",
            };
          }
          await primeAccessToken(true);
          try {
            await refreshState();
          } catch {
            setState((prev) => ({
              ...prev,
              users: upsertUser(prev.users, mapped),
            }));
            setCurrentUserId(mapped.id);
          }
          return { ok: true, role: mapped.role };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Email or password is incorrect."),
          };
        }
      }

      await wait();
      const found = state.users.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!found || found.password !== password) {
        return { ok: false, error: "Email or password is incorrect." };
      }
      if (found.isBlocked) {
        return {
          ok: false,
          error: "This account has been blocked. Please contact support.",
        };
      }
      setCurrentUserId(found.id);
      return { ok: true, role: found.role };
    },
    [refreshState, state.users],
  );

  const signUp = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: "customer" | "vendor";
      image?: string;
    }): Promise<AuthResult> => {
      if (!isStrongPassword(input.password)) {
        return { ok: false, error: passwordRuleMessage };
      }

      if (remoteAuthEnabled) {
        try {
          const remoteUser = await remoteSignUp({
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            password: input.password,
            role: input.role,
            image: input.image?.trim() || undefined,
          });
          const mapped = mapRemoteUser(remoteUser, {
            id: remoteUser.id,
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            password: "",
            image: input.image?.trim() || "",
            role: input.role,
            isBlocked: false,
            businessName:
              input.role === "vendor" ? `${input.name.trim()}'s Pizzeria` : undefined,
            subscriptionPlan: input.role === "vendor" ? "free" : undefined,
            createdAt: new Date().toISOString(),
          });
          await primeAccessToken(true);
          try {
            await refreshState();
          } catch {
            setState((prev) => ({
              ...prev,
              users: upsertUser(prev.users, mapped),
            }));
            setCurrentUserId(mapped.id);
          }
          return { ok: true, role: mapped.role };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not create your account."),
          };
        }
      }

      await wait(500);
      if (state.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
        return { ok: false, error: "An account with this email already exists." };
      }
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        image:
          input.image?.trim() ||
          `https://i.pravatar.cc/150?u=${encodeURIComponent(input.email)}`,
        role: input.role,
        isBlocked: false,
        businessName: input.role === "vendor" ? `${input.name.trim()}'s Pizzeria` : undefined,
        subscriptionPlan: input.role === "vendor" ? "free" : undefined,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
      setCurrentUserId(newUser.id);
      return { ok: true, role: newUser.role };
    },
    [refreshState, state.users],
  );

  const signOut = useCallback(() => {
    setCurrentUserId(null);
    clearAccessToken();
    if (remoteAuthEnabled) {
      void (async () => {
        await remoteSignOut();
        try {
          await refreshState();
        } catch {
          setState(EMPTY_STATE);
        }
      })();
    }
  }, [refreshState]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<Result & { resetLink?: string }> => {
      const normalized = email.trim().toLowerCase();

      if (remoteAuthEnabled) {
        try {
          await remoteRequestPasswordReset(
            normalized,
            `${window.location.origin}/reset-password`,
          );
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not send the reset email."),
          };
        }
      }

      await wait(400);
      const found = state.users.find((user) => user.email.toLowerCase() === normalized);
      if (!found) {
        // Do not reveal whether an account exists.
        return { ok: true };
      }
      const token = createLocalResetToken(found.email);
      return {
        ok: true,
        resetLink: `/reset-password?token=${encodeURIComponent(token)}`,
      };
    },
    [state.users],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<Result> => {
      if (!isStrongPassword(newPassword)) {
        return { ok: false, error: passwordRuleMessage };
      }

      if (remoteAuthEnabled) {
        try {
          await remoteResetPassword(token, newPassword);
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "This reset link is invalid or expired."),
          };
        }
      }

      const email = readLocalResetToken(token);
      if (!email) {
        return { ok: false, error: "This reset link is invalid or expired." };
      }
      const found = state.users.find((user) => user.email.toLowerCase() === email);
      if (!found) {
        return { ok: false, error: "This account no longer exists." };
      }
      setState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === found.id ? { ...user, password: newPassword } : user,
        ),
      }));
      clearLocalResetToken();
      return { ok: true };
    },
    [state.users],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };
      if (!isStrongPassword(newPassword)) {
        return { ok: false, error: passwordRuleMessage };
      }
      if (currentPassword === newPassword) {
        return {
          ok: false,
          error: "Choose a new password that is different from your current one.",
        };
      }

      if (remoteAuthEnabled) {
        try {
          await remoteChangePassword(currentPassword, newPassword);
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not change your password."),
          };
        }
      }

      if (currentUser.password !== currentPassword) {
        return { ok: false, error: "Current password is incorrect." };
      }
      setState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === currentUser.id ? { ...user, password: newPassword } : user,
        ),
      }));
      return { ok: true };
    },
    [currentUser],
  );

  const updateProfile = useCallback(
    async (input: ProfileInput): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };

      if (remoteAuthEnabled) {
        try {
          const data = await apiFetch<{ user: RemoteAuthUser }>("/api/profile", {
            method: "PATCH",
            body: JSON.stringify({
              name: input.name.trim(),
              image: input.image.trim(),
              phone: input.phone ?? "",
              location: input.location ?? "",
              ...(currentUser.role === "vendor"
                ? { businessName: input.businessName?.trim() }
                : {}),
            }),
          });
          const mapped = mapRemoteUser(data.user, currentUser);
          setState((prev) => ({
            ...prev,
            users: upsertUser(prev.users, mapped),
          }));
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not update your profile."),
          };
        }
      }

      setState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                name: input.name.trim(),
                image: input.image.trim() || user.image,
                phone: input.phone,
                location: input.location,
                businessName:
                  user.role === "vendor"
                    ? input.businessName?.trim() || user.businessName
                    : user.businessName,
              }
            : user,
        ),
      }));
      return { ok: true };
    },
    [currentUser],
  );

  const addMenuItem = useCallback(
    async (input: NewMenuItemInput): Promise<Result & { id?: string }> => {
      if (!currentUser || currentUser.role !== "vendor") {
        return { ok: false, error: "Only vendors can add menu items." };
      }
      if (currentUser.isBlocked) {
        return { ok: false, error: "Blocked accounts cannot publish menu items." };
      }

      if (remoteAuthEnabled) {
        try {
          const data = await apiFetch<{ item: MenuItem }>("/api/vendor/menu", {
            method: "POST",
            body: JSON.stringify(input),
          });
          await refreshState();
          return { ok: true, id: data.item.id };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not save the menu item."),
          };
        }
      }

      const activeCount = state.menuItems.filter(
        (menuItem) =>
          menuItem.vendorId === currentUser.id &&
          menuItem.active &&
          menuItem.status === "approved",
      ).length;
      if (currentUser.subscriptionPlan !== "premium" && activeCount >= 3) {
        return {
          ok: false,
          error: "Your free plan allows 3 active items. Upgrade to Premium to add more.",
        };
      }
      const id = `m-${Date.now()}`;
      const newItem: MenuItem = {
        id,
        vendorId: currentUser.id,
        itemName: input.itemName.trim(),
        category: input.category,
        description: input.description.trim(),
        price: input.price,
        location: input.location.trim(),
        images: input.images,
        status: "pending",
        active: true,
        rating: 0,
        reviewsCount: 0,
        prepTime: "20–25 min",
        tags: ["New"],
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, menuItems: [newItem, ...prev.menuItems] }));
      return { ok: true, id };
    },
    [currentUser, refreshState, state.menuItems],
  );

  const updateMenuItem = useCallback(
    async (id: string, input: NewMenuItemInput): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };

      if (remoteAuthEnabled) {
        try {
          await apiFetch(`/api/vendor/menu/${id}`, {
            method: "PATCH",
            body: JSON.stringify(input),
          });
          await refreshState();
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not update the menu item."),
          };
        }
      }

      const target = state.menuItems.find((menuItem) => menuItem.id === id);
      if (!target) return { ok: false, error: "Menu item not found." };
      if (target.vendorId !== currentUser.id) {
        return { ok: false, error: "You can only edit your own menu items." };
      }
      setState((prev) => ({
        ...prev,
        menuItems: prev.menuItems.map((menuItem) =>
          menuItem.id === id
            ? {
                ...menuItem,
                itemName: input.itemName.trim(),
                category: input.category,
                description: input.description.trim(),
                price: input.price,
                location: input.location.trim(),
                images: input.images,
                status: menuItem.status === "rejected" ? "pending" : menuItem.status,
              }
            : menuItem,
        ),
      }));
      return { ok: true };
    },
    [currentUser, refreshState, state.menuItems],
  );

  const deleteMenuItem = useCallback(
    async (id: string): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };

      if (remoteAuthEnabled) {
        try {
          await apiFetch(
            currentUser.role === "admin"
              ? `/api/admin/menu/${id}`
              : `/api/vendor/menu/${id}`,
            { method: "DELETE" },
          );
          await refreshState();
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not delete the menu item."),
          };
        }
      }

      const target = state.menuItems.find((menuItem) => menuItem.id === id);
      if (!target) return { ok: false, error: "Menu item not found." };
      if (currentUser.role !== "admin" && target.vendorId !== currentUser.id) {
        return { ok: false, error: "You can only delete your own menu items." };
      }
      setState((prev) => ({
        ...prev,
        menuItems: prev.menuItems.filter((menuItem) => menuItem.id !== id),
      }));
      return { ok: true };
    },
    [currentUser, refreshState, state.menuItems],
  );

  const setMenuStatus = useCallback(
    async (id: string, status: MenuItem["status"]): Promise<Result> => {
      if (!currentUser || currentUser.role !== "admin") {
        return { ok: false, error: "Only admins can review menu items." };
      }

      if (remoteAuthEnabled) {
        try {
          await apiFetch(`/api/admin/menu/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          await refreshState();
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not update the menu item."),
          };
        }
      }

      setState((prev) => ({
        ...prev,
        menuItems: prev.menuItems.map((menuItem) =>
          menuItem.id === id
            ? {
                ...menuItem,
                status,
                active: status === "approved",
              }
            : menuItem,
        ),
      }));
      return { ok: true };
    },
    [currentUser, refreshState],
  );

  const toggleMenuItemActive = useCallback(
    async (id: string, active: boolean): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };

      if (remoteAuthEnabled) {
        try {
          await apiFetch(`/api/vendor/menu/${id}/availability`, {
            method: "PATCH",
            body: JSON.stringify({ active }),
          });
          await refreshState();
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not update availability."),
          };
        }
      }

      const target = state.menuItems.find((menuItem) => menuItem.id === id);
      if (!target) return { ok: false, error: "Menu item not found." };
      if (currentUser.role === "vendor" && target.vendorId !== currentUser.id) {
        return { ok: false, error: "This item belongs to another vendor." };
      }
      if (currentUser.role === "customer") {
        return { ok: false, error: "You cannot change this item." };
      }
      setState((prev) => ({
        ...prev,
        menuItems: prev.menuItems.map((menuItem) =>
          menuItem.id === id ? { ...menuItem, active } : menuItem,
        ),
      }));
      return { ok: true };
    },
    [currentUser, refreshState, state.menuItems],
  );

  const createOrder = useCallback(
    async (input: NewOrderInput): Promise<Result & { id?: string }> => {
      if (!currentUser) return { ok: false, error: "Sign in to place an order." };
      if (currentUser.isBlocked) {
        return { ok: false, error: "Blocked accounts cannot place orders." };
      }
      if (currentUser.role === "admin") {
        return { ok: false, error: "Admins cannot place customer orders." };
      }

      if (remoteAuthEnabled) {
        try {
          const data = await apiFetch<{ order: Order }>("/api/orders", {
            method: "POST",
            body: JSON.stringify(input),
          });
          await refreshState();
          return { ok: true, id: data.order.id };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not place the order."),
          };
        }
      }

      const target = state.menuItems.find((menuItem) => menuItem.id === input.itemId);
      if (!target || target.status !== "approved" || !target.active) {
        return { ok: false, error: "This item is not available to order." };
      }
      if (target.vendorId === currentUser.id) {
        return { ok: false, error: "You cannot order your own menu items." };
      }
      const duplicate = state.orders.some(
        (order) =>
          order.customerId === currentUser.id &&
          order.itemId === input.itemId &&
          order.deliveryDate === input.deliveryDate &&
          (order.status === "pending" || order.status === "accepted"),
      );
      if (duplicate) {
        return {
          ok: false,
          error: "You already have an active order for this item on that date.",
        };
      }
      const id = `o-${Date.now()}`;
      const newOrder: Order = {
        id,
        itemId: input.itemId,
        vendorId: target.vendorId,
        customerId: currentUser.id,
        deliveryDate: input.deliveryDate,
        deliveryAddress: input.deliveryAddress.trim(),
        message: input.message.trim(),
        status: "pending",
        quantity: input.quantity,
        total: Number((target.price * input.quantity).toFixed(2)),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, orders: [newOrder, ...prev.orders] }));
      return { ok: true, id };
    },
    [currentUser, refreshState, state.menuItems, state.orders],
  );

  const cancelOrder = useCallback(
    async (id: string): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };

      if (remoteAuthEnabled) {
        try {
          await apiFetch(`/api/orders/${id}/cancel`, { method: "PATCH" });
          await refreshState();
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not cancel the order."),
          };
        }
      }

      const order = state.orders.find((entry) => entry.id === id);
      if (!order) return { ok: false, error: "Order not found." };
      if (order.customerId !== currentUser.id) {
        return { ok: false, error: "You can only cancel your own orders." };
      }
      if (order.status !== "pending") {
        return { ok: false, error: "Only pending orders can be cancelled." };
      }
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((entry) =>
          entry.id === id ? { ...entry, status: "cancelled" as OrderStatus } : entry,
        ),
      }));
      return { ok: true };
    },
    [currentUser, refreshState, state.orders],
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus): Promise<Result> => {
      if (!currentUser || currentUser.role !== "vendor") {
        return { ok: false, error: "Only vendors can update orders." };
      }

      if (remoteAuthEnabled) {
        try {
          await apiFetch(`/api/orders/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          await refreshState();
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not update the order."),
          };
        }
      }

      const order = state.orders.find((entry) => entry.id === id);
      if (!order) return { ok: false, error: "Order not found." };
      if (order.vendorId !== currentUser.id) {
        return { ok: false, error: "This order belongs to another vendor." };
      }
      if (order.status !== "pending") {
        return { ok: false, error: "This order has already been processed." };
      }
      if (status !== "accepted" && status !== "rejected") {
        return { ok: false, error: "Invalid order status." };
      }
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((entry) =>
          entry.id === id ? { ...entry, status } : entry,
        ),
      }));
      return { ok: true };
    },
    [currentUser, refreshState, state.orders],
  );

  const toggleBlockUser = useCallback(
    async (id: string): Promise<Result> => {
      if (!currentUser || currentUser.role !== "admin") {
        return { ok: false, error: "Only admins can manage users." };
      }
      if (id === currentUser.id) {
        return { ok: false, error: "You cannot block your own admin account." };
      }

      if (remoteAuthEnabled) {
        try {
          await apiFetch(`/api/admin/users/${id}/block`, { method: "PATCH" });
          await refreshState();
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: apiErrorMessage(error, "Could not update this user."),
          };
        }
      }

      setState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === id ? { ...user, isBlocked: !user.isBlocked } : user,
        ),
      }));
      return { ok: true };
    },
    [currentUser, refreshState],
  );

  const upgradeSubscription = useCallback(async (): Promise<RedirectResult> => {
    if (!currentUser || currentUser.role !== "vendor") {
      return { ok: false, error: "Only vendors can upgrade their plan." };
    }
    if (!remoteAuthEnabled) {
      return {
        ok: false,
        error:
          "Premium upgrades need the PizzaHub API with Stripe configured. Set NEXT_PUBLIC_API_URL and STRIPE_SECRET_KEY to test checkout.",
      };
    }

    try {
      const data = await apiFetch<{ url?: string; sessionId?: string }>(
        "/api/vendor/subscription/checkout",
        { method: "POST" },
      );
      if (!data.url) {
        return { ok: false, error: "Stripe did not return a checkout URL." };
      }
      return { ok: true, url: data.url };
    } catch (error) {
      return {
        ok: false,
        error: apiErrorMessage(error, "Could not start Stripe Checkout."),
      };
    }
  }, [currentUser]);

  const openBillingPortal = useCallback(async (): Promise<RedirectResult> => {
    if (!currentUser || currentUser.role !== "vendor") {
      return { ok: false, error: "Only vendors can manage billing." };
    }
    if (!remoteAuthEnabled) {
      return {
        ok: false,
        error: "Billing management needs the PizzaHub API with Stripe configured.",
      };
    }

    try {
      const data = await apiFetch<{ url?: string }>(
        "/api/vendor/subscription/portal",
        { method: "POST" },
      );
      if (!data.url) {
        return { ok: false, error: "Stripe did not return a billing portal URL." };
      }
      return { ok: true, url: data.url };
    } catch (error) {
      return {
        ok: false,
        error: apiErrorMessage(error, "Could not open the Stripe billing portal."),
      };
    }
  }, [currentUser]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      currentUser,
      hydrated,
      refresh,
      favourites,
      toggleFavourite,
      isFavourite,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      resetPassword,
      changePassword,
      updateProfile,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      setMenuStatus,
      toggleMenuItemActive,
      createOrder,
      cancelOrder,
      updateOrderStatus,
      toggleBlockUser,
      upgradeSubscription,
      openBillingPortal,
    }),
    [
      state,
      currentUser,
      hydrated,
      refresh,
      favourites,
      toggleFavourite,
      isFavourite,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      resetPassword,
      changePassword,
      updateProfile,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      setMenuStatus,
      toggleMenuItemActive,
      createOrder,
      cancelOrder,
      updateOrderStatus,
      toggleBlockUser,
      upgradeSubscription,
      openBillingPortal,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
