"use client";

import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  Eye,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Role, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type RoleFilter = "all" | Role;

const roleVariant: Record<Role, "destructive" | "warning" | "secondary"> = {
  admin: "destructive",
  vendor: "warning",
  customer: "secondary",
};

export default function AdminUsersPage() {
  const { users, currentUser, toggleBlockUser } = useApp();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = users.filter((user) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.businessName?.toLowerCase().includes(query);
    const matchesRole = role === "all" || user.role === role;
    return matchesSearch && matchesRole;
  });

  async function confirmBlock() {
    if (!blockUser) return;
    setBusy(true);
    const result = await toggleBlockUser(blockUser.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update this user.");
      return;
    }
    toast.success(blockUser.isBlocked ? "User unblocked." : "User blocked from protected features.");
    setBlockUser(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin dashboard"
        title="Manage users"
        description="Search every registered account, review details and control access."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total users", value: users.length, icon: Users, tone: "bg-[#fde7e1] text-primary" },
          { label: "Vendors", value: users.filter((user) => user.role === "vendor").length, icon: Store, tone: "bg-[#fdf0d7] text-[#9a650f]" },
          { label: "Customers", value: users.filter((user) => user.role === "customer").length, icon: UserRound, tone: "bg-[#e5f2ea] text-[#2f6b4f]" },
          { label: "Blocked", value: users.filter((user) => user.isBlocked).length, icon: Ban, tone: "bg-[#fde7e4] text-[#a3271a]" },
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
                placeholder="Search by name, email or business…"
                className="pl-10"
              />
            </div>
            <Select
              value={role}
              onChange={(event) => setRole(event.target.value as RoleFilter)}
              className="sm:w-40"
              aria-label="Filter users by role"
            >
              <option value="all">All roles</option>
              <option value="customer">Customers</option>
              <option value="vendor">Vendors</option>
              <option value="admin">Admins</option>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {users.length} users
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Search className="size-6" />}
              title="No users found"
              description="No account matches this search and role filter."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setRole("all");
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar src={user.image} name={user.name} className="size-9" sizes="36px" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{user.name}</p>
                            <p className="max-w-52 truncate text-[11px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleVariant[user.role]} className="capitalize">
                          {user.role === "admin" && <ShieldCheck className="size-3" />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive"><Ban className="size-3" /> Blocked</Badge>
                        ) : (
                          <Badge variant="success"><CheckCircle2 className="size-3" /> Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setViewUser(user)}>
                            <Eye /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={user.isBlocked ? "text-[#2f6b4f] hover:bg-[#e5f2ea]" : "text-[#a3271a] hover:bg-[#fde7e4]"}
                            onClick={() => setBlockUser(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            {user.isBlocked ? <CheckCircle2 /> : <Ban />}
                            {user.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {filtered.map((user) => (
                <div key={user.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start gap-3">
                    <Avatar src={user.image} name={user.name} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge variant={roleVariant[user.role]} className="capitalize">{user.role}</Badge>
                        {user.isBlocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewUser(user)}>
                      <Eye /> Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={user.isBlocked ? "flex-1" : "flex-1 text-destructive"}
                      onClick={() => setBlockUser(user)}
                      disabled={user.id === currentUser?.id}
                    >
                      {user.isBlocked ? <CheckCircle2 /> : <Ban />}
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Dialog open={Boolean(viewUser)} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Read-only account information.</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div>
              <div className="flex items-center gap-3 rounded-xl bg-cream p-4">
                <Avatar src={viewUser.image} name={viewUser.name} className="size-14" sizes="56px" />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{viewUser.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{viewUser.email}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <Badge variant={roleVariant[viewUser.role]} className="capitalize">{viewUser.role}</Badge>
                    {viewUser.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="success">Active</Badge>}
                  </div>
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm">
                {viewUser.businessName && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Business name</dt>
                    <dd className="text-right font-semibold">{viewUser.businessName}</dd>
                  </div>
                )}
                {viewUser.role === "vendor" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Subscription</dt>
                    <dd className="text-right font-semibold capitalize">{viewUser.subscriptionPlan ?? "free"}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="text-right font-semibold">{viewUser.phone ?? "Not provided"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="text-right font-semibold">{viewUser.location ?? "Not provided"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="text-right font-semibold">{formatDate(viewUser.createdAt)}</dd>
                </div>
              </dl>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUser(null)}>Close</Button>
            {viewUser && viewUser.id !== currentUser?.id && (
              <Button
                variant={viewUser.isBlocked ? "default" : "destructive"}
                onClick={() => {
                  const target = viewUser;
                  setViewUser(null);
                  setBlockUser(target);
                }}
              >
                {viewUser.isBlocked ? "Unblock user" : "Block user"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(blockUser)} onOpenChange={(open) => !open && setBlockUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blockUser?.isBlocked ? "Unblock this user?" : "Block this user?"}
            </DialogTitle>
            <DialogDescription>
              {blockUser?.isBlocked
                ? `${blockUser?.name} will regain access to protected platform features.`
                : `${blockUser?.name} will be unable to access dashboards, order or manage menu items. Existing records are kept.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockUser(null)}>Cancel</Button>
            <Button variant={blockUser?.isBlocked ? "default" : "destructive"} onClick={confirmBlock} disabled={busy}>
              {busy ? "Updating…" : blockUser?.isBlocked ? "Unblock user" : "Block user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
