"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  MapPin,
  Quote,
  Star,
  Store,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu-item-card";
import { Reveal } from "@/components/reveal";
import { benefits, categories, photos, steps, testimonials } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";

const benefitIcons = { Flame, MapPin, Clock, Crown };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function HomePage() {
  const { users, menuItems } = useApp();
  const publicItems = menuItems.filter(
    (item) => item.status === "approved" && item.active,
  );
  const featured = [...publicItems]
    .sort((a, b) => {
      const aPremium = users.find((user) => user.id === a.vendorId)?.subscriptionPlan === "premium";
      const bPremium = users.find((user) => user.id === b.vendorId)?.subscriptionPlan === "premium";
      return Number(bPremium) - Number(aPremium) || b.rating - a.rating;
    })
    .slice(0, 6);

  const cheapest = publicItems.length
    ? Math.min(...publicItems.map((item) => item.price))
    : 0;

  return (
    <div className="overflow-hidden">
      <section className="relative isolate border-b border-border warm-glow">
        <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-12 py-14 sm:py-18 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10 lg:py-24">
          <div className="relative z-10">
            <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
              <Badge variant="secondary" className="gap-2 border border-[#eed8c5] bg-white/70 py-1.5 pl-2 pr-3 text-[11px] uppercase tracking-[0.12em] backdrop-blur">
                <span className="grid size-5 place-items-center rounded-full bg-primary text-white">
                  <Flame className="size-3" />
                </span>
                Your local pizza marketplace
              </Badge>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="show"
              custom={0.08}
              variants={fadeUp}
              className="display-title mt-5 max-w-2xl text-[2.6rem] sm:text-6xl lg:text-[4.4rem]"
            >
              Hot &amp; <span className="text-gradient">fresh pizza</span> delivered to your door.
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              custom={0.16}
              variants={fadeUp}
              className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg"
            >
              Discover the best independent pizzerias near you, build the perfect order and
              track every slice from the oven to your doorstep.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              custom={0.24}
              variants={fadeUp}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Button asChild size="lg">
                <Link href="/menu">
                  Explore pizza menu <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/80">
                <Link href="#how-it-works">
                  How it works <UtensilsCrossed />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={0.32}
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <div className="flex items-center">
                {testimonials.map((person, index) => (
                  <Avatar
                    key={person.name}
                    src={person.image}
                    name={person.name}
                    className={cn("size-9 ring-2 ring-background", index > 0 && "-ml-2.5")}
                    sizes="36px"
                  />
                ))}
                <div className="ml-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-3.5 fill-[#e8a33d] text-[#e8a33d]" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    Loved by 2,400+ pizza people
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <Truck className="size-4 text-primary" />
                <span className="font-semibold">25 min</span>
                <span className="text-muted-foreground">avg. delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Store className="size-4 text-primary" />
                <span className="font-semibold">60+</span>
                <span className="text-muted-foreground">local shops</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <div className="absolute -left-8 top-10 size-28 rounded-full bg-[#e8a33d]/30 blur-2xl" />
            <div className="absolute -right-6 bottom-12 size-36 rounded-full bg-primary/15 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-secondary shadow-[0_35px_80px_-35px_rgba(80,35,12,0.55)]">
              <div className="relative aspect-[4/4.2] sm:aspect-[5/4] lg:aspect-[4/4.3]">
                <Image
                  src={photos.hero}
                  alt="A freshly baked pizza with basil and melted mozzarella"
                  fill
                  preload
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a1710]/40 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-white/30 bg-white/90 p-3 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Tonight&apos;s pick
                  </p>
                  <p className="text-sm font-extrabold sm:text-base">Truffle Margherita</p>
                  <p className="text-xs text-muted-foreground">Mario&apos;s Woodfire · 18–22 min</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-primary">
                    {formatCurrency(14.9)}
                  </p>
                  <IncognitoLink />
                </div>
              </div>
            </div>

            <div className="animate-float-slow absolute -left-3 top-8 rounded-2xl border border-border bg-white p-3 shadow-xl sm:-left-6 sm:top-12">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-[#e5f2ea] text-[#2f6b4f]">
                  <CheckCircle2 className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold">Order accepted</p>
                  <p className="text-[10px] text-muted-foreground">Fresh out of the oven</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 top-1/2 rounded-2xl border border-border bg-white px-3 py-2.5 shadow-xl sm:-right-5">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-[#e8a33d] text-[#e8a33d]" />
                <span className="text-sm font-extrabold">4.9</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">1,200+ reviews</p>
            </div>

            <div className="absolute -bottom-4 left-6 rounded-full border border-[#efd9b7] bg-[#fff6e3] px-3 py-2 shadow-lg sm:left-12">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8a5a0a]">
                <Crown className="size-3.5" /> Premium vendor pick
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-18 lg:py-20">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Fresh from the oven
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
              Featured pies worth a detour.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Hand-picked from the best local kitchens, starting at {formatCurrency(cheapest)}.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-auto">
            <Link href="/menu">
              Browse all items <ArrowRight />
            </Link>
          </Button>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.04}>
              <MenuItemCard
                item={item}
                vendor={users.find((user) => user.id === item.vendorId)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[#fffdfa] py-14 sm:py-18 lg:py-20">
        <div className="container-page">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Find your favourite
            </p>
            <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
              Every craving has a category.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              From classic margheritas to late-night sides and sweet finishes.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const count = publicItems.filter((item) => item.category === category.name).length;
              return (
                <Reveal key={category.name} delay={index * 0.04}>
                  <Link
                    href={`/menu?category=${encodeURIComponent(category.name)}`}
                    className="group relative block h-44 overflow-hidden rounded-2xl border border-border sm:h-48"
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#2a1710]/85 via-[#2a1710]/25 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                      <span>
                        <span className="text-lg font-bold text-white sm:text-xl">
                          {category.emoji} {category.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-[#eadbcd]">
                          {count} {count === 1 ? "item" : "items"} available
                        </span>
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-primary">
                        <ArrowRight className="size-4" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why-pizzahub" className="container-page scroll-mt-24 py-14 sm:py-18 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Why PizzaHub
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
              Better pizza, from people who care.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              We bring independent pizzerias and pizza lovers together with a simple,
              transparent ordering experience. No mystery fees, no cold boxes.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">Independent shops</Badge>
              <Badge variant="secondary">Transparent prices</Badge>
              <Badge variant="secondary">Human support</Badge>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[benefit.icon as keyof typeof benefitIcons];
              return (
                <Reveal key={benefit.title} delay={index * 0.05}>
                  <div className="h-full rounded-2xl border border-border bg-card p-5">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#fde7e1] text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{benefit.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-[#3d2418] bg-[#2a1710] py-14 text-white sm:py-18 lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e8a33d]">
              How PizzaHub works
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
              Three small steps. One very good dinner.
            </h2>
            <div className="mt-8 grid gap-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8a33d] text-sm font-extrabold text-[#3b230a]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#d8c4b4]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="gold" className="mt-6">
              <Link href="/menu">
                Start an order <ArrowRight />
              </Link>
            </Button>
          </Reveal>

          <Reveal delay={0.08} className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10">
              <Image
                src={photos.chef}
                alt="A chef finishing a wood-fired pizza"
                fill
                sizes="(max-width: 1024px) 90vw, 36vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a1710]/70 to-transparent" />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-[#2a1710]/80 p-3 backdrop-blur sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e8a33d]">
                    Order #1002
                  </p>
                  <p className="text-sm font-bold">Quattro Formaggi · 2 items</p>
                </div>
                <Badge variant="success">Accepted</Badge>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      step <= 3 ? "bg-[#e8a33d]" : "bg-white/15",
                    )}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-14 sm:py-18 lg:py-20">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Pizza people say
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            Good crust. Great company.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((review, index) => (
            <Reveal key={review.name} delay={index * 0.05}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={starIndex} className="size-4 fill-[#e8a33d] text-[#e8a33d]" />
                    ))}
                  </div>
                  <Quote className="size-6 text-[#eed8c5]" />
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                  “{review.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar src={review.image} name={review.name} className="size-9" />
                  <div>
                    <p className="text-sm font-bold">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#df3b20] via-[#d3381e] to-[#a92a12] px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="absolute -right-12 -top-16 size-56 rounded-full border-[24px] border-white/10" />
            <div className="absolute -bottom-20 left-1/3 size-52 rounded-full bg-[#e8a33d]/20 blur-2xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffd9a1]">
                  For restaurant owners
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
                  Run a pizza shop? Put it on the map.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#ffe6d7] sm:text-base">
                  Publish your menu, manage orders and grow with a free vendor plan. Go
                  Premium for unlimited items and featured placement.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:shrink-0">
                <Button asChild size="lg" variant="secondary" className="bg-white text-[#a92a12] hover:bg-[#fff3e8]">
                  <Link href="/register?role=vendor">
                    Join as a vendor <Store />
                  </Link>
                </Button>
                <p className="text-center text-[11px] text-[#ffd9c7]">
                  Free to start · No setup fee
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function IncognitoLink() {
  return (
    <Link href="/menu" className="text-[11px] font-bold text-primary hover:underline">
      Order now →
    </Link>
  );
}
