"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Crown,
  Pencil,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { MenuStatusBadge } from "@/components/status-badge";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MenuItem, MenuStatus } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type Filter = "all" | MenuStatus;

export default function VendorMenuPage() {
  const {
    currentUser,
    menuItems,
    deleteMenuItem,
    toggleMenuItemActive,
  } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myItems = menuItems
    .filter((item) => item.vendorId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeCount = myItems.filter((item) => item.status === "approved" && item.active).length;
  const isPremium = currentUser.subscriptionPlan === "premium";

  const filtered = myItems.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(search.trim().toLowerCase());
    const matchesFilter = filter === "all" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  async function toggle(item: MenuItem) {
    setBusyId(item.id);
    const result = await toggleMenuItemActive(item.id, !item.active);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update availability.");
      return;
    }
    toast.success(item.active ? "Item marked unavailable." : "Item is now available.");
  }

  async function confirmDelete() {
    if (!selected) return;
    setBusyId(selected.id);
    const result = await deleteMenuItem(selected.id);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete the item.");
      return;
    }
    toast.success("Menu item deleted.");
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vendor dashboard"
        title="My menu items"
        description="Manage your published dishes, availability and approval status."
        action={
          <Button asChild>
            <Link href="/dashboard/vendor/menu/new">
              <Plus /> Add menu item
            </Link>
          </Button>
        }
      />

      {!isPremium && activeCount >= 3 && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#efd9b7] bg-[#fff8eb] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 text-sm text-[#6f4a17]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              You&apos;ve reached the Free plan limit of 3 active items. Upgrade to Premium for
              unlimited menu space.
            </span>
          </div>
          <Button asChild size="sm" variant="gold">
            <Link href="/dashboard/vendor/subscription">
              <Crown /> Upgrade
            </Link>
          </Button>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total items", value: myItems.length },
          { label: "Active & approved", value: activeCount },
          { label: "Pending review", value: myItems.filter((item) => item.status === "pending").length },
          { label: "Rejected", value: myItems.filter((item) => item.status === "rejected").length },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-extrabold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your items…"
                className="pl-10"
              />
            </div>
            <Select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className="sm:w-44"
              aria-label="Filter item status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {myItems.length} items
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<UtensilsCrossed className="size-6" />}
              title={myItems.length === 0 ? "Your menu is empty" : "No matching items"}
              description={
                myItems.length === 0
                  ? "Add your first pizza, side or drink. Items go live once an admin approves them."
                  : "Try another search or status filter."
              }
              action={
                myItems.length === 0 ? (
                  <Button asChild size="sm">
                    <Link href="/dashboard/vendor/menu/new">Add your first item</Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                  >
                    Reset filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={item.images[0]}
                              alt={item.itemName}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-48 truncate font-semibold">{item.itemName}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Added {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.category}
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        <MenuStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        {item.status === "approved" ? (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.active}
                            aria-label={`Toggle availability for ${item.itemName}`}
                            disabled={busyId === item.id}
                            onClick={() => toggle(item)}
                            className={cn(
                              "relative h-5 w-9 rounded-full transition disabled:opacity-50",
                              item.active ? "bg-[#2f6b4f]" : "bg-[#d8c5b6]",
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 size-4 rounded-full bg-white shadow transition",
                                item.active ? "left-[18px]" : "left-0.5",
                              )}
                            />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button asChild size="icon-sm" variant="ghost" aria-label="Edit item">
                            <Link href={`/dashboard/vendor/menu/${item.id}/edit`}>
                              <Pencil />
                            </Link>
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:bg-[#fde7e4] hover:text-destructive"
                            onClick={() => setSelected(item)}
                            aria-label="Delete item"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {filtered.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex gap-3">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={item.images[0]}
                        alt={item.itemName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.itemName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.category} · {formatCurrency(item.price)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <MenuStatusBadge status={item.status} />
                        {item.status === "approved" && (
                          <Badge variant={item.active ? "success" : "outline"}>
                            {item.active ? "Available" : "Unavailable"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                    {item.status === "approved" ? (
                      <button
                        type="button"
                        onClick={() => toggle(item)}
                        disabled={busyId === item.id}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {item.active ? "Mark unavailable" : "Mark available"}
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Awaiting review</span>
                    )}
                    <div className="flex gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/vendor/menu/${item.id}/edit`}>
                          <Pencil /> Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => setSelected(item)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this menu item?</DialogTitle>
            <DialogDescription>
              {selected?.itemName} will be permanently removed from your menu. Existing orders
              keep their history, but customers will no longer see the item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Keep item
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={busyId === selected?.id}
            >
              {busyId === selected?.id ? "Deleting…" : "Delete item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
