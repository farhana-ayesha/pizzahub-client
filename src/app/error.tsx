"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <Logo className="justify-center" />
        <span className="mx-auto mt-8 grid size-16 place-items-center rounded-2xl bg-[#fde7e4] text-[#a3271a]">
          <AlertTriangle className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.04em]">
          Something burned in the kitchen.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          An unexpected error stopped this page from loading. Try again, or head back to the
          homepage while we get things back in the oven.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home /> Back home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
