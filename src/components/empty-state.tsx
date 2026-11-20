import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddc4b0] bg-[#fffaf4] px-6 py-14 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
        {icon}
      </span>
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
      {!action && actionLabel && actionHref && (
        <Button asChild className="mt-5" size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
