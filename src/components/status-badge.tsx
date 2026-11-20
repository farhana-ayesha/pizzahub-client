import { Badge } from "@/components/ui/badge";
import type { MenuStatus, OrderStatus, TransactionStatus } from "@/lib/types";

const orderMap: Record<
  OrderStatus,
  { label: string; variant: "warning" | "success" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

const menuMap: Record<
  MenuStatus,
  { label: string; variant: "warning" | "success" | "destructive" | "outline" }
> = {
  pending: { label: "Pending review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  inactive: { label: "Inactive", variant: "outline" },
};

const transactionMap: Record<
  TransactionStatus,
  { label: string; variant: "success" | "destructive" | "outline" }
> = {
  succeeded: { label: "Succeeded", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "outline" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const item = orderMap[status];
  return (
    <Badge variant={item.variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {item.label}
    </Badge>
  );
}

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  const item = menuMap[status];
  return (
    <Badge variant={item.variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {item.label}
    </Badge>
  );
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const item = transactionMap[status];
  return (
    <Badge variant={item.variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {item.label}
    </Badge>
  );
}
