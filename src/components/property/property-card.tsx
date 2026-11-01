"use client";

import { BathIcon, BedDoubleIcon, RulerIcon } from "lucide-react";
import Link from "next/link";
import { coverImage, priceDropPercent, TYPE_LABELS, type Property } from "@/lib/domain/property";
import { formatArea } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MediaImage } from "./media-image";
import { PriceTag } from "./price-tag";
import { StatusBadge } from "./status-badge";

type Props = { property: Property; priority?: boolean; className?: string };

export function PropertyCard({ property: p, priority, className }: Props) {
  const drop = priceDropPercent(p);
  const cover = coverImage(p);
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <MediaImage
          media={cover}
          alt={cover?.alt || p.title}
          className="size-full transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          width={800}
          priority={priority}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {p.status !== "disponible" && <StatusBadge status={p.status} />}
          {drop && p.status === "disponible" && (
            <span className="rounded-full bg-price-drop px-2.5 py-0.5 text-xs font-semibold text-white">
              Rebajado {drop} %
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {TYPE_LABELS[p.type]} · {p.zone}, {p.city}
        </p>
        <h3 className="font-heading text-lg leading-snug font-semibold">
          <Link href={`/inmueble/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {p.title}
          </Link>
        </h3>
        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <RulerIcon className="size-4" aria-hidden /> {formatArea(p.builtArea)}
          </li>
          {p.bedrooms > 0 && (
            <li className="flex items-center gap-1.5">
              <BedDoubleIcon className="size-4" aria-hidden /> {p.bedrooms} hab.
            </li>
          )}
          {p.bathrooms > 0 && (
            <li className="flex items-center gap-1.5">
              <BathIcon className="size-4" aria-hidden /> {p.bathrooms} {p.bathrooms === 1 ? "baño" : "baños"}
            </li>
          )}
        </ul>
        <PriceTag property={p} size="lg" className="pt-1" />
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card" aria-hidden>
      <div className="aspect-4/3 animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
