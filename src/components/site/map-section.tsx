"use client";

import { MapPinIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { brand } from "@/config/brand";
import { useSiteContent } from "@/lib/content/use-content";
import { useRepoQuery } from "@/lib/data/provider";
import type { Operation, Property } from "@/lib/domain/property";
import { cn } from "@/lib/utils";

// Leaflet usa window: se carga solo en el navegador.
const PropertiesMap = dynamic(() => import("./properties-map"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-muted" />,
});

type Filter = Operation | "todos";
type Located = Property & { location: { lat: number; lng: number } };

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "venta", label: "En venta" },
  ...(brand.modules.rentals ? [{ value: "alquiler" as const, label: "En alquiler" }] : []),
];

export function MapSection() {
  const c = useSiteContent().home;
  const [filter, setFilter] = useState<Filter>("todos");
  const { data } = useRepoQuery(
    (r) => r.listProperties({ onlyPublished: true, status: ["disponible", "reservado"] }),
    [],
  );
  const located = (data ?? []).filter((p): p is Located => p.location !== null);
  const visible = located.filter((p) => filter === "todos" || p.operation === filter);

  return (
    <section className="border-t bg-muted" aria-labelledby="mapa-titulo">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <h2 id="mapa-titulo" className="text-3xl font-semibold sm:text-4xl">
              {c.mapTitle}
            </h2>
            <p className="text-muted-foreground">{c.mapSubtitle}</p>
          </div>
          <div
            role="radiogroup"
            aria-label="Mostrar en el mapa"
            className="inline-flex rounded-lg bg-card p-1 shadow-sm"
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "min-h-9 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors",
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* isolate: los z-index internos de Leaflet no pasan por encima de la cabecera */}
        <div className="isolate h-[420px] overflow-hidden rounded-2xl border bg-card shadow-sm sm:h-[540px]">
          {data && <PropertiesMap properties={visible} />}
          {!data && <div className="size-full animate-pulse bg-muted" />}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          <MapPinIcon className="size-3.5" aria-hidden />
          {data ? `${visible.length} ${visible.length === 1 ? "inmueble" : "inmuebles"} en el mapa · ` : ""}
          Ubicaciones aproximadas para proteger la privacidad de los propietarios.
        </p>
      </div>
    </section>
  );
}
