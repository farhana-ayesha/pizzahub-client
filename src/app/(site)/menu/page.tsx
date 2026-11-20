import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuBrowser } from "./menu-browser";

export const metadata: Metadata = {
  title: "Browse Menu",
  description:
    "Explore pizza, sides, drinks and desserts from local PizzaHub vendors.",
};

function MenuFallback() {
  return (
    <div className="container-page py-10">
      <Skeleton className="h-48 w-full rounded-[2rem]" />
      <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="mt-4 h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuFallback />}>
      <MenuBrowser />
    </Suspense>
  );
}
