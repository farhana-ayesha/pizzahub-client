import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { photos } from "@/lib/data";

const highlights = [
  "Save your favourite local pizza shops",
  "Track every order from pending to delivery",
  "Premium vendor perks built right in",
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-8 sm:py-12 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_-50px_rgba(80,35,12,0.55)] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden overflow-hidden bg-[#2a1710] lg:block">
          <Image
            src={photos.margherita}
            alt="Fresh pizza with basil"
            fill
            sizes="40vw"
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1710]/20 via-[#2a1710]/55 to-[#2a1710]" />
          <div className="relative flex h-full min-h-[620px] flex-col justify-between p-8 text-white">
            <Logo className="[&_span:last-child]:text-white" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e8a33d]">
                PizzaHub account
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.035em]">
                One account.
                <br />
                Every craving covered.
              </h2>
              <ul className="mt-6 space-y-3">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm text-[#e8d7c8]">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#e8a33d]" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm leading-6 text-[#f4e7db]">
                “The easiest way to find great local pizza. Ordered, tracked and delivered
                without a single hiccup.”
              </p>
              <p className="mt-2 text-xs font-bold text-[#e8a33d]">— Ayesha K., pizza regular</p>
            </div>
          </div>
        </aside>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Logo />
            <Link href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Back home
            </Link>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
