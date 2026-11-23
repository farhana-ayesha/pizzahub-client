"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, ReceiptText, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { OrderSummaryCard } from "@/components/order-summary-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Filter = "all" | OrderStatus;

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export default function CustomerOrdersPage() {
  const { currentUser, orders, cancelOrder } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);

  if (!currentUser) return null;

  const myOrders = orders
    .filter((order) => order.customerId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filtered = filter === "all" ? myOrders : myOrders.filter((order) => order.status === filter);

  function count(status: Filter) {
    return status === "all"
      ? myOrders.length
      : myOrders.filter((order) => order.status === status).length;
  }

  async function confirmCancel() {
    if (!selected) return;
    setBusy(true);
    const result = await cancelOrder(selected.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not cancel the order.");
      return;
    }
    toast.success("Order cancelled. No charge was made.");
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Customer dashboard"
        title="My orders"
        description="Track every request, check delivery details and cancel any pending order."
        action={
          <Button asChild>
            <Link href="/menu">
              <UtensilsCrossed /> Order something new
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <span className="rounded-full bg-white/70 px-1.5 text-[10px] text-muted-foreground">
                  {count(tab.value)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          Active order value:{" "}
          <span className="font-bold text-foreground">
            {formatCurrency(
              myOrders
                .filter((order) => order.status === "pending" || order.status === "accepted")
                .reduce((sum, order) => sum + order.total, 0),
            )}
          </span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="size-6" />}
          title={filter === "all" ? "No orders yet" : `No ${filter} orders`}
          description={
            filter === "all"
              ? "When you place an order, it will appear here with live status updates."
              : "Try another filter to see your other orders."
          }
          action={
            <div className="flex gap-2">
              {filter !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                  Show all orders
                </Button>
              )}
              <Button asChild size="sm">
                <Link href="/menu">Browse menu</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((order) => (
            <OrderSummaryCard
              key={order.id}
              order={order}
              perspective="customer"
              actions={
                order.status === "pending" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#efc1b9] text-[#a3271a] hover:bg-[#fde7e4]"
                    onClick={() => setSelected(order)}
                  >
                    <Ban /> Cancel
                  </Button>
                ) : null
              }
            />
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              You&apos;re about to cancel order #{selected?.id.replace("o-", "")}. This can
              only be done while the order is still pending, and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="rounded-xl bg-cream p-3 text-sm">
              <p className="font-semibold">
                {formatCurrency(selected.total)} · delivery {selected.deliveryDate}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{selected.deliveryAddress}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={busy}>
              {busy ? "Cancelling…" : "Yes, cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
