import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden warm-glow px-4 py-16">
      <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative w-full max-w-xl text-center">
        <Logo className="justify-center" />
        <p className="mt-10 text-[7rem] font-extrabold leading-none tracking-[-0.08em] text-primary/15 sm:text-[9rem]">
          404
        </p>
        <h1 className="-mt-8 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
          This slice is missing.
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The page you&apos;re looking for has been eaten, moved, or never existed. Let&apos;s get
          you back to the good stuff.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/menu">
              <Search /> Browse the menu
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home /> Back home
            </Link>
          </Button>
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Return to the PizzaHub homepage
        </Link>
      </div>
    </div>
  );
}
