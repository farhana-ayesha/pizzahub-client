import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M14 8.5h3V4.5h-3c-2.76 0-5 2.24-5 5v2.5H6v4h3v7h4v-7h3l1-4h-4V9.5c0-.55.45-1 1-1Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

const footerLinks = {
  Explore: [
    { label: "Home", href: "/" },
    { label: "Browse menu", href: "/menu" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Why PizzaHub", href: "/#why-pizzahub" },
  ],
  Account: [
    { label: "Sign in", href: "/login" },
    { label: "Create account", href: "/register" },
    { label: "Customer dashboard", href: "/dashboard/customer" },
    { label: "Vendor dashboard", href: "/dashboard/vendor" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-[#2a1710] text-[#f8ecdf]">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo className="[&_span:last-child]:text-white" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#d8c4b4]">
              Your neighbourhood pizza marketplace. Discover independent shops, order
              your favourites, and get them delivered hot.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="PizzaHub on X"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-primary"
              >
                <XIcon className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="PizzaHub on Instagram"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-primary"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="PizzaHub on Facebook"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-primary"
              >
                <FacebookIcon className="size-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#f2c99f]">
                {title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#d8c4b4] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#f2c99f]">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#d8c4b4]">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#e8a33d]" />
                <span>18 Crust Lane, Gulshan, Dhaka 1212</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-[#e8a33d]" />
                <a href="mailto:hello@pizzahub.com" className="hover:text-white">
                  hello@pizzahub.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[#e8a33d]" />
                <a href="tel:+14155550100" className="hover:text-white">
                  +1 (415) 555-0100
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#bda593] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PizzaHub. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/#why-pizzahub" className="hover:text-white">
              Our promise
            </Link>
            <Link href="/menu" className="hover:text-white">
              Local shops
            </Link>
            <span>Made with dough &amp; love.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
