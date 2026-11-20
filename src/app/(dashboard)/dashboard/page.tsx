"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";

const dashboardPath = {
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
  admin: "/dashboard/admin",
};

export default function DashboardIndex() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(currentUser ? dashboardPath[currentUser.role] : "/login?redirect=/dashboard");
  }, [currentUser, hydrated, router]);

  return (
    <div className="grid h-64 place-items-center text-sm text-muted-foreground">
      Taking you to your dashboard…
    </div>
  );
}
