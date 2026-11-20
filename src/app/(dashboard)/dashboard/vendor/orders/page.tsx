"use client";

import { useState } from "react";
import { Check, ClipboardList, Clock, Store, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { OrderSummaryCard } from "@/components/order-summary-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function VendorOrdersPage() {
  const { currentUser, orders, updateOrderStatus } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myOrders = orders
    .filter((order) => order.vendorId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pending = myOrders.filter((order) => order.status === "pending");
  const accepted = myOrders.filter((order) => order.status === "accepted");
  const revenue = accepted.reduce((sum, order) => sum + order.total, 0);
  const filtered = filter === "all" ? myOrders : myOrders.filter((order) => order.status === filter);

  function count(status: Filter) {
    return status === "all" ? myOrders.length : myOrders.filter((order) => order.status === status).length;
  }

  async function process(order: Order, status: "accepted" | "rejected") {
    setBusyId(order.id);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = updateOrderStatus(order.id, status);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the order.");
      return;
    }
    toast.success(
      status === "accepted"
        ? "Order accepted. The customer can now see the update."
        : "Order rejected. The customer has been notified.",
    );
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vendor dashboard"
        title="Customer orders"
        description="Review incoming requests and accept or reject each order once."
        action={
          <Button asChild variant="outline">
            <a href="mailto:hello@pizzahub.com?subject=PizzaHub%20order%20support">
              <Store /> Order support
            </a>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-[#fdf0d7] text-[#9a650f]">
            <Clock className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending</p>
            <p className="text-xl font-extrabold">{pending.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-[#e5f2ea] text-[#2f6b4f]">
            <Check className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accepted</p>
            <p className="text-xl font-extrabold">{accepted.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-[#fde7e1] text-primary">
            <ClipboardList className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accepted value</p>
            <p className="text-xl font-extrabold">{formatCurrency(revenue)}</p>
          </div>
        </Card>
      </div>

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
        {pending.length > 0 && (
          <p className="text-xs font-medium text-[#8a5a0a]">
            {pending.length} request{pending.length === 1 ? "" : "s"} awaiting your decision
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-6" />}
          title={filter === "all" ? "No orders yet" : `No ${filter} orders`}
          description={
            filter === "all"
              ? "Incoming customer requests will appear here. Keep your menu fresh to attract more orders."
              : "Try a different status filter to see other requests."
          }
          action={
            filter !== "all" ? (
              <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                Show all orders
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((order) => (
            <OrderSummaryCard
              key={order.id}
              order={order}
              perspective="vendor"
              actions={
                order.status === "pending" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#efc1b9] text-[#a3271a] hover:bg-[#fde7e4]"
                      disabled={busyId === order.id}
                      onClick={() => setSelected(order)}
                    >
                      <X /> Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === order.id}
                      onClick={() => process(order, "accepted")}
                    >
                      <Check /> {busyId === order.id ? "Updating…" : "Accept"}
                    </Button>
                  </>
                ) : null
              }
            />
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this order?</DialogTitle>
            <DialogDescription>
              Order #{selected?.id.replace("o-", "")} will be marked rejected and the customer
              will see that it was not accepted. This action can only be taken once.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Keep pending
            </Button>
            <Button
              variant="destructive"
              onClick={() => selected && process(selected, "rejected")}
              disabled={busyId === selected?.id}
            >
              {busyId === selected?.id ? "Rejecting…" : "Reject order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
