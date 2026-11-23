"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Clock,
  EyeOff,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  X,
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
import { formatCurrency, formatDate } from "@/lib/utils";

type Filter = "all" | MenuStatus;

export default function AdminMenuPage() {
  const { menuItems, users, setMenuStatus, deleteMenuItem } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = menuItems.filter((item) => item.status === "pending").length;
  const filtered = menuItems.filter((item) => {
    const vendor = users.find((user) => user.id === item.vendorId);
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.itemName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      vendor?.businessName?.toLowerCase().includes(query);
    const matchesFilter = filter === "all" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  async function updateStatus(item: MenuItem, status: MenuStatus) {
    setBusyId(item.id);
    const result = await setMenuStatus(item.id, status);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the item.");
      return;
    }
    toast.success(
      status === "approved"
        ? "Item approved and visible on the public menu."
        : status === "rejected"
          ? "Item rejected."
          : "Item status updated.",
    );
  }

  async function confirmDelete() {
    if (!selected) return;
    setBusyId(selected.id);
    const result = await deleteMenuItem(selected.id);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete this item.");
      return;
    }
    toast.success("Menu item removed from the platform.");
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin dashboard"
        title="Manage menu items"
        description="Approve submissions, change published status and remove inappropriate items."
        action={
          pending > 0 ? (
            <Badge variant="warning" className="px-3 py-1.5">
              <Clock className="size-3.5" /> {pending} pending review
            </Badge>
          ) : (
            <Badge variant="success" className="px-3 py-1.5">
              <Check className="size-3.5" /> Queue clear
            </Badge>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "All items", value: menuItems.length, icon: ShoppingBag, tone: "bg-[#fde7e1] text-primary" },
          { label: "Approved", value: menuItems.filter((item) => item.status === "approved").length, icon: Check, tone: "bg-[#e5f2ea] text-[#2f6b4f]" },
          { label: "Pending", value: pending, icon: Clock, tone: "bg-[#fdf0d7] text-[#9a650f]" },
          { label: "Rejected / inactive", value: menuItems.filter((item) => item.status === "rejected" || item.status === "inactive").length, icon: EyeOff, tone: "bg-[#f0e9e3] text-[#7d6354]" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-3 p-4">
              <span className={`grid size-9 place-items-center rounded-xl ${stat.tone}`}>
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-extrabold">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search item, category or vendor…"
                className="pl-10"
              />
            </div>
            <Select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className="sm:w-44"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">Showing {filtered.length} items</p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<UtensilsCrossed className="size-6" />}
              title="No menu items match"
              description="Try a different search term or status filter."
              action={
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
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Review actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const vendor = users.find((user) => user.id === item.vendorId);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                              <Image src={item.images[0]} alt={item.itemName} fill sizes="64px" className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-44 truncate font-semibold">{item.itemName}</p>
                              <p className="text-[11px] text-muted-foreground">Added {formatDate(item.createdAt)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="max-w-36 truncate text-xs font-semibold">{vendor?.businessName}</p>
                          <p className="text-[10px] text-muted-foreground">{item.location}</p>
                        </TableCell>
                        <TableCell className="max-w-36 text-xs text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(item.price)}</TableCell>
                        <TableCell><MenuStatusBadge status={item.status} /></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {item.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#2f6b4f] hover:bg-[#e5f2ea]"
                                disabled={busyId === item.id}
                                onClick={() => updateStatus(item, "approved")}
                              >
                                <Check /> {item.status === "inactive" ? "Publish" : "Approve"}
                              </Button>
                            )}
                            {item.status === "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={busyId === item.id}
                                onClick={() => updateStatus(item, "inactive")}
                              >
                                <EyeOff /> Unpublish
                              </Button>
                            )}
                            {item.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#a3271a] hover:bg-[#fde7e4]"
                                disabled={busyId === item.id}
                                onClick={() => updateStatus(item, "rejected")}
                              >
                                <X /> Reject
                              </Button>
                            )}
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="text-destructive hover:bg-[#fde7e4]"
                              onClick={() => setSelected(item)}
                              aria-label="Delete item"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filtered.map((item) => {
                const vendor = users.find((user) => user.id === item.vendorId);
                return (
                  <div key={item.id} className="rounded-xl border border-border p-3">
                    <div className="flex gap-3">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <Image src={item.images[0]} alt={item.itemName} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{item.itemName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {vendor?.businessName} · {formatCurrency(item.price)}
                        </p>
                        <div className="mt-1.5"><MenuStatusBadge status={item.status} /></div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                      {item.status !== "approved" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(item, "approved")}>
                          <Check /> {item.status === "inactive" ? "Publish" : "Approve"}
                        </Button>
                      )}
                      {item.status !== "rejected" && (
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(item, "rejected")}>
                          <X /> Reject
                        </Button>
                      )}
                      {item.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(item, "inactive")}>
                          <EyeOff /> Unpublish
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setSelected(item)}>
                        <Trash2 /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this menu item?</DialogTitle>
            <DialogDescription>
              {selected?.itemName} will be permanently removed from the platform. This action is
              recorded for admin review and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Keep item</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busyId === selected?.id}>
              {busyId === selected?.id ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
