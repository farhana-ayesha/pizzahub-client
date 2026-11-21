"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  MapPin,
  Pizza,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { MenuItemCard } from "@/components/menu-item-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

const priceRanges = [
  { value: "all", label: "Any price" },
  { value: "under-10", label: "Under $10" },
  { value: "10-15", label: "$10 – $15" },
  { value: "15-20", label: "$15 – $20" },
  { value: "over-20", label: "$20+" },
];

export function MenuBrowser() {
  const searchParams = useSearchParams();
  const { menuItems, users } = useApp();
  const paramCategory = searchParams.get("category");

  const [search, setSearch] = useState("");
  const [categoryOverride, setCategoryOverride] = useState<{
    param: string | null;
    value: string;
  } | null>(null);
  const category =
    categoryOverride && categoryOverride.param === paramCategory
      ? categoryOverride.value
      : (paramCategory ?? "all");
  const [location, setLocation] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [loading, setLoading] = useState(true);

  function setCategory(value: string) {
    setCategoryOverride({ param: paramCategory, value });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const publicItems = useMemo(
    () =>
      menuItems.filter(
        (item) => item.status === "approved" && item.active,
      ),
    [menuItems],
  );

  const availableLocations = useMemo(
    () =>
      Array.from(new Set(publicItems.map((item) => item.location)))
        .filter(Boolean)
        .sort(),
    [publicItems],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = publicItems.filter((item) => {
      const vendor = users.find((user) => user.id === item.vendorId);
      const matchesSearch =
        !query ||
        item.itemName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        vendor?.businessName?.toLowerCase().includes(query);
      const matchesCategory = category === "all" || item.category === category;
      const matchesLocation = location === "all" || item.location === location;
      const matchesPrice =
        price === "all" ||
        (price === "under-10" && item.price < 10) ||
        (price === "10-15" && item.price >= 10 && item.price < 15) ||
        (price === "15-20" && item.price >= 15 && item.price <= 20) ||
        (price === "over-20" && item.price > 20);
      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });

    return result.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.itemName.localeCompare(b.itemName);
      if (sort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "rating") return b.rating - a.rating;
      const aPremium =
        users.find((user) => user.id === a.vendorId)?.subscriptionPlan === "premium";
      const bPremium =
        users.find((user) => user.id === b.vendorId)?.subscriptionPlan === "premium";
      return Number(bPremium) - Number(aPremium) || b.rating - a.rating;
    });
  }, [publicItems, search, category, location, price, sort, users]);

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    location !== "all" ||
    price !== "all" ||
    sort !== "recommended";

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setLocation("all");
    setPrice("all");
    setSort("recommended");
  }

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-border warm-glow">
        <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="container-page relative py-12 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eed8c5] bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8a5a0a] backdrop-blur">
                <Sparkles className="size-3.5" /> Approved &amp; available now
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
                Find your next favourite slice.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Browse {publicItems.length} dishes from neighbourhood pizzerias. Search by
                dish, filter by location, and sort by exactly what you fancy.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/75 p-3 backdrop-blur sm:p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fde7e1] text-primary">
                <Pizza className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Browse freely</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  Sign in only when you&apos;re ready to order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page">
        <Card className="-mt-6 relative z-10 p-4 shadow-[0_18px_50px_-35px_rgba(80,35,12,0.45)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="size-4 text-primary" />
              Filter the menu
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <X className="size-3" /> Clear all
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pizza, sides, vendor…"
                className="pl-10"
                aria-label="Search menu items"
              />
            </div>
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((entry) => (
                <option key={entry.name} value={entry.name}>
                  {entry.name}
                </option>
              ))}
            </Select>
            <Select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              aria-label="Filter by location"
            >
              <option value="all">All locations</option>
              {availableLocations.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </Select>
            <Select
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              aria-label="Filter by price"
            >
              {priceRanges.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort menu items"
                className="pl-10"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="newest">Newest first</option>
                <option value="name">Name A–Z</option>
              </Select>
            </div>
          </div>
        </Card>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-bold text-foreground">{filtered.length}</span> of{" "}
            {publicItems.length} items
            {category !== "all" && (
              <>
                {" "}
                in <span className="font-semibold text-foreground">{category}</span>
              </>
            )}
          </p>
          {location !== "all" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              <MapPin className="size-3" /> {location}
              <button
                type="button"
                onClick={() => setLocation("all")}
                aria-label="Remove location filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card p-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="mt-4 h-5 w-2/3" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <div className="mt-5 flex justify-between">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<Search className="size-6" />}
              title="No slices match that search"
              description="Try a different dish, widen the price range, or clear your filters to see the full menu."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className={cn("mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3")}>
            {filtered.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                vendor={users.find((user) => user.id === item.vendorId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
