import { Suspense } from "react";
import { brand } from "@/config/brand";
import type { Operation } from "@/lib/domain/property";
import { ListingView } from "./listing-view";

const COPY: Record<Operation, { title: string; text: string }> = {
  venta: {
    title: `Inmuebles en venta en ${brand.city}`,
    text: "Pisos, casas, chalets y locales. Filtra por zona, precio y dormitorios.",
  },
  alquiler: {
    title: `Inmuebles en alquiler en ${brand.city}`,
    text: "Viviendas y locales en alquiler, con la información clara desde el primer día.",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Los filtros llegan en la URL. Se leen aquí, dentro de <Suspense>,
// para que la cabecera de la página se sirva estática.
async function Results({ operation, searchParams }: { operation: Operation; searchParams: SearchParams }) {
  const raw = await searchParams;
  const query = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])) as Record<
    string,
    string | undefined
  >;
  return <ListingView operation={operation} query={query} />;
}

export function ListingPage({ operation, searchParams }: { operation: Operation; searchParams: SearchParams }) {
  const copy = COPY[operation];
  return (
    <>
      <section className="border-b bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="font-heading text-3xl font-semibold text-balance sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-secondary-foreground/80">{copy.text}</p>
        </div>
      </section>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <Results operation={operation} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

export const LISTING_META: Record<Operation, { title: string; description: string }> = {
  venta: { title: `Comprar casa en ${brand.city}`, description: COPY.venta.text },
  alquiler: { title: `Alquilar casa en ${brand.city}`, description: COPY.alquiler.text },
};
