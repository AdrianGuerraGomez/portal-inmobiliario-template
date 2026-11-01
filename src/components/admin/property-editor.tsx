"use client";

import { ArrowLeftIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PriceTag } from "@/components/property/price-tag";
import { StatusBadge } from "@/components/property/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepoQuery, useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import { formatDateTime } from "@/lib/format";
import { MediaManager } from "./media-manager";
import { PropertyActions } from "./property-actions";
import { PropertyForm } from "./property-form";

function BackLink() {
  return (
    <Link
      href="/admin/inmuebles"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" aria-hidden /> Inmuebles
    </Link>
  );
}

export function PropertyEditor() {
  const { id } = useParams<{ id: string }>();
  const repo = useRepository();
  const { run } = useAction();
  const { data: property, loading } = useRepoQuery((r) => r.getProperty(id), [id]);

  if (loading && property === undefined) {
    return (
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <BackLink />
        <p className="rounded-lg border bg-card p-8 text-center">Este inmueble no existe.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <BackLink />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-muted-foreground">{property.reference}</p>
            <h1 className="text-2xl font-semibold text-balance sm:text-3xl">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={property.status} />
              <PriceTag property={property} size="lg" />
            </div>
            <p className="text-xs text-muted-foreground">Última modificación: {formatDateTime(property.updatedAt)}</p>
          </div>
          {!property.deletedAt && <PropertyActions property={property} variant="toolbar" showEdit={false} />}
        </div>
      </div>

      {property.deletedAt ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm">Este inmueble está en la papelera y no se ve en la web.</p>
          <Button size="lg" onClick={() => run(() => repo.restoreProperty(property.id), "Inmueble restaurado")}>
            <RotateCcwIcon /> Restaurar
          </Button>
        </div>
      ) : (
        <>
          <MediaManager property={property} />
          {/* key: el formulario se monta una vez por inmueble y no pisa lo que se está escribiendo */}
          <PropertyForm key={property.id} property={property} />
        </>
      )}
    </div>
  );
}
