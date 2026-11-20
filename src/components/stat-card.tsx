import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  tomato: "bg-[#fde7e1] text-[#c63a21]",
  gold: "bg-[#fdf0d5] text-[#9a650f]",
  basil: "bg-[#e5f2ea] text-[#2f6b4f]",
  plum: "bg-[#efe8f7] text-[#6b4a92]",
  sky: "bg-[#e8eefc] text-[#3d5b9e]",
};

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "tomato",
  trend,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  trend?: string;
}) {
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          {(hint || trend) && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              {trend && (
                <span className="inline-flex items-center gap-0.5 font-semibold text-[#2f6b4f]">
                  <TrendingUp className="size-3" /> {trend}
                </span>
              )}
              {hint}
            </p>
          )}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}
