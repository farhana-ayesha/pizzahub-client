"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Store, UserRound } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { OrderStatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrderSummaryCard({
  order,
  perspective,
  actions,
  showLink = true,
}: {
  order: Order;
  perspective: "customer" | "vendor" | "admin";
  actions?: React.ReactNode;
  showLink?: boolean;
}) {
  const { menuItems, users } = useApp();
  const item = menuItems.find((entry) => entry.id === order.itemId);
  const vendor = users.find((entry) => entry.id === order.vendorId);
  const customer = users.find((entry) => entry.id === order.customerId);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-24">
          {item ? (
            <Image
              src={item.images[0]}
              alt={item.itemName}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center text-muted-foreground">
              <Store className="size-6" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                Order #{order.id.replace("o-", "")}
              </p>
              <h3 className="mt-0.5 truncate text-base font-bold">
                {item?.itemName ?? "Item removed"}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item?.category ?? "Menu item"} · Qty {order.quantity} ·{" "}
                {formatCurrency(order.total)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" />
              Delivery {formatDate(order.deliveryDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              <span className="truncate">{order.deliveryAddress}</span>
            </span>
            {perspective !== "vendor" && vendor && (
              <span className="flex items-center gap-1.5">
                <Store className="size-3.5 text-primary" />
                <span className="truncate">{vendor.businessName}</span>
              </span>
            )}
            {perspective !== "customer" && customer && (
              <span className="flex items-center gap-1.5">
                <UserRound className="size-3.5 text-primary" />
                <span className="truncate">
                  {customer.name} · {customer.email}
                </span>
              </span>
            )}
          </div>

          {order.message && (
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-[11px] italic text-muted-foreground">
              “{order.message}”
            </p>
          )}
        </div>
      </div>

      {(actions || showLink) && (
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-[#fffdfa] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {perspective !== "customer" && customer && (
              <Avatar src={customer.image} name={customer.name} className="size-6" sizes="24px" />
            )}
            Requested {formatDate(order.createdAt)}
          </div>
          <div className="flex flex-wrap gap-2">
            {actions}
            {showLink && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/orders/${order.id}`}>View details</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
