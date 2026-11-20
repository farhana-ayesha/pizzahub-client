import { cn } from "@/lib/utils";

export function BarChart({
  data,
  className,
  color = "#db3a1f",
}: {
  data: { label: string; value: number }[];
  className?: string;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((entry) => entry.value));
  return (
    <div className={cn("flex h-44 items-end gap-2.5 sm:gap-3", className)}>
      {data.map((entry) => (
        <div key={entry.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div className="group relative w-full">
              <div
                className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${Math.max(8, (entry.value / max) * 128)}px`,
                  backgroundColor: color,
                }}
              />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background opacity-0 transition group-hover:opacity-100">
                {entry.value}
              </span>
            </div>
          </div>
          <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
            {entry.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  data,
  centerValue,
  centerLabel,
  className,
}: {
  data: { label: string; value: number; color: string }[];
  centerValue: string | number;
  centerLabel: string;
  className?: string;
}) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0) || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const segments = data.map((entry, index) => ({
    entry,
    length: (entry.value / total) * circumference,
    offset: data
      .slice(0, index)
      .reduce((sum, previous) => sum + (previous.value / total) * circumference, 0),
  }));

  return (
    <div className={cn("flex flex-col items-center gap-5 sm:flex-row sm:gap-6", className)}>
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f5e8dc" strokeWidth="12" />
          {segments.map(({ entry, length, offset }) => {
            return (
              <circle
                key={entry.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={entry.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0, length - 4)} ${circumference}`}
                strokeDashoffset={-offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold tracking-tight">{centerValue}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {centerLabel}
          </span>
        </div>
      </div>
      <div className="grid w-full gap-2">
        {data.map((entry) => (
          <div key={entry.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.label}
            </span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
