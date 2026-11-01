"use client";

import { EyeOffIcon, PlusIcon, SearchIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { MediaImage } from "@/components/property/media-image";
import { PriceTag } from "@/components/property/price-tag";
import { StatusBadge } from "@/components/property/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { brand } from "@/config/brand";
import { useRepoQuery } from "@/lib/data/provider";
import type { PropertyFilter } from "@/lib/data/repository";
import {
  coverImage,
  OPERATION_LABELS,
  STATUS_LABELS,
  STATUSES,
  TYPE_LABELS,
  type Operation,
  type Property,
  type PropertyStatus,
} from "@/lib/domain/property";
import { formatArea } from "@/lib/format";
import { PropertyActions } from "./property-actions";

const ALL = "todos";

function Flags({ property }: { property: Property }) {
  return (
    <span className="inline-flex gap-1.5 text-muted-foreground">
      {!property.published && (
        <span className="inline-flex items-center gap-1 text-xs">
          <EyeOffIcon className="size-3.5" aria-hidden /> Oculto
        </span>
      )}
      {property.featured && (
        <span className="inline-flex items-center gap-1 text-xs">
          <StarIcon className="size-3.5" aria-hidden /> Destacado
        </span>
      )}
    </span>
  );
}

export function PropertyList() {
  const [search, setSearch] = useState("");
  const [operation, setOperation] = useState<Operation | typeof ALL>(ALL);
  const [status, setStatus] = useState<PropertyStatus | typeof ALL>(ALL);
  const deferredSearch = useDeferredValue(search);

  const filter: PropertyFilter = {
    search: deferredSearch || undefined,
    operation: operation === ALL ? undefined : operation,
    status: status === ALL ? undefined : [status],
  };
  const { data, loading } = useRepoQuery((repo) => repo.listProperties(filter), [deferredSearch, operation, status]);
  const filtered = Boolean(deferredSearch) || operation !== ALL || status !== ALL;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Inmuebles</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.length} ${data.length === 1 ? "inmueble" : "inmuebles"}` : "Cargando…"}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/inmuebles/nuevo">
            <PlusIcon /> Nuevo inmueble
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar por referencia, título o zona"
            aria-label="Buscar inmuebles"
            className="h-10 bg-card pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {brand.modules.rentals && (
          <Select value={operation} onValueChange={(v) => setOperation(v as Operation | typeof ALL)}>
            <SelectTrigger className="h-10 bg-card sm:w-40" aria-label="Operación">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Venta y alquiler</SelectItem>
              {(Object.keys(OPERATION_LABELS) as Operation[]).map((o) => (
                <SelectItem key={o} value={o}>
                  {OPERATION_LABELS[o]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={status} onValueChange={(v) => setStatus(v as PropertyStatus | typeof ALL)}>
          <SelectTrigger className="h-10 bg-card sm:w-44" aria-label="Estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && !data ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
          <p className="font-medium">
            {filtered ? "Ningún inmueble coincide con la búsqueda." : "Aún no hay inmuebles."}
          </p>
          {!filtered && (
            <Button asChild size="lg" className="mt-4">
              <Link href="/admin/inmuebles/nuevo">
                <PlusIcon /> Crear el primero
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Escritorio: tabla */}
          <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Foto</TableHead>
                  <TableHead>Inmueble</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/admin/inmuebles/${p.id}`} tabIndex={-1} aria-hidden>
                        <MediaImage media={coverImage(p)} alt="" className="aspect-4/3 w-20 rounded-md" />
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal">
                      <Link href={`/admin/inmuebles/${p.id}`} className="font-medium hover:underline">
                        {p.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {p.reference} · {TYPE_LABELS[p.type]} · {formatArea(p.builtArea)} · {p.zone}, {p.city}
                      </p>
                      <Flags property={p} />
                    </TableCell>
                    <TableCell>
                      <PriceTag property={p} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <PropertyActions property={p} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Móvil: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {data.map((p) => (
              <li key={p.id} className="flex gap-3 rounded-lg border bg-card p-3">
                <Link href={`/admin/inmuebles/${p.id}`} className="shrink-0" tabIndex={-1} aria-hidden>
                  <MediaImage media={coverImage(p)} alt="" className="aspect-square w-20 rounded-md" />
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/inmuebles/${p.id}`} className="line-clamp-2 font-medium">
                      {p.title}
                    </Link>
                    <PropertyActions property={p} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.reference} · {p.zone}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    <PriceTag property={p} />
                  </div>
                  <Flags property={p} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
