"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
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
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useApp();
  const initialRole = searchParams.get("role") === "vendor" ? "vendor" : "customer";
  const [role, setRole] = useState<"customer" | "vendor">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
  ];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (passwordChecks.some((check) => !check.valid)) {
      setError("Your password does not meet the requirements below.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!terms) {
      setError("Please accept the terms to create an account.");
      return;
    }
    setLoading(true);
    const result = await signUp({ name, email, password, role, image });
    setLoading(false);
    if (!result.ok || !result.role) {
      setError(result.error ?? "Could not create your account.");
      return;
    }
    toast.success(
      role === "vendor"
        ? "Vendor account created. Let's set up your menu!"
        : "Welcome to PizzaHub! Your account is ready.",
    );
    router.push(role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer");
  }

  function googleSignUp() {
    toast.info("Google sign-up will be connected to Better Auth in the backend build.");
  }

  return (
    <AuthShell>
      <div>
        <Badge variant="secondary" className="mb-3">
          Join PizzaHub
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Order from local favourites, or open a shopfront for your own pizzeria.
        </p>
      </div>

      <Button type="button" variant="outline" className="mt-5 w-full" onClick={googleSignUp}>
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          or use your email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <div>
          <Label>Account type</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "customer" as const,
                label: "Customer",
                description: "Order pizzas",
                icon: UserRound,
              },
              {
                value: "vendor" as const,
                label: "Vendor",
                description: "Sell pizzas",
                icon: Store,
              },
            ].map((option) => {
              const Icon = option.icon;
              const active = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                    active
                      ? "border-primary bg-[#fdf0eb] shadow-[0_0_0_1px_rgba(219,58,31,0.15)]"
                      : "border-border bg-card hover:bg-cream",
                  )}
                  aria-pressed={active}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-lg",
                      active ? "bg-primary text-white" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{option.label}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="size-3" /> Admin accounts cannot be created publicly.
          </p>
        </div>

        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Jamie Rivera"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="new-password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                className="pl-10 pr-10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Repeat password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-1 sm:grid-cols-3">
          {passwordChecks.map((check) => (
            <span
              key={check.label}
              className={cn(
                "flex items-center gap-1 text-[10px] font-medium",
                check.valid ? "text-[#2f6b4f]" : "text-muted-foreground",
              )}
            >
              <Check className={cn("size-3", !check.valid && "opacity-40")} /> {check.label}
            </span>
          ))}
        </div>

        <div>
          <Label htmlFor="image">Profile image URL (optional)</Label>
          <Input
            id="image"
            placeholder="https://example.com/avatar.jpg"
            value={image}
            onChange={(event) => setImage(event.target.value)}
          />
        </div>

        {role === "vendor" && (
          <div className="rounded-xl border border-[#efd9b7] bg-[#fff8eb] p-3 text-[11px] leading-5 text-[#6f4a17]">
            New vendor shops start on the Free plan (up to 3 active menu items). You can add
            your business name and upgrade later from the vendor dashboard.
          </div>
        )}

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <label className="flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
          <input
            type="checkbox"
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
            className="mt-0.5 size-3.5 rounded border-input accent-[#db3a1f]"
          />
          <span>
            I agree to the PizzaHub terms of service and privacy policy, and confirm the
            information above is accurate.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"} <ArrowRight />
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
