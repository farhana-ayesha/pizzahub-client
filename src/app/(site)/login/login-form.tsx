"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { AuthShell } from "@/components/auth-shell";
import { GoogleIcon } from "@/components/google-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAccounts } from "@/lib/data";
import { cn } from "@/lib/utils";

const roleIcons = {
  customer: UserRound,
  vendor: Store,
  admin: ShieldCheck,
};

const dashboardPath = {
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
  admin: "/dashboard/admin",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, currentUser, hydrated } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const redirect = searchParams.get("redirect");
  const redirectPath =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

  async function submit(event?: React.FormEvent, demoEmail?: string, demoPassword?: string) {
    event?.preventDefault();
    setError("");
    const loginEmail = demoEmail ?? email;
    const loginPassword = demoPassword ?? password;
    if (!loginEmail || !loginPassword) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(demoEmail ? demoEmail : "form");
    const result = await signIn(loginEmail, loginPassword);
    setLoading(null);
    if (!result.ok || !result.role) {
      setError(result.error ?? "Could not sign you in.");
      return;
    }
    toast.success("Welcome back to PizzaHub!");
    router.push(redirectPath ?? dashboardPath[result.role]);
  }

  function signInWithDemo(account: (typeof demoAccounts)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    void submit(undefined, account.email, account.password);
  }

  function googleSignIn() {
    toast.info("Google OAuth will be connected to Better Auth in the backend build.");
  }

  return (
    <AuthShell>
      <div>
        <Badge variant="secondary" className="mb-3">
          Welcome back
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Pick up where you left off, track an order, or manage your shop.
        </p>
      </div>

      {hydrated && currentUser && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#b9dfc9] bg-[#eef8f1] p-3 text-xs">
          <span className="font-medium text-[#24553b]">
            You&apos;re signed in as {currentUser.name}.
          </span>
          <Button asChild size="sm" variant="outline" className="h-8 bg-white">
            <Link href={dashboardPath[currentUser.role]}>Dashboard</Link>
          </Button>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="mt-6 w-full"
        onClick={googleSignIn}
      >
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          or sign in with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-10"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => toast.info("Password reset will be connected to Better Auth.")}
              className="mb-1.5 text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              className="pl-10 pr-11"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading !== null}>
          {loading === "form" ? "Signing in…" : "Sign in"} <ArrowRight />
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        New to PizzaHub?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-[#fffaf4] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Demo accounts
          </p>
          <span className="text-[10px] text-muted-foreground">Password: Password123</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {demoAccounts.map((account) => {
            const Icon = roleIcons[account.role];
            const busy = loading === account.email;
            return (
              <button
                key={account.role}
                type="button"
                onClick={() => signInWithDemo(account)}
                disabled={loading !== null}
                className={cn(
                  "rounded-xl border border-border bg-card p-2.5 text-left transition hover:border-primary/40 hover:bg-cream disabled:opacity-60",
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Icon className="size-3.5 text-primary" /> {account.label}
                </span>
                <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                  {busy ? "Signing in…" : account.email}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
          Admin accounts are provisioned securely and cannot be created from the public form.
          Try <span className="font-semibold">blocked@example.com</span> to see the blocked-user
          error.
        </p>
      </div>
    </AuthShell>
  );
}
