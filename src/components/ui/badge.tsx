import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        success: "border-transparent bg-[#e4f3ea] text-[#246146]",
        warning: "border-transparent bg-[#fdf0d7] text-[#8a5a0a]",
        destructive: "border-transparent bg-[#fde7e4] text-[#a3271a]",
        info: "border-transparent bg-[#e8eefc] text-[#3557a8]",
        premium:
          "border-transparent bg-gradient-to-r from-[#f7d488] to-[#edb64f] text-[#553306]",
        dark: "border-transparent bg-foreground text-background",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
