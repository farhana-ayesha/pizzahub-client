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
  remoteSignIn,
  remoteSignOut,
  remoteSignUp,
  type RemoteAuthUser,
} from "@/lib/auth-client";
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

type Result = { ok: boolean; error?: string };
type AuthResult = Result & { role?: Role };

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

interface AppContextValue extends DemoState {
  currentUser: User | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    role: "customer" | "vendor";
    image?: string;
  }) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (input: ProfileInput) => Result;
  addMenuItem: (input: NewMenuItemInput) => Result & { id?: string };
  updateMenuItem: (id: string, input: NewMenuItemInput) => Result;
  deleteMenuItem: (id: string) => Result;
  setMenuStatus: (id: string, status: MenuItem["status"]) => Result;
  toggleMenuItemActive: (id: string, active: boolean) => Result;
  createOrder: (input: NewOrderInput) => Result & { id?: string };
  cancelOrder: (id: string) => Result;
  updateOrderStatus: (id: string, status: OrderStatus) => Result;
  toggleBlockUser: (id: string) => Result;
  upgradeSubscription: () => Result & { transactionId?: string };
}

const AppContext = createContext<AppContextValue | null>(null);

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
      `https://i.pravatar.cc/150?u=${encodeURIComponent(email || remote.id)}`,
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
  const [state, setState] = useState<DemoState>(demoState);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage is only available in the browser, so the stored demo state is loaded
    // once after mount. Deferring the updates keeps this a single non-cascading commit.
    let cancelled = false;
    const stored = readStoredState();
    let localSession: string | null = null;
    try {
      localSession = window.localStorage.getItem(SESSION_KEY);
    } catch {
      // Ignore unavailable storage.
    }

    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      setState(stored);

      let sessionId =
        localSession && stored.users.some((user) => user.id === localSession)
          ? localSession
          : null;

      // When a Better Auth server is configured, its session is the source of
      // truth. The local demo session is ignored so stale accounts can never
      // keep access after signing out on the server.
      if (remoteAuthEnabled) {
        sessionId = null;
        const remoteUser = await getRemoteSession();
        if (cancelled) return;
        if (remoteUser) {
          const mapped = mapRemoteUser(remoteUser);
          setState((prev) => ({
            ...prev,
            users: upsertUser(prev.users, mapped),
          }));
          sessionId = mapped.id;
        }
      }

      if (cancelled) return;
      setCurrentUserId(sessionId);
      setHydrated(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(state));
    } catch {
      // Storage can be full or unavailable; the demo still works in memory.
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
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

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === currentUserId) ?? null,
    [state.users, currentUserId],
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
          setState((prev) => ({
            ...prev,
            users: upsertUser(prev.users, mapped),
          }));
          setCurrentUserId(mapped.id);
          return { ok: true, role: mapped.role };
        } catch (error) {
          return {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Email or password is incorrect.",
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
    [state.users],
  );

  const signUp = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: "customer" | "vendor";
      image?: string;
    }): Promise<AuthResult> => {
      if (
        input.password.length < 6 ||
        !/[A-Z]/.test(input.password) ||
        !/[a-z]/.test(input.password)
      ) {
        return {
          ok: false,
          error: "Password must be 6+ characters with one uppercase and one lowercase letter.",
        };
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
          setState((prev) => ({
            ...prev,
            users: upsertUser(prev.users, mapped),
          }));
          setCurrentUserId(mapped.id);
          return { ok: true, role: mapped.role };
        } catch (error) {
          return {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not create your account.",
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
    [state.users],
  );

  const signOut = useCallback(() => {
    setCurrentUserId(null);
    if (remoteAuthEnabled) {
      void remoteSignOut();
    }
  }, []);

  const updateProfile = useCallback(
    (input: ProfileInput): Result => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };
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
    (input: NewMenuItemInput): Result & { id?: string } => {
      if (!currentUser || currentUser.role !== "vendor") {
        return { ok: false, error: "Only vendors can add menu items." };
      }
      if (currentUser.isBlocked) {
        return { ok: false, error: "Blocked accounts cannot publish menu items." };
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
    [currentUser, state.menuItems],
  );

  const updateMenuItem = useCallback(
    (id: string, input: NewMenuItemInput): Result => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };
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
    [currentUser, state.menuItems],
  );

  const deleteMenuItem = useCallback(
    (id: string): Result => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };
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
    [currentUser, state.menuItems],
  );

  const setMenuStatus = useCallback(
    (id: string, status: MenuItem["status"]): Result => {
      if (!currentUser || currentUser.role !== "admin") {
        return { ok: false, error: "Only admins can review menu items." };
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
    [currentUser],
  );

  const toggleMenuItemActive = useCallback(
    (id: string, active: boolean): Result => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };
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
    [currentUser, state.menuItems],
  );

  const createOrder = useCallback(
    (input: NewOrderInput): Result & { id?: string } => {
      if (!currentUser) return { ok: false, error: "Sign in to place an order." };
      if (currentUser.isBlocked) {
        return { ok: false, error: "Blocked accounts cannot place orders." };
      }
      if (currentUser.role === "admin") {
        return { ok: false, error: "Admins cannot place customer orders." };
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
    [currentUser, state.menuItems, state.orders],
  );

  const cancelOrder = useCallback(
    (id: string): Result => {
      if (!currentUser) return { ok: false, error: "You must be signed in." };
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
    [currentUser, state.orders],
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus): Result => {
      if (!currentUser || currentUser.role !== "vendor") {
        return { ok: false, error: "Only vendors can update orders." };
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
    [currentUser, state.orders],
  );

  const toggleBlockUser = useCallback(
    (id: string): Result => {
      if (!currentUser || currentUser.role !== "admin") {
        return { ok: false, error: "Only admins can manage users." };
      }
      if (id === currentUser.id) {
        return { ok: false, error: "You cannot block your own admin account." };
      }
      setState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === id ? { ...user, isBlocked: !user.isBlocked } : user,
        ),
      }));
      return { ok: true };
    },
    [currentUser],
  );

  const upgradeSubscription = useCallback((): Result & { transactionId?: string } => {
    if (!currentUser || currentUser.role !== "vendor") {
      return { ok: false, error: "Only vendors can upgrade their plan." };
    }
    const transactionId = `t-${Date.now()}`;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const transaction: Transaction = {
      id: transactionId,
      vendorId: currentUser.id,
      plan: "premium",
      amount: 29,
      currency: "usd",
      stripeSessionId: `cs_test_demo_${transactionId}`,
      stripeSubscriptionId: `sub_demo_${currentUser.id}`,
      status: "succeeded",
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === currentUser.id
          ? {
              ...user,
              subscriptionPlan: "premium",
              subscriptionExpiresAt: expires.toISOString(),
            }
          : user,
      ),
      transactions: [transaction, ...prev.transactions],
    }));
    return { ok: true, transactionId };
  }, [currentUser]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      currentUser,
      hydrated,
      signIn,
      signUp,
      signOut,
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
    }),
    [
      state,
      currentUser,
      hydrated,
      signIn,
      signUp,
      signOut,
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
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
