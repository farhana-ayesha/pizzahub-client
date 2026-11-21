"use client";

import Link from "next/link";
import { Heart, UtensilsCrossed } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { MenuItemCard } from "@/components/menu-item-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default function CustomerFavoritesPage() {
  const { currentUser, favourites, menuItems, users } = useApp();

  if (!currentUser) return null;

  const savedItems = favourites
    .map((id) => menuItems.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div>
      <PageHeader
        eyebrow="Customer dashboard"
        title="My favourites"
        description="The pizzas you saved for later. Favourites stay on this device and are tied to your account."
        action={
          <Button asChild>
            <Link href="/menu">
              <UtensilsCrossed /> Browse menu
            </Link>
          </Button>
        }
      />

      {savedItems.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="No favourites yet"
          description="Tap the heart on any menu item to keep it here for your next pizza night."
          action={
            <Button asChild size="sm">
              <Link href="/menu">Find a favourite</Link>
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {savedItems.length} saved {savedItems.length === 1 ? "item" : "items"}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                vendor={users.find((user) => user.id === item.vendorId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
