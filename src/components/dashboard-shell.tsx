"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  Bell,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  PlusCircle,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const dashboardPath: Record<Role, string> = {
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
  admin: "/dashboard/admin",
};

const roleTitle: Record<Role, string> = {
  customer: "Customer workspace",
  vendor: "Restaurant workspace",
  admin: "Platform control",
};

const navByRole: Record<Role, NavItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/orders", label: "My Orders", icon: ReceiptText },
    { href: "/dashboard/settings", label: "Profile Settings", icon: Settings },
  ],
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/menu", label: "My Menu Items", icon: UtensilsCrossed },
    { href: "/dashboard/vendor/menu/new", label: "Add Menu Item", icon: PlusCircle },
    { href: "/dashboard/vendor/orders", label: "Customer Orders", icon: ClipboardList },
    { href: "/dashboard/vendor/subscription", label: "Subscription", icon: Crown },
    { href: "/dashboard/settings", label: "Profile Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/menu", label: "Manage Menu Items", icon: ShoppingBag },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: BadgeDollarSign },
    { href: "/dashboard/settings", label: "Profile Settings", icon: Settings },
  ],
};

function DashboardLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="relative grid size-14 place-items-center rounded-2xl bg-primary/10">
          <UtensilsCrossed className="size-6 animate-pulse text-primary" />
        </span>
        <p className="text-sm font-semibold text-muted-foreground">Warming up your dashboard…</p>
      </div>
    </div>
  );
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  function isActive(href: string) {
    if (href.endsWith("/menu")) {
      return pathname.startsWith(href) && !pathname.includes("/menu/new");
    }
    return pathname === href;
  }

  return (
    <nav className="grid gap-1" aria-label="Dashboard navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-14px_rgba(219,58,31,0.9)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", active ? "text-white" : "text-muted-foreground")} />
            <span className="truncate">{item.label}</span>
            {active && <ChevronRight className="ml-auto size-3.5" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, hydrated, signOut } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const section = pathname.split("/")[2] as Role | undefined;
  const isRoleSection = section === "customer" || section === "vendor" || section === "admin";

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (pathname === "/dashboard") {
      router.replace(dashboardPath[currentUser.role]);
      return;
    }
    if (isRoleSection && section !== currentUser.role) {
      router.replace(dashboardPath[currentUser.role]);
    }
  }, [hydrated, currentUser, pathname, router, isRoleSection, section]);

  const navItems = useMemo(
    () => (currentUser ? navByRole[currentUser.role] : []),
    [currentUser],
  );
  const pageTitle = useMemo(() => {
    if (!currentUser) return "Dashboard";
    const exact = navItems.find((item) => item.href === pathname);
    if (exact) return exact.label;
    if (pathname.includes("/menu/new")) return "Add Menu Item";
    if (pathname.includes("/menu/") && pathname.endsWith("/edit")) return "Edit Menu Item";
    const partial = navItems.find(
      (item) => item.href !== "/dashboard" && pathname.startsWith(item.href + "/"),
    );
    return partial?.label ?? "Dashboard";
  }, [currentUser, navItems, pathname]);

  if (!hydrated || !currentUser || (isRoleSection && section !== currentUser.role)) {
    return <DashboardLoader />;
  }

  function handleSignOut() {
    signOut();
    toast.success("Signed out.");
    router.push("/login");
  }

  const plan = currentUser.subscriptionPlan;

  return (
    <div className="flex min-h-screen bg-[#fdf8f2]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-[#fffdfa] px-4 py-5 lg:flex">
        <Logo href={dashboardPath[currentUser.role]} />
        <div className="mt-5 rounded-xl bg-cream px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {roleTitle[currentUser.role]}
          </p>
          <p className="mt-0.5 truncate text-sm font-bold">
            {currentUser.role === "vendor" ? currentUser.businessName : currentUser.name}
          </p>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          <NavLinks items={navItems} pathname={pathname} />
        </div>

        <div className="mt-4 space-y-2">
          {currentUser.role === "vendor" ? (
            <div className="rounded-xl border border-[#efd9b7] bg-gradient-to-br from-[#fff6e3] to-[#fde9c4] p-3">
              <div className="flex items-center justify-between">
                <Badge variant={plan === "premium" ? "premium" : "outline"}>
                  {plan === "premium" ? "Premium" : "Free plan"}
                </Badge>
                <Crown className="size-4 text-[#b67a1d]" />
              </div>
              <p className="mt-2 text-xs leading-5 text-[#6f4a17]">
                {plan === "premium"
                  ? "Unlimited menu items and featured placement."
                  : "3 active items included. Upgrade for unlimited menu space."}
              </p>
              <Button asChild size="sm" variant={plan === "premium" ? "outline" : "gold"} className="mt-2.5 w-full">
                <Link href="/dashboard/vendor/subscription">
                  {plan === "premium" ? "Manage plan" : "Upgrade plan"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-semibold">Need a hand?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Our support team is happy to help with your account.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2.5 w-full">
                <a href="mailto:hello@pizzahub.com">Contact support</a>
              </Button>
            </div>
          )}
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/menu">
              <Store /> Browse public menu
            </Link>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-[#fdf8f2]/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-xl border border-border bg-card lg:hidden"
              aria-label="Open dashboard menu"
            >
              <MenuIcon className="size-5" />
            </button>
            <Logo href={dashboardPath[currentUser.role]} compact className="lg:hidden" />
            <div className="hidden min-w-0 sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {roleTitle[currentUser.role]}
              </p>
              <p className="truncate text-sm font-bold">{pageTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/menu">
                <Store /> Browse menu
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => toast.info("You are all caught up. No new notifications.")}
              className="relative grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2 transition hover:bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar src={currentUser.image} name={currentUser.name} className="size-7" sizes="28px" />
                  <span className="hidden max-w-24 truncate text-xs font-semibold sm:block">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="normal-case tracking-normal">
                  <span className="block truncate text-sm font-bold text-foreground">
                    {currentUser.name}
                  </span>
                  <span className="block truncate text-xs font-medium text-muted-foreground">
                    {currentUser.email}
                  </span>
                </DropdownMenuLabel>
                <div className="px-2.5 pb-2">
                  <Badge variant="secondary" className="capitalize">
                    {currentUser.role}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <UserRound /> Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/menu">
                    <Store /> Browse menu
                  </Link>
                </DropdownMenuItem>
                {currentUser.role === "vendor" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/vendor/subscription">
                      <CreditCard /> Subscription
                    </Link>
                  </DropdownMenuItem>
                )}
                {currentUser.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin">
                      <ShieldCheck /> Admin overview
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleSignOut}
                  className="text-destructive focus:bg-[#fde7e4] focus:text-destructive [&_svg]:text-destructive"
                >
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        {currentUser.role === "vendor" && (
          <p className="px-6 pb-6 text-xs text-muted-foreground">
            {plan === "premium"
              ? `Premium plan active${currentUser.subscriptionExpiresAt ? ` · renews ${formatDate(currentUser.subscriptionExpiresAt)}` : ""}`
              : "Free plan · upgrade any time for unlimited menu items."}
          </p>
        )}
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Logo href={dashboardPath[currentUser.role]} compact /> Navigation
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-cream p-3">
            <Avatar src={currentUser.image} name={currentUser.name} className="size-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{currentUser.name}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">{currentUser.role}</p>
            </div>
          </div>
          <NavLinks
            items={navItems}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
          <div className="mt-4 grid gap-2 border-t border-border pt-4">
            <Button asChild variant="outline" onClick={() => setMobileOpen(false)}>
              <Link href="/menu" onClick={() => setMobileOpen(false)}>
                <Store /> Browse menu
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut /> Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
