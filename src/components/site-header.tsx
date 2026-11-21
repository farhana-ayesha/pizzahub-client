"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Logo } from "@/components/logo";
import { useApp } from "@/components/app-provider";
import { cn } from "@/lib/utils";

const dashboardPath = {
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
  admin: "/dashboard/admin",
} as const;

const roleLabel = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
} as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, hydrated, signOut } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Browse Menu" },
  ];

  if (currentUser) {
    links.push({ href: dashboardPath[currentUser.role], label: "Dashboard" });
  }

  function handleSignOut() {
    signOut();
    setMobileOpen(false);
    toast.success("Signed out. See you soon!");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!hydrated ? (
            <div className="h-10 w-40 animate-pulse rounded-full bg-secondary" />
          ) : currentUser ? (
            <>
              <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
                <Link href={dashboardPath[currentUser.role]}>
                  {currentUser.role === "admin" ? (
                    <ShieldCheck />
                  ) : currentUser.role === "vendor" ? (
                    <Store />
                  ) : (
                    <LayoutDashboard />
                  )}
                  My dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pl-1.5 pr-2.5 text-left transition hover:border-[#d9bca6] hover:bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar
                      src={currentUser.image}
                      name={currentUser.name}
                      className="size-8"
                      sizes="32px"
                    />
                    <span className="hidden max-w-28 truncate text-sm font-semibold lg:block">
                      {currentUser.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="normal-case tracking-normal">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {currentUser.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </DropdownMenuLabel>
                  <div className="flex flex-wrap gap-1.5 px-2.5 pb-2">
                    <Badge variant={currentUser.role === "vendor" ? "premium" : "secondary"}>
                      {roleLabel[currentUser.role]}
                      {currentUser.subscriptionPlan === "premium" ? " · Premium" : ""}
                    </Badge>
                    {currentUser.isBlocked && (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={dashboardPath[currentUser.role]}>
                      <LayoutDashboard /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {currentUser.role === "customer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/customer/favorites">
                        <Heart /> My favourites
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings /> Profile settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/menu">
                      <Store /> Browse menu
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleSignOut}
                    className="text-destructive focus:bg-[#fde7e4] focus:text-destructive [&_svg]:text-destructive"
                  >
                    <LogOut /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid size-10 place-items-center rounded-xl border border-border bg-card text-foreground md:hidden"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="size-5" />
        </button>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
            <DialogDescription>Fresh pizza is only a tap away.</DialogDescription>
          </DialogHeader>

          {currentUser && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-cream p-3">
              <Avatar src={currentUser.image} name={currentUser.name} className="size-11" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{currentUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
          )}

          <div className="grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                <UserRound className="size-4 text-muted-foreground" />
                {link.label}
              </Link>
            ))}
            {currentUser && currentUser.role === "customer" && (
              <Link
                href="/dashboard/customer/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                <Heart className="size-4 text-muted-foreground" />
                My favourites
              </Link>
            )}
            {currentUser && (
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                <Settings className="size-4 text-muted-foreground" />
                Profile settings
              </Link>
            )}
          </div>

          <div className="mt-5 grid gap-2">
            {currentUser ? (
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut /> Log out
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Create account
                  </Link>
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
