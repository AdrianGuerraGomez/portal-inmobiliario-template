"use client";

import { CheckIcon, MailIcon, PhoneIcon, Undo2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepoQuery, useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import { LEAD_REASON_LABELS } from "@/lib/domain/lead";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function LeadInbox() {
  const repo = useRepository();
  const { run, pending } = useAction();
  const { data, loading } = useRepoQuery((r) => r.listLeads(), []);
  const pendingCount = data?.filter((l) => l.status === "nuevo").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Contactos</h1>
        <p className="text-sm text-muted-foreground">
          Mensajes del formulario de la web
          {data ? ` · ${pendingCount} sin atender` : ""}.
        </p>
      </div>

      {loading && !data ? (
        <Skeleton className="h-32 w-full" />
      ) : !data?.length ? (
        <p className="rounded-lg border border-dashed bg-card px-6 py-16 text-center text-muted-foreground">
          Aún no ha llegado ningún mensaje. Prueba a enviar uno desde la ficha de un inmueble.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((l) => {
            const done = l.status === "atendido";
            return (
              <li key={l.id} className={cn("space-y-3 rounded-lg border bg-card p-4", done && "opacity-70")}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {l.name}{" "}
                      {!done && (
                        <span className="ml-1 rounded-full bg-cta px-2 py-0.5 text-xs font-semibold text-cta-foreground">
                          Nuevo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(l.createdAt)} · {LEAD_REASON_LABELS[l.reason]}
                    </p>
                  </div>
                  <Button
                    variant={done ? "ghost" : "outline"}
                    size="lg"
                    disabled={pending}
                    onClick={() => run(() => repo.setLeadStatus(l.id, done ? "nuevo" : "atendido"))}
                  >
                    {done ? (
                      <>
                        <Undo2Icon /> Marcar como nuevo
                      </>
                    ) : (
                      <>
                        <CheckIcon /> Marcar como atendido
                      </>
                    )}
                  </Button>
                </div>
                {l.propertyLabel && l.propertyId && (
                  <Link
                    href={`/admin/inmuebles/${l.propertyId}`}
                    className="block text-sm font-medium text-primary hover:underline"
                  >
                    {l.propertyLabel}
                  </Link>
                )}
                <p className="text-sm whitespace-pre-line">{l.message}</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary" size="lg">
                    <a href={`mailto:${l.email}`}>
                      <MailIcon /> {l.email}
                    </a>
                  </Button>
                  {l.phone && (
                    <Button asChild variant="secondary" size="lg">
                      <a href={`tel:${l.phone.replace(/\s/g, "")}`}>
                        <PhoneIcon /> {l.phone}
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
