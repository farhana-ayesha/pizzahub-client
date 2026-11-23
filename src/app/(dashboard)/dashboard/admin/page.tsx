"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  Clock,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { BarChart, DonutChart } from "@/components/charts";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { MenuStatusBadge, TransactionStatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { users, menuItems, transactions, setMenuStatus } = useApp();

  const vendors = users.filter((user) => user.role === "vendor");
  const customers = users.filter((user) => user.role === "customer");
  const pendingItems = menuItems.filter((item) => item.status === "pending");
  const totalRevenue = transactions
    .filter((transaction) => transaction.status === "succeeded")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  async function review(id: string, status: "approved" | "rejected") {
    const result = await setMenuStatus(id, status);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the item.");
      return;
    }
    toast.success(status === "approved" ? "Item approved and published." : "Item rejected.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin dashboard"
        title="Platform overview"
        description="Monitor users, menu submissions and subscription revenue across PizzaHub."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/menu">
              <Clock /> Review queue
              {pendingItems.length > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] text-white">
                  {pendingItems.length}
                </span>
              )}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total users" value={users.length} icon={Users} tone="tomato" hint="All roles" />
        <StatCard title="Vendors" value={vendors.length} icon={Store} tone="gold" hint="Restaurants" />
        <StatCard title="Customers" value={customers.length} icon={UserRound} tone="basil" hint="Registered" />
        <StatCard title="Menu items" value={menuItems.length} icon={UtensilsCrossed} tone="sky" hint="All submissions" />
        <StatCard title="Pending review" value={pendingItems.length} icon={Clock} tone="plum" hint="Needs action" />
        <StatCard
          title="Transactions"
          value={transactions.length}
          icon={BadgeDollarSign}
          tone="tomato"
          hint={`${formatCurrency(totalRevenue)} revenue`}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Users by role</CardTitle>
                <CardDescription>Marketplace composition across accounts.</CardDescription>
              </div>
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={[
                { label: "Customers", value: customers.length, color: "#db3a1f" },
                { label: "Vendors", value: vendors.length, color: "#e8a33d" },
                { label: "Admins", value: users.filter((user) => user.role === "admin").length, color: "#2f6b4f" },
              ]}
              centerValue={users.length}
              centerLabel="Users"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Menu submission health</CardTitle>
            <CardDescription>Approval pipeline for all vendor items.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                { label: "Approved", value: menuItems.filter((item) => item.status === "approved").length },
                { label: "Pending", value: menuItems.filter((item) => item.status === "pending").length },
                { label: "Rejected", value: menuItems.filter((item) => item.status === "rejected").length },
                { label: "Inactive", value: menuItems.filter((item) => item.status === "inactive").length },
              ]}
              color="#e8a33d"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending menu approvals</CardTitle>
                <CardDescription>Review new submissions before they go live.</CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard/admin/menu">
                  Manage all <ArrowRight />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pendingItems.slice(0, 4).map((item) => {
              const vendor = vendors.find((entry) => entry.id === item.vendorId);
              return (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <Image src={item.images[0]} alt={item.itemName} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-bold">{item.itemName}</p>
                      <MenuStatusBadge status={item.status} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {vendor?.businessName} · {item.category} · {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => review(item.id, "rejected")}
                    >
                      <X /> Reject
                    </Button>
                    <Button size="sm" onClick={() => review(item.id, "approved")}>
                      <Check /> Approve
                    </Button>
                  </div>
                </div>
              );
            })}
            {pendingItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Check className="mx-auto size-7 text-[#2f6b4f]" />
                <p className="mt-2 text-sm font-bold">Approval queue is clear</p>
                <p className="text-xs text-muted-foreground">New submissions will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent transactions</CardTitle>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/dashboard/admin/transactions">All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {recentTransactions.map((transaction) => {
                const vendor = vendors.find((entry) => entry.id === transaction.vendorId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{vendor?.businessName}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{formatCurrency(transaction.amount)}</span>
                      <TransactionStatusBadge status={transaction.status} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Newest accounts</CardTitle>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/dashboard/admin/users">All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                      {user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{user.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === "vendor" ? "warning" : user.role === "admin" ? "dark" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/dashboard/admin/users", label: "Manage users", description: "Search, review and block accounts", icon: Users },
          { href: "/dashboard/admin/menu", label: "Manage menu", description: "Approve, reject or remove items", icon: UtensilsCrossed },
          { href: "/dashboard/admin/transactions", label: "Transactions", description: "Audit subscription payments", icon: BadgeDollarSign },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-[#d9bca6] hover:bg-cream"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{action.label}</span>
                <span className="block text-xs text-muted-foreground">{action.description}</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
