"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  CreditCard,
  Crown,
  ShieldCheck,
  Sparkles,
  Store,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { PageHeader } from "@/components/page-header";
import { TransactionStatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

const freeFeatures = [
  "Up to 3 active menu items",
  "Vendor dashboard and order management",
  "Accept or reject customer orders",
  "Standard marketplace placement",
];

const premiumFeatures = [
  "Unlimited active menu items",
  "Premium vendor badge on every card",
  "Featured placement on the homepage",
  "Priority menu review",
  "Everything in the Free plan",
];

export default function VendorSubscriptionPage() {
  const {
    currentUser,
    transactions,
    menuItems,
    upgradeSubscription,
    openBillingPortal,
  } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!currentUser) return null;

  const plan = currentUser.subscriptionPlan ?? "free";
  const isPremium = plan === "premium";
  const activeItems = menuItems.filter(
    (item) => item.vendorId === currentUser.id && item.status === "approved" && item.active,
  ).length;
  const myTransactions = transactions
    .filter((transaction) => transaction.vendorId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  async function upgrade() {
    setBusy(true);
    const result = await upgradeSubscription();
    setBusy(false);
    if (!result.ok || !result.url) {
      toast.error(result.error ?? "Could not start Stripe Checkout.");
      return;
    }
    setConfirmOpen(false);
    window.location.assign(result.url);
  }

  async function manageBilling() {
    setBusy(true);
    const result = await openBillingPortal();
    setBusy(false);
    if (!result.ok || !result.url) {
      toast.error(result.error ?? "Could not open the billing portal.");
      return;
    }
    window.location.assign(result.url);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vendor dashboard"
        title="Subscription"
        description="Choose the plan that fits your kitchen. Upgrade for unlimited menu space and more visibility."
      />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1710] to-[#4b2a18] p-5 text-white sm:p-6">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[22px] border-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant={isPremium ? "premium" : "outline"} className={isPremium ? "" : "border-white/30 text-white"}>
              {isPremium ? <Crown className="size-3" /> : <Store className="size-3" />}
              {isPremium ? "Premium plan" : "Free plan"}
            </Badge>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {isPremium ? "Your shop is in the spotlight." : "Ready to grow your menu?"}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#d8c4b4]">
              {isPremium
                ? `Unlimited items, a Premium badge and featured placement${
                    currentUser.subscriptionExpiresAt
                      ? ` · renews ${formatDate(currentUser.subscriptionExpiresAt)}`
                      : ""
                  }.`
                : `You're using ${activeItems} of 3 active item slots. Upgrade for unlimited items and homepage features.`}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-3xl font-extrabold">
              {isPremium ? "Active" : "$29"}
              {!isPremium && <span className="text-sm font-medium text-[#d8c4b4]">/month</span>}
            </p>
            <p className="text-xs text-[#bda593]">
              {isPremium ? "Premium subscription" : "Cancel anytime"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card className={isPremium ? "opacity-80" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Store className="size-5 text-muted-foreground" /> Free
                </CardTitle>
                <CardDescription>Everything you need to start selling.</CardDescription>
              </div>
              {!isPremium && <Badge variant="secondary">Current plan</Badge>}
            </div>
            <p className="pt-2 text-3xl font-extrabold">
              $0 <span className="text-sm font-medium text-muted-foreground">/month</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#2f6b4f]" /> {feature}
                </li>
              ))}
            </ul>
            <Button className="mt-5 w-full" variant="outline" disabled>
              {isPremium ? "Included in Premium" : "Your current plan"}
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-[#e5bd75] bg-gradient-to-b from-[#fffaf0] to-card">
          <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-[#f7d488] to-[#edb64f] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#553306]">
            Best value
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="size-5 text-[#b67a1d]" /> Premium
                </CardTitle>
                <CardDescription>More items. More eyes. More orders.</CardDescription>
              </div>
              {isPremium && <Badge variant="premium">Current plan</Badge>}
            </div>
            <p className="pt-2 text-3xl font-extrabold">
              $29 <span className="text-sm font-medium text-muted-foreground">/month</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#b67a1d]" /> {feature}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <div className="mt-5 grid gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={manageBilling}
                  disabled={busy}
                >
                  <CreditCard /> Manage billing
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Premium renews automatically until cancelled.
                </p>
              </div>
            ) : (
              <Button variant="gold" className="mt-5 w-full" onClick={() => setConfirmOpen(true)}>
                <Zap /> Upgrade to Premium
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Billing history</CardTitle>
            <CardDescription>Payments are recorded by the platform. Read-only.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-0">
            {myTransactions.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5 sm:pl-6">Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 sm:pr-6">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="pl-5 text-xs sm:pl-6">{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="text-xs capitalize">{transaction.plan}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell><TransactionStatusBadge status={transaction.status} /></TableCell>
                      <TableCell className="pr-5 text-[10px] text-muted-foreground sm:pr-6">
                        {transaction.stripeSessionId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground sm:px-6">
                No billing history yet. Your first Premium payment will appear here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#2f6b4f]" /> Secure payments
            </CardTitle>
            <CardDescription>Subscription billing is handled by Stripe Checkout.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-[#b67a1d]" />
              Premium is activated only after a verified Stripe webhook in production.
            </p>
            <p className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
              You will be redirected to Stripe Checkout. Premium features unlock only after the
              webhook confirms your payment.
            </p>
            <div className="rounded-xl bg-cream p-3 text-xs leading-5">
              <p className="font-bold text-foreground">Stripe test card</p>
              <p className="mt-1">4242 4242 4242 4242 · any future expiry · any CVC</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              You&apos;ll be billed $29/month. Continuing opens Stripe Checkout in a secure
              Stripe-hosted page; Premium activates only after the webhook confirms payment.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-cream p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Premium plan</span>
              <span className="font-extrabold">{formatCurrency(29)} / month</span>
            </div>
            <ul className="mt-2 grid gap-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><Check className="size-3 text-[#2f6b4f]" /> Unlimited items</li>
              <li className="flex items-center gap-1.5"><Check className="size-3 text-[#2f6b4f]" /> Premium badge & featured placement</li>
              <li className="flex items-center gap-1.5"><X className="size-3 text-muted-foreground" /> No lock-in, cancel anytime</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Not now
            </Button>
            <Button variant="gold" onClick={upgrade} disabled={busy}>
              {busy ? "Opening secure checkout…" : "Continue to checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
