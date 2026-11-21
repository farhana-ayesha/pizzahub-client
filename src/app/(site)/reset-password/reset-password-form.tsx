"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { AuthShell } from "@/components/auth-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useApp();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
  ];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }
    if (checks.some((check) => !check.valid)) {
      setError("Your new password does not meet the requirements below.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Could not reset your password.");
      return;
    }
    toast.success("Password updated. Sign in with your new password.");
    router.push("/login");
  }

  if (!token) {
    return (
      <AuthShell>
        <div>
          <Badge variant="secondary" className="mb-3">
            Account recovery
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Reset link needed
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This page needs a valid reset link. Request a fresh one and try again.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/forgot-password">
                Request a reset link <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">
                <ArrowLeft /> Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div>
        <Badge variant="secondary" className="mb-3">
          Account recovery
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Pick something memorable and secure. You&apos;ll use it the next time you sign in.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a new password"
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
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-1 sm:grid-cols-3">
          {checks.map((check) => (
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

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Updating password…" : "Update password"} <ArrowRight />
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
