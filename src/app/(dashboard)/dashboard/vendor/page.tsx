"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  Plus,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { BarChart, DonutChart } from "@/components/charts";
import { OrderSummaryCard } from "@/components/order-summary-card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function VendorOverviewPage() {
  const { currentUser, menuItems, orders, updateOrderStatus } = useApp();

  if (!currentUser) return null;

  const myItems = menuItems.filter((item) => item.vendorId === currentUser.id);
  const myOrders = orders
    .filter((order) => order.vendorId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pendingOrders = myOrders.filter((order) => order.status === "pending");
  const acceptedOrders = myOrders.filter((order) => order.status === "accepted");
  const activeItems = myItems.filter((item) => item.status === "approved" && item.active).length;
  const revenue = acceptedOrders.reduce((sum, order) => sum + order.total, 0);
  const plan = currentUser.subscriptionPlan ?? "free";

  const itemPerformance = myItems
    .filter((item) => item.status === "approved")
    .map((item) => {
      const count = myOrders.filter((order) => order.itemId === item.id).length;
      return { label: item.itemName.split(" ")[0], value: count };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  function process(orderId: string, status: "accepted" | "rejected") {
    const result = updateOrderStatus(orderId, status);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the order.");
      return;
    }
    toast.success(status === "accepted" ? "Order accepted." : "Order rejected.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vendor dashboard"
        title={currentUser.businessName ?? "Your restaurant"}
        description="A snapshot of menu performance, incoming orders and your subscription."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/vendor/orders">
                <ClipboardList /> Orders
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/vendor/menu/new">
                <Plus /> Add item
              </Link>
            </Button>
          </div>
        }
      />

      {pendingOrders.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#edd3a7] bg-[#fff7e8] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 size-4 shrink-0 text-[#9a650f]" />
            <div>
              <p className="text-sm font-bold text-[#6f4a17]">
                {pendingOrders.length} order{pendingOrders.length === 1 ? "" : "s"} waiting for
                your response
              </p>
              <p className="text-xs text-[#8a6a3f]">
                Accept or reject quickly to keep customers updated.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="bg-white">
            <Link href="/dashboard/vendor/orders">Review all orders</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard title="Menu items" value={myItems.length} icon={UtensilsCrossed} tone="tomato" hint="All time" />
        <StatCard title="Active items" value={activeItems} icon={CheckCircle2} tone="basil" hint="Approved & live" />
        <StatCard title="Pending orders" value={pendingOrders.length} icon={Clock} tone="gold" hint="Needs action" />
        <StatCard title="Accepted orders" value={acceptedOrders.length} icon={Check} tone="sky" hint={formatCurrency(revenue)} />
        <Card className="flex flex-col justify-between p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Current plan
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-2xl font-extrabold capitalize">
              {plan === "premium" && <Crown className="size-5 text-[#b67a1d]" />}
              {plan}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {plan === "premium"
                ? currentUser.subscriptionExpiresAt
                  ? `Renews ${formatDate(currentUser.subscriptionExpiresAt)}`
                  : "Unlimited items"
                : `${activeItems}/3 active items`}
            </p>
          </div>
          <Button asChild size="sm" variant={plan === "premium" ? "outline" : "gold"} className="mt-3 w-full">
            <Link href="/dashboard/vendor/subscription">
              {plan === "premium" ? "Manage" : "Upgrade"}
            </Link>
          </Button>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Menu item interest</CardTitle>
                <CardDescription>Most ordered dishes across all requests.</CardDescription>
              </div>
              <Badge variant="secondary">{formatCurrency(revenue)} earned</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {itemPerformance.length ? (
              <BarChart data={itemPerformance} color="#db3a1f" />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No approved menu items yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Menu status</CardTitle>
            <CardDescription>Where your items stand in review.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={[
                { label: "Approved", value: myItems.filter((item) => item.status === "approved").length, color: "#2f6b4f" },
                { label: "Pending", value: myItems.filter((item) => item.status === "pending").length, color: "#e8a33d" },
                { label: "Rejected", value: myItems.filter((item) => item.status === "rejected").length, color: "#c63a21" },
                { label: "Inactive", value: myItems.filter((item) => item.status === "inactive").length, color: "#b8a99d" },
              ]}
              centerValue={myItems.length}
              centerLabel="Items"
            />
          </CardContent>
        </Card>
      </div>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Orders needing a response</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/vendor/orders">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {pendingOrders.slice(0, 3).map((order) => (
            <OrderSummaryCard
              key={order.id}
              order={order}
              perspective="vendor"
              actions={
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#efc1b9] text-[#a3271a] hover:bg-[#fde7e4]"
                    onClick={() => process(order.id, "rejected")}
                  >
                    <X /> Reject
                  </Button>
                  <Button size="sm" onClick={() => process(order.id, "accepted")}>
                    <Check /> Accept
                  </Button>
                </>
              }
            />
          ))}
          {pendingOrders.length === 0 && (
            <Card className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-bold">All caught up</p>
                <p className="text-sm text-muted-foreground">
                  There are no pending orders right now.
                </p>
              </div>
              <Badge variant="success">Inbox clear</Badge>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
