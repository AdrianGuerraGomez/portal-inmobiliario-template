"use client";

import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { brand } from "@/config/brand";
import { useRepoQuery } from "@/lib/data/provider";
import type { PropertyFilter } from "@/lib/data/repository";
import { PROPERTY_TYPES, TYPE_LABELS, type Operation, type PropertyType } from "@/lib/domain/property";

const ANY = "cualquiera";
const PRICES: Record<Operation, number[]> = {
  venta: [50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000],
  alquiler: [400, 500, 600, 750, 900, 1200, 1500],
};
const SORTS = [
  { value: "recent", label: "Más recientes" },
  { value: "price_asc", label: "Precio: de menor a mayor" },
  { value: "price_desc", label: "Precio: de mayor a menor" },
] as const;

function money(n: number, operation: Operation) {
  return `${n.toLocaleString(brand.locale, { useGrouping: "always" })} €${operation === "alquiler" ? "/mes" : ""}`;
}

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  anyLabel: string;
};

function FilterSelect({ id, label, value, onChange, options, anyLabel }: FilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-11 w-full bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{anyLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type Query = Record<string, string | undefined>;

export function ListingView({ operation, query }: { operation: Operation; query: Query }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => typeof e[1] === "string"),
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const get = (k: string) => params.get(k) ?? ANY;
  const type = get("tipo");
  const zone = get("zona");
  const min = get("min");
  const max = get("max");
  const rooms = get("hab");
  const sort = params.get("orden") ?? "recent";

  // Los filtros viven en la URL: se pueden compartir y el botón "atrás" funciona.
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === ANY || (key === "orden" && value === "recent")) next.delete(key);
    else next.set(key, value);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  const filter: PropertyFilter = {
    operation,
    onlyPublished: true,
    status: ["disponible", "reservado"],
    type: type !== ANY && (PROPERTY_TYPES as readonly string[]).includes(type) ? (type as PropertyType) : undefined,
    zone: zone !== ANY ? zone : undefined,
    minPrice: min !== ANY ? Number(min) : undefined,
    maxPrice: max !== ANY ? Number(max) : undefined,
    minBedrooms: rooms !== ANY ? Number(rooms) : undefined,
    sort: SORTS.some((s) => s.value === sort) ? (sort as PropertyFilter["sort"]) : "recent",
  };

  const { data } = useRepoQuery((r) => r.listProperties(filter), [params.toString(), operation]);
  // Zonas disponibles para esta operación (sin el resto de filtros).
  const { data: all } = useRepoQuery(
    (r) => r.listProperties({ operation, onlyPublished: true, status: ["disponible", "reservado"] }),
    [operation],
  );
  const zones = useMemo(() => [...new Set((all ?? []).map((p) => p.zone))].sort(), [all]);
  const activeCount = [type, zone, min, max, rooms].filter((v) => v !== ANY).length;

  const filters = (
    <div className="grid gap-4">
      <FilterSelect
        id="f-tipo"
        label="Tipo"
        value={type}
        onChange={(v) => update("tipo", v)}
        anyLabel="Todos"
        options={PROPERTY_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
      />
      <FilterSelect
        id="f-zona"
        label="Zona"
        value={zone}
        onChange={(v) => update("zona", v)}
        anyLabel="Todas"
        options={zones.map((z) => ({ value: z, label: z }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <FilterSelect
          id="f-min"
          label="Precio mín."
          value={min}
          onChange={(v) => update("min", v)}
          anyLabel="Sin mínimo"
          options={PRICES[operation].map((p) => ({ value: String(p), label: money(p, operation) }))}
        />
        <FilterSelect
          id="f-max"
          label="Precio máx."
          value={max}
          onChange={(v) => update("max", v)}
          anyLabel="Sin máximo"
          options={PRICES[operation].map((p) => ({ value: String(p), label: money(p, operation) }))}
        />
      </div>
      <FilterSelect
        id="f-hab"
        label="Dormitorios"
        value={rooms}
        onChange={(v) => update("hab", v)}
        anyLabel="Indiferente"
        options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n} o más` }))}
      />
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="lg"
          className="justify-start"
          onClick={() => router.replace(pathname, { scroll: false })}
        >
          <XIcon /> Quitar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:py-14">
      <aside className="hidden lg:block" aria-label="Filtros">
        <div className="sticky top-24">{filters}</div>
      </aside>

      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="mr-auto text-sm text-muted-foreground" aria-live="polite">
            {data ? `${data.length} ${data.length === 1 ? "inmueble" : "inmuebles"}` : "Buscando…"}
          </p>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="h-11 lg:hidden">
                <SlidersHorizontalIcon /> Filtros{activeCount > 0 && ` (${activeCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="px-4">{filters}</div>
              <div className="p-4">
                <Button size="lg" className="h-12 w-full" onClick={() => setSheetOpen(false)}>
                  Ver {data?.length ?? ""} resultados
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Select value={filter.sort} onValueChange={(v) => update("orden", v)}>
            <SelectTrigger className="h-11 w-56 bg-card" aria-label="Ordenar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!data ? (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <PropertyCardSkeleton />
              </li>
            ))}
          </ul>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
            <p className="font-heading text-xl font-semibold">No hay inmuebles con estos filtros</p>
            <p className="mt-2 text-muted-foreground">
              Prueba a quitar alguno o llámanos: tenemos novedades cada semana.
            </p>
            {activeCount > 0 && (
              <Button variant="outline" size="lg" className="mt-6" onClick={() => router.replace(pathname)}>
                Quitar filtros
              </Button>
            )}
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((p, i) => (
              <li key={p.id} className="flex">
                <PropertyCard property={p} priority={i < 3} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
