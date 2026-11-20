"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  MessageSquare,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { OrderStatusBadge } from "@/components/status-badge";
import { OrderTimeline } from "@/components/order-timeline";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

const dashboardPath = {
  customer: "/dashboard/customer/orders",
  vendor: "/dashboard/vendor/orders",
  admin: "/dashboard/admin",
};

export function OrderDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    hydrated,
    currentUser,
    orders,
    menuItems,
    users,
    cancelOrder,
    updateOrderStatus,
  } = useApp();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const order = orders.find((entry) => entry.id === params.id);

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace(`/login?redirect=${encodeURIComponent(`/orders/${params.id}`)}`);
    }
  }, [hydrated, currentUser, router, params.id]);

  if (!hydrated || !currentUser) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-4 h-28 w-full rounded-2xl" />
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 text-2xl font-extrabold">Order not found</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We couldn&apos;t find this order. It may have been removed or the link may be
            incorrect.
          </p>
          <Button asChild className="mt-5">
            <Link href={dashboardPath[currentUser.role]}>Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isCustomer = order.customerId === currentUser.id;
  const isVendor = order.vendorId === currentUser.id;
  const isAdmin = currentUser.role === "admin";
  const allowed = isCustomer || isVendor || isAdmin;
  const item = menuItems.find((entry) => entry.id === order.itemId);
  const vendor = users.find((entry) => entry.id === order.vendorId);
  const customer = users.find((entry) => entry.id === order.customerId);
  const perspective = isVendor ? "vendor" : isAdmin ? "admin" : "customer";

  if (!allowed) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-8 text-center">
          <Lock className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 text-2xl font-extrabold">This order isn&apos;t yours</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            You can only view orders that belong to your account or restaurant. If you think this
            is a mistake, contact support.
          </p>
          <Button asChild className="mt-5">
            <Link href={dashboardPath[currentUser.role]}>Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function handleCancel() {
    if (!order) return;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = cancelOrder(order.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not cancel the order.");
      return;
    }
    toast.success("Order cancelled.");
    setCancelOpen(false);
  }

  async function handleVendorAction(status: "accepted" | "rejected") {
    if (!order) return;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = updateOrderStatus(order.id, status);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the order.");
      return;
    }
    toast.success(status === "accepted" ? "Order accepted." : "Order rejected.");
    setRejectOpen(false);
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={dashboardPath[currentUser.role]}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to dashboard
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              Order #{order.id.replace("o-", "")}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDateTime(order.createdAt)} · {isVendor ? "Customer order" : "Delivery order"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isCustomer && order.status === "pending" && (
            <Button variant="outline" className="text-destructive" onClick={() => setCancelOpen(true)}>
              <Ban /> Cancel order
            </Button>
          )}
          {isVendor && order.status === "pending" && (
            <>
              <Button variant="outline" className="text-destructive" onClick={() => setRejectOpen(true)}>
                <X /> Reject
              </Button>
              <Button onClick={() => handleVendorAction("accepted")} disabled={busy}>
                <Check /> {busy ? "Updating…" : "Accept order"}
              </Button>
            </>
          )}
          {isAdmin && (
            <Badge variant="outline" className="h-9 px-3">
              <Lock className="size-3" /> Admin read-only
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Order progress
            </h2>
            <OrderTimeline status={order.status} />
          </section>

          <Card className="p-5">
            <h2 className="text-base font-bold">Delivery details</h2>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery date</p>
                  <p className="font-semibold">{formatDate(order.deliveryDate, { weekday: "long" })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery address</p>
                  <p className="font-semibold">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CreditCard className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="font-semibold">Pay on delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Special instructions</p>
                  <p className="font-semibold">{order.message || "No special instructions"}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={vendor?.image}
                  name={vendor?.businessName ?? "Vendor"}
                  className="size-11"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Sold by</p>
                  <p className="font-bold">{vendor?.businessName}</p>
                  <p className="text-xs text-muted-foreground">{vendor?.location}</p>
                </div>
              </div>
              {perspective !== "vendor" && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/menu">
                    <Store /> Browse menu
                  </Link>
                </Button>
              )}
            </div>
            {perspective !== "customer" && customer && (
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <Avatar src={customer.image} name={customer.name} className="size-11" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-bold">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.email} · {customer.phone ?? "No phone"}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-secondary">
              {item && (
                <Image
                  src={item.images[0]}
                  alt={item.itemName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-5">
              <Badge variant="secondary">{item?.category ?? "Menu item"}</Badge>
              <h2 className="mt-2 text-xl font-extrabold">{item?.itemName ?? "Item removed"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(item?.price ?? order.total)} each · quantity {order.quantity}
              </p>
              <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold text-[#2f6b4f]">Free</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="size-4 text-[#2f6b4f]" /> What happens next?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {order.status === "pending" &&
                (isVendor
                  ? "Accept or reject this request. Customers can only cancel while it is pending."
                  : "The vendor will review your request and accept or reject it. You can cancel while it is still pending.")}
              {order.status === "accepted" &&
                "The vendor accepted the order. It will be prepared for the selected delivery date."}
              {order.status === "rejected" &&
                "This request was rejected by the vendor. No payment is due."}
              {order.status === "cancelled" && "This order was cancelled and will not be delivered."}
            </p>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-cream p-2.5 text-[11px] text-muted-foreground">
              <UserRound className="size-3.5" /> {isVendor ? "Vendor view" : isAdmin ? "Admin view" : "Customer view"}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              Only pending orders can be cancelled. Once cancelled, this request cannot be
              restored.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep order</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={busy}>
              {busy ? "Cancelling…" : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this order?</DialogTitle>
            <DialogDescription>
              The customer will see the rejected status. This action can only be taken once.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Keep pending</Button>
            <Button variant="destructive" onClick={() => handleVendorAction("rejected")} disabled={busy}>
              {busy ? "Rejecting…" : "Reject order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
