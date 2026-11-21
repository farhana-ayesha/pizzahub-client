"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { AuthShell } from "@/components/auth-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | undefined>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Could not send the reset link.");
      return;
    }
    setResetLink(result.resetLink);
    setSent(true);
    toast.success("Reset instructions are ready.");
  }

  return (
    <AuthShell>
      <div>
        <Badge variant="secondary" className="mb-3">
          Account recovery
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the email linked to your PizzaHub account and we&apos;ll send you a secure
          reset link.
        </p>
      </div>

      {sent ? (
        <div className="mt-6 rounded-2xl border border-[#b9dfc9] bg-[#eef8f1] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#2f6b4f]" />
            <div>
              <p className="text-sm font-bold text-[#24553b]">Check your inbox</p>
              <p className="mt-1 text-xs leading-5 text-[#4c7a60]">
                If an account exists for <span className="font-semibold">{email}</span>, a
                password reset link is on its way. The link expires in 15 minutes.
              </p>
            </div>
          </div>
          {resetLink && (
            <div className="mt-4 rounded-xl bg-white p-3">
              <p className="text-[11px] font-semibold text-[#24553b]">
                Demo mode: no email service is configured, so use the link below.
              </p>
              <Button asChild size="sm" className="mt-2">
                <Link href={resetLink}>
                  Open reset form <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 bg-white"
            onClick={() => {
              setSent(false);
              setResetLink(undefined);
            }}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <Label htmlFor="reset-email">Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-email"
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

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending reset link…" : "Send reset link"} <ArrowRight />
          </Button>
        </form>
      )}

      <div className="mt-5 flex flex-col gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-center">
        <Link href="/login" className="inline-flex items-center justify-center gap-1 font-semibold text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
        <span className="hidden sm:inline">·</span>
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}
