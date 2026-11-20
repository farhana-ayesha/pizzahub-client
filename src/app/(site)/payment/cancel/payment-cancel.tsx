"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, HelpCircle, ShieldCheck, XCircle } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PaymentCancel() {
  const router = useRouter();
  const { hydrated, currentUser } = useApp();

  useEffect(() => {
    if (hydrated && !currentUser) router.replace("/login?redirect=/payment/cancel");
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) {
    return (
      <div className="container-page py-20 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#fdf0d7] text-[#9a650f] ring-8 ring-[#fffaef]">
            <XCircle className="size-10" />
          </span>
          <Badge variant="warning" className="mt-5">Checkout cancelled</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            No charge was made.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            You left the secure checkout before completing the Premium subscription. Your current
            plan is unchanged.
          </p>
        </div>

        <Card className="mt-7 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#2f6b4f]" />
            <div>
              <p className="text-sm font-bold">Your account is safe</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Cancelling checkout does not affect your menu, orders or existing subscription.
                You can upgrade any time from the subscription page.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
            <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold">Need help?</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Email{" "}
                <a href="mailto:hello@pizzahub.com" className="font-semibold text-primary hover:underline">
                  hello@pizzahub.com
                </a>{" "}
                and we&apos;ll walk you through it.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg" variant="gold">
            <Link href="/dashboard/vendor/subscription">
              <Crown /> Try again
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/vendor">
              <ArrowLeft /> Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
