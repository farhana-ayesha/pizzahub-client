"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Crown,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PaymentSuccess() {
  const router = useRouter();
  const { hydrated, currentUser, transactions } = useApp();

  useEffect(() => {
    if (hydrated && !currentUser) router.replace("/login?redirect=/payment/success");
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) {
    return (
      <div className="container-page py-20 text-center text-sm text-muted-foreground">
        Confirming your payment…
      </div>
    );
  }

  if (currentUser.role !== "vendor") {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-8 text-center">
          <Store className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 text-2xl font-extrabold">Vendor subscriptions only</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Premium subscriptions are available to restaurant accounts. Customer food orders are
            paid on delivery.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/customer">Go to my dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const transaction = transactions
    .filter((entry) => entry.vendorId === currentUser.id && entry.status === "succeeded")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#e5f2ea] text-[#2f6b4f] ring-8 ring-[#f1faf5]">
            <CheckCircle2 className="size-10" />
          </span>
          <Badge variant="premium" className="mt-5">
            <Crown className="size-3" /> Premium activated
          </Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            You&apos;re on Premium!
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            Your shop now has unlimited menu space, a Premium badge and featured placement on the
            homepage.
          </p>
        </div>

        <Card className="mt-7 overflow-hidden">
          <div className="border-b border-border bg-[#fffaf4] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Payment confirmation
                </p>
                <p className="mt-1 text-lg font-extrabold">{currentUser.businessName}</p>
              </div>
              <Badge variant="success">Succeeded</Badge>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <CreditCard className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Amount charged</p>
                <p className="font-bold">{formatCurrency(transaction?.amount ?? 29)} USD</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Next renewal</p>
                <p className="font-bold">
                  {currentUser.subscriptionExpiresAt
                    ? formatDate(currentUser.subscriptionExpiresAt)
                    : "In 12 months"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 text-[#b67a1d]" />
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="font-bold">Premium · $29/month</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 text-[#2f6b4f]" />
              <div>
                <p className="text-xs text-muted-foreground">Transaction</p>
                <p className="max-w-48 truncate font-mono text-xs font-semibold">
                  {transaction?.stripeSessionId ?? "cs_test_demo"}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-border bg-[#fdf8f2] px-5 py-3 text-[11px] leading-5 text-muted-foreground">
            In production, Premium is activated only after a verified Stripe webhook. A success
            redirect alone is never trusted.
          </div>
        </Card>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg" variant="gold">
            <Link href="/dashboard/vendor/subscription">
              View subscription <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/vendor">
              Back to dashboard <Store />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
