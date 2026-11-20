"use client";

import { useState } from "react";
import {
  BadgeDollarSign,
  Download,
  Lock,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { BarChart } from "@/components/charts";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TransactionStatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TransactionStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type Filter = "all" | TransactionStatus;

export default function AdminTransactionsPage() {
  const { transactions, users } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const vendors = users.filter((user) => user.role === "vendor");
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const filtered = sorted.filter((transaction) => {
    const vendor = vendors.find((entry) => entry.id === transaction.vendorId);
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      vendor?.businessName?.toLowerCase().includes(query) ||
      vendor?.name.toLowerCase().includes(query) ||
      transaction.stripeSessionId.toLowerCase().includes(query);
    const matchesFilter = filter === "all" || transaction.status === filter;
    return matchesSearch && matchesFilter;
  });

  const succeeded = transactions.filter((transaction) => transaction.status === "succeeded");
  const revenue = succeeded.reduce((sum, transaction) => sum + transaction.amount, 0);
  const failed = transactions.filter((transaction) => transaction.status === "failed").length;

  const monthTotals = new Map<string, number>();
  succeeded.forEach((transaction) => {
    const key = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      new Date(transaction.createdAt),
    );
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + transaction.amount);
  });

  function exportCsv() {
    const rows = [
      ["Transaction ID", "Vendor", "Plan", "Amount", "Currency", "Status", "Date"],
      ...filtered.map((transaction) => {
        const vendor = vendors.find((entry) => entry.id === transaction.vendorId);
        return [
          transaction.id,
          vendor?.businessName ?? vendor?.name ?? "Unknown",
          transaction.plan,
          String(transaction.amount),
          transaction.currency,
          transaction.status,
          formatDate(transaction.createdAt),
        ];
      }),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pizzahub-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Transaction CSV downloaded.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin dashboard"
        title="Transactions"
        description="Audit subscription payments across every vendor. Payment records are read-only."
        action={
          <Button variant="outline" onClick={exportCsv}>
            <Download /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#bcd7e8] bg-[#eff7fc] p-3.5 text-xs leading-5 text-[#315d78]">
        <Lock className="mt-0.5 size-4 shrink-0" />
        <p>
          <span className="font-bold">Read-only payment ledger.</span> Admins cannot edit
          transaction amounts or change a failed payment to successful. Stripe webhook events are
          the source of truth.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Gross revenue", value: formatCurrency(revenue), icon: BadgeDollarSign, tone: "bg-[#e5f2ea] text-[#2f6b4f]" },
          { label: "Transactions", value: transactions.length, icon: TrendingUp, tone: "bg-[#fde7e1] text-primary" },
          { label: "Failed payments", value: failed, icon: XCircle, tone: "bg-[#fdf0d7] text-[#9a650f]" },
          { label: "Premium vendors", value: vendors.filter((user) => user.subscriptionPlan === "premium").length, icon: Store, tone: "bg-[#efe8f7] text-[#6b4a92]" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-3 p-4">
              <span className={`grid size-9 place-items-center rounded-xl ${stat.tone}`}>
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-extrabold">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Subscription revenue</CardTitle>
            <CardDescription>Succeeded payments by month.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={Array.from(monthTotals.entries()).map(([label, value]) => ({ label, value }))}
              color="#2f6b4f"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Webhook integrity</CardTitle>
                <CardDescription>How payment confirmation is protected.</CardDescription>
              </div>
              <ShieldCheck className="size-5 text-[#2f6b4f]" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-[#2f6b4f]" />
              Premium activation is allowed only after a verified Stripe webhook event.
            </p>
            <p className="flex items-start gap-2">
              <BadgeDollarSign className="mt-0.5 size-4 shrink-0 text-[#2f6b4f]" />
              Failed or abandoned checkouts never create an active subscription.
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#2f6b4f]" />
              Secret keys stay server-side; the client never sees sensitive payment data.
            </p>
            <div className="mt-1 rounded-xl bg-cream p-3 text-xs">
              <p className="font-bold text-foreground">Latest verified event</p>
              <p className="mt-1 text-muted-foreground">
                {succeeded[0]
                  ? `${succeeded[0].stripeSessionId} · ${formatDate(succeeded[0].createdAt)}`
                  : "No successful payments yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vendor or Stripe session…"
                className="pl-10"
              />
            </div>
            <Select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className="sm:w-40"
              aria-label="Filter transactions"
            >
              <option value="all">All statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} records · read-only</p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Search className="size-6" />}
              title="No transactions found"
              description="No payment record matches this search and status filter."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction date</TableHead>
                    <TableHead>Stripe reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((transaction) => {
                    const vendor = vendors.find((entry) => entry.id === transaction.vendorId);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <p className="max-w-40 truncate text-sm font-semibold">
                            {vendor?.businessName ?? vendor?.name ?? "Unknown vendor"}
                          </p>
                          <p className="max-w-44 truncate text-[10px] text-muted-foreground">
                            {vendor?.email}
                          </p>
                        </TableCell>
                        <TableCell><Badge variant="premium" className="capitalize">{transaction.plan}</Badge></TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(transaction.amount)}{" "}
                          <span className="text-[10px] uppercase text-muted-foreground">{transaction.currency}</span>
                        </TableCell>
                        <TableCell><TransactionStatusBadge status={transaction.status} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <p className="max-w-44 truncate font-mono text-[10px] text-muted-foreground">{transaction.stripeSessionId}</p>
                          <p className="max-w-44 truncate font-mono text-[10px] text-muted-foreground/70">{transaction.stripeSubscriptionId}</p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filtered.map((transaction) => {
                const vendor = vendors.find((entry) => entry.id === transaction.vendorId);
                return (
                  <div key={transaction.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{vendor?.businessName ?? vendor?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{vendor?.email}</p>
                      </div>
                      <TransactionStatusBadge status={transaction.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-2.5 text-xs">
                      <span className="font-bold">{formatCurrency(transaction.amount)}</span>
                      <span className="capitalize text-muted-foreground">{transaction.plan} plan</span>
                      <span className="text-muted-foreground">{formatDate(transaction.createdAt)}</span>
                    </div>
                    <p className="mt-2 truncate font-mono text-[10px] text-muted-foreground">
                      {transaction.stripeSessionId}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
