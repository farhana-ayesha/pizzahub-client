import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your PizzaHub account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <Skeleton className="mx-auto h-[520px] max-w-5xl rounded-[2rem]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
