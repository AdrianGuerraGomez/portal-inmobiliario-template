"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/property-card";
import { useRepoQuery } from "@/lib/data/provider";

const LIMIT = 6;

// Destacados primero; si no llegan a 6, se completa con los más recientes.
export function FeaturedProperties() {
  const { data } = useRepoQuery(
    (r) => r.listProperties({ onlyPublished: true, status: ["disponible", "reservado"] }),
    [],
  );
  const items = data ? [...data.filter((p) => p.featured), ...data.filter((p) => !p.featured)].slice(0, LIMIT) : null;

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items
          ? items.map((p, i) => (
              <li key={p.id} className="flex">
                <PropertyCard property={p} priority={i < 3} className="w-full" />
              </li>
            ))
          : Array.from({ length: 3 }, (_, i) => (
              <li key={i}>
                <PropertyCardSkeleton />
              </li>
            ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <Link
          href="/venta"
          className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Ver todos los inmuebles <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </div>
    </>
  );
}
