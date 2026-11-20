"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  ReceiptText,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BarChart, DonutChart } from "@/components/charts";
import { OrderSummaryCard } from "@/components/order-summary-card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { photos } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function CustomerOverviewPage() {
  const { currentUser, orders, menuItems } = useApp();

  if (!currentUser) return null;

  const myOrders = orders
    .filter((order) => order.customerId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pending = myOrders.filter((order) => order.status === "pending").length;
  const accepted = myOrders.filter((order) => order.status === "accepted").length;
  const rejected = myOrders.filter((order) => order.status === "rejected").length;
  const totalSpend = myOrders
    .filter((order) => order.status === "accepted")
    .reduce((sum, order) => sum + order.total, 0);

  const categoryTotals = new Map<string, number>();
  myOrders.forEach((order) => {
    const item = menuItems.find((entry) => entry.id === order.itemId);
    if (!item) return;
    categoryTotals.set(item.category, (categoryTotals.get(item.category) ?? 0) + order.total);
  });
  const spendData = Array.from(categoryTotals.entries()).map(([label, value]) => ({
    label: label.split(" ")[0],
    value: Math.round(value),
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Customer dashboard"
        title={`Welcome back, ${currentUser.name.split(" ")[0]}.`}
        description="Your orders, favourites and pizza activity all in one place."
        action={
          <Button asChild>
            <Link href="/menu">
              <UtensilsCrossed /> Browse menu
            </Link>
          </Button>
        }
      />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1710] to-[#4a2918] p-5 text-white sm:p-6">
        <div className="absolute -right-10 -top-16 size-48 rounded-full border-[18px] border-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <Badge variant="premium" className="mb-3">
              <Clock className="size-3" /> {pending} pending {pending === 1 ? "request" : "requests"}
            </Badge>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {pending > 0
                ? "A vendor is reviewing your latest order."
                : "Ready for your next pizza night?"}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[#d8c4b4]">
              {pending > 0
                ? "We'll update the status as soon as the kitchen responds. No need to refresh."
                : "Browse local favourites, compare menus and get something hot delivered."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary" className="bg-white text-[#2a1710] hover:bg-[#fff3e8]">
                <Link href="/dashboard/customer/orders">View my orders</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/menu">Find dinner</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden size-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white/20 lg:block">
            <Image src={photos.pepperoni} alt="Fresh pizza" fill sizes="128px" className="object-cover" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Total orders" value={myOrders.length} icon={ShoppingBag} tone="tomato" hint="All time" />
        <StatCard title="Pending" value={pending} icon={Clock} tone="gold" hint="Awaiting vendor" />
        <StatCard title="Accepted" value={accepted} icon={CheckCircle2} tone="basil" hint="On the way" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} tone="plum" hint="Not accepted" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Order status mix</CardTitle>
                <CardDescription>How your requests have been handled.</CardDescription>
              </div>
              <Badge variant="secondary">{formatCurrency(totalSpend)} spent</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={[
                { label: "Pending", value: pending, color: "#e8a33d" },
                { label: "Accepted", value: accepted, color: "#2f6b4f" },
                { label: "Rejected", value: rejected, color: "#c63a21" },
                {
                  label: "Cancelled",
                  value: myOrders.filter((order) => order.status === "cancelled").length,
                  color: "#b8a99d",
                },
              ]}
              centerValue={myOrders.length}
              centerLabel="Orders"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Spend by category</CardTitle>
            <CardDescription>Where your pizza budget has gone.</CardDescription>
          </CardHeader>
          <CardContent>
            {spendData.length ? (
              <BarChart data={spendData} color="#db3a1f" />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Place an order to see your spending breakdown.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent orders</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/customer/orders">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {myOrders.slice(0, 3).map((order) => (
              <OrderSummaryCard key={order.id} order={order} perspective="customer" />
            ))}
            {myOrders.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                No orders yet. Your first pizza is waiting.
              </Card>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Quick actions</h2>
          <div className="grid gap-2.5">
            {[
              {
                href: "/menu",
                label: "Browse the menu",
                description: "Find something new",
                icon: UtensilsCrossed,
              },
              {
                href: "/dashboard/customer/orders",
                label: "My orders",
                description: "Track or cancel requests",
                icon: ReceiptText,
              },
              {
                href: "/dashboard/settings",
                label: "Profile settings",
                description: "Update your details",
                icon: Settings,
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition hover:border-[#d9bca6] hover:bg-cream"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{action.label}</span>
                    <span className="block text-xs text-muted-foreground">{action.description}</span>
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
            <div className="mt-2 rounded-xl border border-border bg-[#fffaf4] p-3.5 text-xs leading-5 text-muted-foreground">
              <p className="flex items-center gap-1.5 font-bold text-foreground">
                <MapPin className="size-3.5 text-primary" /> Your default area
              </p>
              <p className="mt-1">{currentUser.location ?? "Add a delivery area in settings."}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
