"use client";

import { MapPinIcon, PhoneIcon } from "lucide-react";
import { useSiteContent } from "@/lib/content/use-content";
import { ContactForm } from "./contact-form";
import { telHref } from "./nav";

export function ContactView() {
  const content = useSiteContent();
  const c = content.contact;
  const sell = content.home;
  return (
    <>
      <section className="border-b bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="font-heading text-3xl font-semibold sm:text-5xl">{c.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-secondary-foreground/80">{c.subtitle}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_460px] lg:py-16">
        <div className="space-y-10">
          <ul className="grid gap-6 sm:grid-cols-2">
            {content.company.offices.map((o) => (
              <li key={o.name} className="space-y-3 rounded-2xl border bg-card p-6">
                <h2 className="font-heading text-xl font-semibold">{o.name}</h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2 text-muted-foreground hover:text-foreground"
                >
                  <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    {o.address}
                    <span className="sr-only"> (abre Google Maps)</span>
                  </span>
                </a>
                {o.phone && (
                  <a href={telHref(o.phone)} className="flex items-center gap-2 text-lg font-semibold">
                    <PhoneIcon className="size-4" aria-hidden /> {o.phone}
                  </a>
                )}
                {o.hours && <p className="text-sm text-muted-foreground">{o.hours}</p>}
              </li>
            ))}
          </ul>

          <section id="vender" className="scroll-mt-24 space-y-3 rounded-2xl bg-primary p-8 text-primary-foreground">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{sell.sellTitle}</h2>
            <p className="text-primary-foreground/85">{sell.sellText}</p>
            <p className="text-sm text-primary-foreground/70">
              Elige «Vender mi casa» en el formulario y cuéntanos la dirección y los metros.
            </p>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 font-heading text-2xl font-semibold">Escríbenos</h2>
            <ContactForm showReason />
          </div>
        </div>
      </div>
    </>
  );
}
