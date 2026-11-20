"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Crown, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/app-provider";
import type { MenuItem, User } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

export function MenuItemCard({
  item,
  vendor,
  className,
}: {
  item: MenuItem;
  vendor?: User;
  className?: string;
}) {
  const router = useRouter();
  const { currentUser } = useApp();
  const premium = vendor?.subscriptionPlan === "premium";

  function openDetails() {
    if (!currentUser) {
      toast.info("Sign in to view item details and place an order.");
      router.push(`/login?redirect=${encodeURIComponent(`/menu/${item.id}`)}`);
      return;
    }
    router.push(`/menu/${item.id}`);
  }

  return (
    <article
      className={cn(
        "card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_0_rgba(90,55,32,0.04)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={openDetails}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary text-left"
        aria-label={`View ${item.itemName}`}
      >
        <Image
          src={item.images[0]}
          alt={item.itemName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <span className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <Badge variant="dark" className="bg-[#2a1710]/80 text-white backdrop-blur">
            {item.category}
          </Badge>
          {premium && (
            <Badge variant="premium" className="shadow-sm">
              <Crown className="size-3" /> Premium
            </Badge>
          )}
        </span>
        <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#2a1710]/45 to-transparent" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-bold text-foreground shadow-sm">
          <Star className="size-3 fill-[#e8a33d] text-[#e8a33d]" />
          {item.rating > 0 ? item.rating.toFixed(1) : "New"}
          {item.reviewsCount > 0 && (
            <span className="font-medium text-muted-foreground">({item.reviewsCount})</span>
          )}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm">
          {item.prepTime}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{vendor?.businessName ?? "PizzaHub partner"}</span>
          <span className="size-1 rounded-full bg-border" />
          <MapPin className="size-3" />
          <span className="truncate">{item.location}</span>
        </div>

        <h3 className="mt-2 line-clamp-1 text-base font-bold tracking-tight sm:text-lg">
          {item.itemName}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              From
            </p>
            <p className="text-lg font-extrabold tracking-tight text-primary">
              {formatCurrency(item.price)}
            </p>
          </div>
          <Button size="sm" onClick={openDetails} aria-label={`View details for ${item.itemName}`}>
            View details <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
