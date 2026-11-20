import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a customer or vendor account and join the PizzaHub marketplace.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <Skeleton className="mx-auto h-[680px] max-w-5xl rounded-[2rem]" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
