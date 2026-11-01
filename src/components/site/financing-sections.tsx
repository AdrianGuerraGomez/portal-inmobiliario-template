"use client";

import { CheckIcon } from "lucide-react";
import { useSiteContent } from "@/lib/content/use-content";

// Partes con texto editable de la página de hipotecas.

export function FinancingHero({ partnerName }: { partnerName: string }) {
  const c = useSiteContent().financing;
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-sm font-semibold tracking-widest text-cta uppercase">
            {c.eyebrow} · con {partnerName}
          </p>
          <h1 className="text-4xl font-semibold text-balance sm:text-5xl">{c.title}</h1>
          <p className="max-w-xl text-lg text-primary-foreground/85">{c.subtitle}</p>
        </div>
        <ul className="space-y-3 rounded-2xl bg-primary-foreground/10 p-6">
          {c.services.map((s) => (
            <li key={s} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <CheckIcon className="size-4" aria-hidden />
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FinancingRent() {
  const c = useSiteContent().financing;
  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-semibold sm:text-4xl">{c.rentTitle}</h2>
      <p className="text-lg text-secondary-foreground/80">{c.rentText}</p>
    </div>
  );
}
