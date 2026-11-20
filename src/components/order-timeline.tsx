import { Check, ChefHat, ClipboardCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const steps = [
  { key: "requested", label: "Request sent", icon: ClipboardCheck },
  { key: "review", label: "Vendor review", icon: ChefHat },
  { key: "accepted", label: "Order accepted", icon: Check },
  { key: "delivery", label: "Out for delivery", icon: Check },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "rejected" || status === "cancelled") {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#fde7e4] text-[#a3271a]">
            <X className="size-5" />
          </span>
          <div>
            <p className="font-bold">
              {status === "rejected" ? "Order rejected by vendor" : "Order cancelled"}
            </p>
            <p className="text-xs text-muted-foreground">
              {status === "rejected"
                ? "This request was not accepted. No payment is due."
                : "This order will not be delivered."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = status === "accepted" ? 2 : 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-4 sm:gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const done = index <= activeIndex;
          const current = index === activeIndex;
          return (
            <div key={step.key} className="flex items-center gap-3 sm:flex-col sm:items-start">
              <div className="flex items-center sm:w-full">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs",
                    done
                      ? "border-[#2f6b4f] bg-[#2f6b4f] text-white"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                {index < steps.length - 1 && (
                  <span
                    className={cn(
                      "ml-2 hidden h-0.5 flex-1 sm:block",
                      index < activeIndex ? "bg-[#2f6b4f]" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className="sm:mt-2">
                <p className={cn("text-xs font-bold", current ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {done ? "Complete" : "Waiting"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
