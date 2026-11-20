"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { MenuItemForm } from "@/components/menu-item-form";
import { Button } from "@/components/ui/button";

export default function EditMenuItemPage() {
  const params = useParams<{ id: string }>();
  const { menuItems, currentUser } = useApp();
  const item = menuItems.find((entry) => entry.id === params.id);

  if (!currentUser) return null;

  if (!item) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <AlertCircle className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 text-xl font-bold">Menu item not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been deleted. Head back to your menu to keep managing items.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard/vendor/menu">
            <ArrowLeft /> Back to my menu
          </Link>
        </Button>
      </div>
    );
  }

  if (item.vendorId !== currentUser.id) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <AlertCircle className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 text-xl font-bold">You can&apos;t edit this item</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This menu item belongs to another vendor. Vendors can only manage their own items.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard/vendor/menu">Back to my menu</Link>
        </Button>
      </div>
    );
  }

  return <MenuItemForm mode="edit" item={item} />;
}
