import Link from "next/link";
import { Pizza } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="PizzaHub home"
    >
      <span className="relative grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#f06a36] to-[#c62f16] text-white shadow-[0_8px_20px_-10px_rgba(198,47,22,0.8)] transition-transform group-hover:-rotate-6">
        <Pizza className="size-5" strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#e8a33d] ring-2 ring-background" />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-[-0.045em] text-foreground sm:text-[1.35rem]">
          Pizza<span className="text-primary">Hub</span>
        </span>
      )}
    </Link>
  );
}
