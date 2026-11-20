import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your PizzaHub account to order, track and manage pizzas.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <Skeleton className="mx-auto h-[620px] max-w-5xl rounded-[2rem]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
