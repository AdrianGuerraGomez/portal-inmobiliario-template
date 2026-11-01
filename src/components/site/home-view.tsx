"use client";

import { ArrowRightIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useContentImage, useSiteContent } from "@/lib/content/use-content";
import { imageSrc, imageSrcSet } from "@/lib/media/image-url";
import { FeaturedProperties } from "./featured-properties";
import { HeroSearch } from "./hero-search";
import { MapSection } from "./map-section";

export function HomeView() {
  const c = useSiteContent().home;
  const hero = useContentImage(c.heroImage);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element -- imagen editable (URL o subida desde el panel)
          <img
            src={imageSrc(hero, 1600)}
            srcSet={imageSrcSet(hero)}
            sizes="100vw"
            alt={c.heroImageAlt}
            fetchPriority="high"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-primary via-primary/70 to-primary/20" aria-hidden />
        <div className="mx-auto flex min-h-[78svh] max-w-7xl flex-col justify-end gap-8 px-4 pt-32 pb-12 sm:px-6 sm:pb-16">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold tracking-widest text-cta uppercase">{c.eyebrow}</p>
            <h1 className="font-heading text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl">{c.title}</h1>
            <p className="max-w-xl text-lg text-primary-foreground/85">{c.subtitle}</p>
          </div>
          <HeroSearch />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{c.featuredTitle}</h2>
        </div>
        <FeaturedProperties />
      </section>

      <MapSection />

      <section className="bg-secondary">
        <ul className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          {c.values.map((v, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckIcon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-heading text-xl font-semibold">{v.title}</h3>
                <p className="mt-1 text-secondary-foreground/80">{v.text}</p>
                {v.href && (
                  <Link
                    href={v.href}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    Saber más <ArrowRightIcon className="size-3.5" aria-hidden />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{c.sellTitle}</h2>
            <p className="text-lg text-primary-foreground/85">{c.sellText}</p>
          </div>
          <Button asChild variant="cta" size="lg" className="h-12 px-6 text-base">
            <Link href="/contacto#vender">
              {c.sellCta} <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
