"use client";

import { RotateCcwIcon } from "lucide-react";
import { MediaImage } from "@/components/property/media-image";
import { PriceTag } from "@/components/property/price-tag";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepoQuery, useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import { coverImage } from "@/lib/domain/property";
import { formatDateTime } from "@/lib/format";

export function TrashList() {
  const repo = useRepository();
  const { run, pending } = useAction();
  const { data, loading } = useRepoQuery((r) => r.listProperties({ onlyDeleted: true }), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Papelera</h1>
        <p className="text-sm text-muted-foreground">Inmuebles borrados. No se ven en la web y se pueden restaurar.</p>
      </div>

      {loading && !data ? (
        <Skeleton className="h-24 w-full" />
      ) : !data?.length ? (
        <p className="rounded-lg border border-dashed bg-card px-6 py-16 text-center text-muted-foreground">
          La papelera está vacía.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-3">
              <MediaImage media={coverImage(p)} alt="" className="aspect-4/3 w-20 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.reference} · Borrado el {p.deletedAt && formatDateTime(p.deletedAt)}
                </p>
                <PriceTag property={p} />
              </div>
              <Button
                variant="outline"
                size="lg"
                disabled={pending}
                onClick={() => run(() => repo.restoreProperty(p.id), `${p.reference} restaurado`)}
              >
                <RotateCcwIcon /> Restaurar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
