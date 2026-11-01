"use client";

import { ArrowRightIcon, Undo2Icon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { brand } from "@/config/brand";
import { canRevert, readableChanges } from "@/lib/audit/format";
import { useRepoQuery, useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import { ACTION_LABELS, ROLE_LABELS, type AuditEntry } from "@/lib/domain/audit";
import { cn } from "@/lib/utils";

const ALL = "todos";
const PERIODS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: ALL, label: "Todo" },
];
const SECTIONS = [
  { value: ALL, label: "Todo" },
  { value: "property", label: "Inmuebles" },
  { value: "content", label: "Contenido web" },
  { value: "system", label: "Sistema" },
];

const dayFmt = new Intl.DateTimeFormat(brand.locale, { weekday: "long", day: "numeric", month: "long" });
const timeFmt = new Intl.DateTimeFormat(brand.locale, { hour: "2-digit", minute: "2-digit" });

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  const s = dayFmt.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function EntryItem({ entry, onRevert }: { entry: AuditEntry; onRevert: (e: AuditEntry) => void }) {
  const changes = readableChanges(entry);
  const href =
    entry.entity === "property"
      ? `/admin/inmuebles/${entry.entityId}`
      : entry.entity === "content"
        ? "/admin/contenido"
        : null;
  return (
    <li className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            entry.actor.role === "admin"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
          aria-hidden
        >
          {entry.actor.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-semibold">{entry.actor.name}</span>{" "}
            <span className="text-muted-foreground">({ROLE_LABELS[entry.actor.role]})</span> ·{" "}
            <span className="font-medium">{ACTION_LABELS[entry.action]}</span>
          </p>
          {href ? (
            <Link href={href} className="block truncate text-sm text-primary hover:underline">
              {entry.entityLabel}
            </Link>
          ) : (
            <p className="truncate text-sm text-muted-foreground">{entry.entityLabel}</p>
          )}
        </div>
        <time dateTime={entry.at} className="text-xs text-muted-foreground tabular-nums">
          {timeFmt.format(new Date(entry.at))}
        </time>
        {canRevert(entry) && (
          <Button variant="ghost" size="lg" onClick={() => onRevert(entry)}>
            <Undo2Icon /> Deshacer
          </Button>
        )}
      </div>
      {changes.length > 0 && (
        <table className="w-full text-sm">
          <caption className="sr-only">Cambios</caption>
          <thead className="sr-only">
            <tr>
              <th>Campo</th>
              <th>Antes</th>
              <th>Después</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {changes.map((c) => (
              <tr key={c.key} className="align-top">
                <th scope="row" className="w-1/4 py-2 pr-3 text-left font-medium text-muted-foreground">
                  {c.label}
                </th>
                <td className="py-2 pr-2 text-muted-foreground line-through decoration-1 [overflow-wrap:anywhere]">
                  {c.from}
                </td>
                <td className="w-6 py-2 text-muted-foreground" aria-hidden>
                  <ArrowRightIcon className="mt-0.5 size-3.5" />
                </td>
                <td className="py-2 pl-2 font-medium [overflow-wrap:anywhere]">{c.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </li>
  );
}

export function ActivityLog() {
  const repo = useRepository();
  const { run, pending } = useAction();
  const [period, setPeriod] = useState("7");
  const [section, setSection] = useState(ALL);
  const [actor, setActor] = useState(ALL);
  const [toRevert, setToRevert] = useState<AuditEntry | null>(null);
  // La fecha de corte se calcula en la consulta (fuera del render).
  const { data, loading } = useRepoQuery(
    (r) =>
      r.listAudit({
        limit: 1000,
        since: period === ALL ? undefined : new Date(Date.now() - Number(period) * 86_400_000).toISOString(),
      }),
    [period],
  );

  const actors = useMemo(() => [...new Map((data ?? []).map((e) => [e.actor.id, e.actor.name])).entries()], [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter(
      (e) => (section === ALL || e.entity === section) && (actor === ALL || e.actor.id === actor),
    );
  }, [data, section, actor]);

  const groups = useMemo(() => {
    const map = new Map<string, AuditEntry[]>();
    for (const e of filtered) {
      const k = dayLabel(e.at);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Actividad</h1>
        <p className="text-sm text-muted-foreground">
          Quién ha cambiado qué y cuándo. El histórico no se puede editar ni borrar; deshacer queda registrado como un
          cambio más.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Periodo", value: period, set: setPeriod, options: PERIODS },
          { label: "Sección", value: section, set: setSection, options: SECTIONS },
          {
            label: "Persona",
            value: actor,
            set: setActor,
            options: [{ value: ALL, label: "Todas" }, ...actors.map(([value, label]) => ({ value, label }))],
          },
        ].map((f) => (
          <Select key={f.label} value={f.value} onValueChange={f.set}>
            <SelectTrigger className="h-10 w-full bg-card" aria-label={f.label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {loading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : !groups.length ? (
        <p className="rounded-lg border border-dashed bg-card px-6 py-16 text-center text-muted-foreground">
          No hay cambios con estos filtros.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(([day, entries]) => (
            <section key={day} className="space-y-3">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{day}</h2>
              <ul className="space-y-3">
                {entries.map((e) => (
                  <EntryItem key={e.id} entry={e} onRevert={setToRevert} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <AlertDialog open={!!toRevert} onOpenChange={(o) => !o && setToRevert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deshacer este cambio?</AlertDialogTitle>
            <AlertDialogDescription>
              {toRevert &&
                (toRevert.action === "create"
                  ? "El inmueble se enviará a la papelera."
                  : toRevert.action === "delete"
                    ? "El inmueble se restaurará desde la papelera."
                    : toRevert.action === "restore"
                      ? "El inmueble volverá a la papelera."
                      : `Se volverán a poner los valores anteriores: ${readableChanges(toRevert)
                          .map((c) => `${c.label}: ${c.from}`)
                          .join(" · ")}.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => toRevert && run(() => repo.revertAuditEntry(toRevert.id), "Cambio deshecho")}
            >
              Deshacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
