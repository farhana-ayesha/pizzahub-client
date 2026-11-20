"use client";

import * as React from "react";
import Image from "next/image";
import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
  sizes?: string;
}

function Avatar({ src, name, className, sizes = "48px" }: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-bold text-secondary-foreground ring-2 ring-white",
        className,
      )}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export { Avatar };
