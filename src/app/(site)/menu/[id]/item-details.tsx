"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  Crown,
  Heart,
  MapPin,
  Minus,
  Plus,
  Share2,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { MenuItemCard } from "@/components/menu-item-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { demoReviews, menuItemReviews } from "@/lib/data";
import type { MenuItem } from "@/lib/types";
import {
  cn,
  daysFromNow,
  formatCurrency,
  formatDate,
  formatDateTime,
  isPastDate,
} from "@/lib/utils";

export function ItemDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, currentUser, menuItems, users, isFavourite, toggleFavourite } = useApp();
  const item = menuItems.find((entry) => entry.id === params.id);
  const [gallery, setGallery] = useState({ id: params.id, index: 0 });
  const [orderOpen, setOrderOpen] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; orderId: string } | null>(null);
  const favourite = item ? isFavourite(item.id) : false;

  const image = gallery.id === params.id ? gallery.index : 0;
  const placedOrder = placed && placed.id === params.id ? placed.orderId : null;

  function setImage(index: number) {
    setGallery({ id: params.id, index });
  }

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace(`/login?redirect=${encodeURIComponent(`/menu/${params.id}`)}`);
    }
  }, [hydrated, currentUser, router, params.id]);

  const vendor = item ? users.find((user) => user.id === item.vendorId) : undefined;
  const reviews = (item && menuItemReviews[item.id]) || demoReviews;
  const related = useMemo(() => {
    if (!item) return [];
    const sameCategory = menuItems.filter(
      (entry) =>
        entry.id !== item.id &&
        entry.status === "approved" &&
        entry.active &&
        entry.category === item.category,
    );
    if (sameCategory.length >= 3) return sameCategory.slice(0, 3);
    const extra = menuItems.filter(
      (entry) =>
        entry.id !== item.id &&
        entry.status === "approved" &&
        entry.active &&
        !sameCategory.some((match) => match.id === entry.id),
    );
    return [...sameCategory, ...extra].slice(0, 3);
  }, [item, menuItems]);

  if (!hydrated || !currentUser) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#fde7e1] text-primary">
            <AlertCircle className="size-8" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold">That pizza has left the oven.</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The item you are looking for doesn&apos;t exist or may have been removed. Try
            browsing the rest of the menu.
          </p>
          <Button asChild className="mt-6">
            <Link href="/menu">
              <ArrowLeft /> Back to menu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const available = item.status === "approved" && item.active;
  const ownItem = currentUser.role === "vendor" && item.vendorId === currentUser.id;
  const isAdmin = currentUser.role === "admin";
  const premium = vendor?.subscriptionPlan === "premium";
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1);

  function shareItem() {
    const url = `${window.location.origin}/menu/${item?.id}`;
    navigator.clipboard
      ?.writeText(url)
      .then(() => toast.success("Item link copied to your clipboard."))
      .catch(() => toast.error("Could not copy the link."));
  }

  return (
    <div className="pb-16">
      <div className="container-page pt-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/menu" className="hover:text-foreground">
            Browse menu
          </Link>
          <span>/</span>
          <Link
            href={`/menu?category=${encodeURIComponent(item.category)}`}
            className="hover:text-foreground"
          >
            {item.category}
          </Link>
          <span>/</span>
          <span className="truncate font-semibold text-foreground">{item.itemName}</span>
        </nav>
      </div>

      {placedOrder && (
        <div className="container-page mt-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#b9dfc9] bg-[#eef8f1] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#2f6b4f]" />
              <div>
                <p className="text-sm font-bold text-[#24553b]">Order request sent!</p>
                <p className="text-xs text-[#4c7a60]">
                  The kitchen will accept or reject it shortly. You can follow it in your dashboard.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="bg-white">
              <Link href={`/orders/${placedOrder}`}>View order</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="container-page mt-6 grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-secondary">
            <Image
              src={item.images[image] ?? item.images[0]}
              alt={`${item.itemName} — photo ${image + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge variant="dark" className="bg-[#2a1710]/80 text-white backdrop-blur">
                {item.category}
              </Badge>
              {premium && (
                <Badge variant="premium">
                  <Crown className="size-3" /> Premium vendor
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {item.images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setImage(index)}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-secondary transition",
                  image === index
                    ? "border-primary"
                    : "border-transparent opacity-75 hover:opacity-100",
                )}
                aria-label={`Show photo ${index + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <Star className="size-3 fill-[#e8a33d] text-[#e8a33d]" />
              {averageRating.toFixed(1)} ({reviews.length} reviews)
            </Badge>
            <Badge variant="outline">
              <Clock className="size-3" /> {item.prepTime}
            </Badge>
            {available ? (
              <Badge variant="success">Available</Badge>
            ) : (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>

          <h1 className="display-title mt-4 text-4xl sm:text-5xl">{item.itemName}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" /> {item.location}
            <span className="mx-1 size-1 rounded-full bg-border" />
            by <span className="font-semibold text-foreground">{vendor?.businessName}</span>
          </p>

          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            {item.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between gap-4 border-y border-border py-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Price per item
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
                {formatCurrency(item.price)}
              </p>
            </div>
            <div className="flex gap-2">
              {currentUser.role === "customer" && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const result = toggleFavourite(item.id);
                    if (!result.ok) {
                      toast.error(result.error ?? "Could not update favourites.");
                      return;
                    }
                    toast.success(
                      favourite ? "Removed from favourites." : "Saved to favourites.",
                    );
                  }}
                  aria-label={favourite ? "Remove from favourites" : "Save to favourites"}
                >
                  <Heart className={cn("size-4", favourite && "fill-primary text-primary")} />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={shareItem} aria-label="Share item">
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Avatar
                src={vendor?.image}
                name={vendor?.businessName ?? "PizzaHub"}
                className="size-12"
                sizes="48px"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate font-bold">{vendor?.businessName}</p>
                  {premium && (
                    <Badge variant="premium">
                      <Crown className="size-3" /> Premium
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {vendor?.location}
                  <span className="mx-1 size-1 rounded-full bg-border" />
                  <ChefHat className="size-3" /> {vendor?.name}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-primary" />
                Prepared fresh in {item.prepTime}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#2f6b4f]" />
                Vendor accepts orders one at a time for the selected date
              </div>
            </div>

            <div className="mt-5">
              {isAdmin ? (
                <div className="rounded-xl bg-secondary p-3 text-center text-xs font-medium text-muted-foreground">
                  Admin accounts can view the marketplace but cannot place customer orders.
                </div>
              ) : ownItem ? (
                <div className="rounded-xl bg-secondary p-3 text-center text-xs font-medium text-muted-foreground">
                  This is your menu item. Vendors cannot order their own items.
                </div>
              ) : !available ? (
                <div className="rounded-xl bg-[#fde7e4] p-3 text-center text-xs font-medium text-[#a3271a]">
                  This item is not currently available for ordering.
                </div>
              ) : (
                <Button className="w-full" size="lg" onClick={() => setOrderOpen(true)}>
                  <ShoppingBag /> Order now · {formatCurrency(item.price)}
                </Button>
              )}
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                No online payment needed for food orders. Pay on delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="container-page mt-12">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              From the community
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Reviews &amp; ratings</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold">{averageRating.toFixed(1)}</span>
            <div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-3.5",
                      index < Math.round(averageRating)
                        ? "fill-[#e8a33d] text-[#e8a33d]"
                        : "text-[#e5d3c5]",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Based on {reviews.length} reviews</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar src={review.image} name={review.author} className="size-9" />
                  <div>
                    <p className="text-sm font-bold">{review.author}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(review.date)}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="size-3 fill-[#e8a33d] text-[#e8a33d]" />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page mt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Keep exploring
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                You might also like
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/menu?category=${encodeURIComponent(item.category)}`}>
                See category
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <MenuItemCard
                key={entry.id}
                item={entry}
                vendor={users.find((user) => user.id === entry.vendorId)}
              />
            ))}
          </div>
        </section>
      )}

      <OrderDialog
        open={orderOpen}
        onOpenChange={setOrderOpen}
        item={item}
        defaultAddress={currentUser.location ?? ""}
        onPlaced={(id) => {
          setPlaced({ id: params.id, orderId: id });
          setOrderOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}

function OrderDialog({
  open,
  onOpenChange,
  item,
  defaultAddress,
  onPlaced,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
  defaultAddress: string;
  onPlaced: (id: string) => void;
}) {
  const { createOrder } = useApp();
  const [deliveryDate, setDeliveryDate] = useState(daysFromNow(2));
  const [address, setAddress] = useState(defaultAddress);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = Number((item.price * quantity).toFixed(2));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!deliveryDate) {
      setError("Please choose a delivery date.");
      return;
    }
    if (isPastDate(deliveryDate)) {
      setError("Delivery date cannot be in the past.");
      return;
    }
    if (address.trim().length < 8) {
      setError("Please enter a complete delivery address.");
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = createOrder({
      itemId: item.id,
      deliveryDate,
      deliveryAddress: address,
      message,
      quantity,
    });
    setSubmitting(false);
    if (!result.ok || !result.id) {
      setError(result.error ?? "Could not place the order.");
      return;
    }
    toast.success("Order request sent to the kitchen!");
    onPlaced(result.id);
    setMessage("");
    setQuantity(1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Place your order</DialogTitle>
          <DialogDescription>
            {item.itemName} from {item.location}. The vendor will confirm your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-cream p-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
              <Image src={item.images[0]} alt={item.itemName} fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{item.itemName}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid size-7 place-items-center rounded-full hover:bg-secondary"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-5 text-center text-xs font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(9, value + 1))}
                className="grid size-7 place-items-center rounded-full hover:bg-secondary"
                aria-label="Increase quantity"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="delivery-date">Delivery date</Label>
            <Input
              id="delivery-date"
              type="date"
              min={daysFromNow(0)}
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              required
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Chosen date: {deliveryDate ? formatDate(deliveryDate, { weekday: "long" }) : "—"}
            </p>
          </div>

          <div>
            <Label htmlFor="delivery-address">Delivery address</Label>
            <Textarea
              id="delivery-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="House, road, area, city"
              required
            />
          </div>

          <div>
            <Label htmlFor="order-message">Special instructions (optional)</Label>
            <Textarea
              id="order-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Extra napkins, cut into 8 slices, allergies…"
              className="min-h-20"
            />
          </div>

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}

          <div className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span className="text-muted-foreground">Order total</span>
            <span className="text-lg font-extrabold text-primary">{formatCurrency(total)}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending request…" : "Send order request"}
            </Button>
          </DialogFooter>
        </form>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Requested {formatDateTime(new Date().toISOString())} · Status starts as pending
        </p>
      </DialogContent>
    </Dialog>
  );
}
