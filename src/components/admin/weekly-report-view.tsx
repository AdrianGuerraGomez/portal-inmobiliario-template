"use client";

import { AlertTriangleIcon, CopyIcon, InfoIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { brand } from "@/config/brand";
import { buildWeeklyReport, reportAsText } from "@/lib/audit/weekly-report";
import { useRepoQuery } from "@/lib/data/provider";
import { formatDate } from "@/lib/format";

export function WeeklyReportView() {
  // Se calcula en la consulta: depende de la fecha de hoy.
  const { data: report } = useRepoQuery(
    async (r) =>
      buildWeeklyReport({
        audit: await r.listAudit({ limit: 2000 }),
        properties: await r.listProperties(),
        leads: await r.listLeads(),
      }),
    [],
  );

  async function copy() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(reportAsText(report, brand.name, formatDate));
      toast.success("Resumen copiado. Pégalo en un email o en WhatsApp.");
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  if (!report) return <Skeleton className="h-96 w-full" />;
  const t = report.totals;
  const kpis = [
    { label: "Cambios en la web", value: t.changes, href: "/admin/actividad" },
    { label: "Inmuebles nuevos", value: t.newProperties },
    { label: "Vendidos o alquilados", value: t.closed },
    { label: "Rebajas de precio", value: t.priceDrops },
    { label: "Contactos recibidos", value: t.leads, hint: `${t.leadsPending} sin atender`, href: "/admin/contactos" },
    { label: "Publicaciones de contenido", value: t.contentPublished, href: "/admin/contenido" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Resumen semanal</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(report.from)} – {formatDate(report.to)}
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={copy}>
          <CopyIcon /> Copiar como texto
        </Button>
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
        <MailIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        En la versión final, este resumen llega por email cada lunes a primera hora.
      </p>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kpis.map((k) => {
          const body = (
            <>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{k.value}</p>
              <p className="text-sm text-muted-foreground">{k.label}</p>
              {k.hint && <p className="text-xs font-medium text-price-drop">{k.hint}</p>}
            </>
          );
          return (
            <li key={k.label}>
              {k.href ? (
                <Link
                  href={k.href}
                  className="block h-full rounded-lg border bg-card p-4 transition-colors hover:border-primary"
                >
                  {body}
                </Link>
              ) : (
                <div className="h-full rounded-lg border bg-card p-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Quién ha trabajado</h2>
          {report.byActor.length ? (
            <ul className="divide-y">
              {report.byActor.map((a) => (
                <li key={a.name} className="flex justify-between py-2 text-sm">
                  <span>{a.name}</span>
                  <span className="font-medium tabular-nums">{a.changes} cambios</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nadie ha hecho cambios esta semana.</p>
          )}
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Para revisar</h2>
          {report.alerts.length ? (
            <ul className="space-y-2">
              {report.alerts.map((a, i) => {
                const Icon = a.kind === "warning" ? AlertTriangleIcon : InfoIcon;
                const text = (
                  <span className="flex gap-2">
                    <Icon
                      className={
                        a.kind === "warning"
                          ? "mt-0.5 size-4 shrink-0 text-status-reserved"
                          : "mt-0.5 size-4 shrink-0 text-muted-foreground"
                      }
                      aria-hidden
                    />
                    {a.text}
                  </span>
                );
                return (
                  <li key={i} className="text-sm">
                    {a.href ? (
                      <Link href={a.href} className="hover:underline">
                        {text}
                      </Link>
                    ) : (
                      text
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Todo en orden.</p>
          )}
        </section>
      </div>
    </div>
  );
}
