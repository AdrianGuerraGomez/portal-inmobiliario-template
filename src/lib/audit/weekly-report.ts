import type { AuditEntry } from "@/lib/domain/audit";
import type { Lead } from "@/lib/domain/lead";
import type { Property } from "@/lib/domain/property";

// Resumen de la semana para la revisión semanal.
// En producción se enviará por email cada lunes; en la demo se ve en el panel.

export type ReportAlert = { kind: "warning" | "info"; text: string; href?: string };

export type WeeklyReport = {
  from: string;
  to: string;
  totals: {
    changes: number;
    newProperties: number;
    closed: number;
    priceDrops: number;
    leads: number;
    leadsPending: number;
    contentPublished: number;
  };
  byActor: { name: string; changes: number }[];
  alerts: ReportAlert[];
};

const DAY = 86_400_000;

export function buildWeeklyReport({
  audit,
  properties,
  leads,
  now = new Date(),
  days = 7,
}: {
  audit: AuditEntry[];
  properties: Property[];
  leads: Lead[];
  now?: Date;
  days?: number;
}): WeeklyReport {
  const fromDate = new Date(now.getTime() - days * DAY);
  const from = fromDate.toISOString();
  const inRange = (iso: string) => iso >= from && iso <= now.toISOString();

  const entries = audit.filter((e) => inRange(e.at) && e.entity !== "system");
  const weekLeads = leads.filter((l) => inRange(l.createdAt));

  const actors = new Map<string, number>();
  for (const e of entries) actors.set(e.actor.name, (actors.get(e.actor.name) ?? 0) + 1);

  const live = properties.filter((p) => !p.deletedAt);
  const published = live.filter((p) => p.published && (p.status === "disponible" || p.status === "reservado"));
  const alerts: ReportAlert[] = [];

  for (const p of published) {
    const photos = p.media.filter((m) => m.kind === "image").length;
    const edit = `/admin/inmuebles/${p.id}`;
    if (photos === 0) alerts.push({ kind: "warning", text: `${p.reference} está publicado sin fotos.`, href: edit });
    else if (photos < 5) alerts.push({ kind: "info", text: `${p.reference} solo tiene ${photos} fotos.`, href: edit });
    if (p.energyRating === "en_tramite") {
      alerts.push({ kind: "warning", text: `${p.reference}: certificado energético en trámite.`, href: edit });
    }
  }

  const stale = leads.filter((l) => l.status === "nuevo" && now.getTime() - Date.parse(l.createdAt) > 2 * DAY);
  if (stale.length) {
    alerts.push({
      kind: "warning",
      text: `${stale.length} ${stale.length === 1 ? "contacto lleva" : "contactos llevan"} más de 48 h sin atender.`,
      href: "/admin/contactos",
    });
  }
  if (!entries.length) alerts.push({ kind: "info", text: "Esta semana no se ha hecho ningún cambio en la web." });

  return {
    from,
    to: now.toISOString(),
    totals: {
      changes: entries.length,
      newProperties: entries.filter((e) => e.action === "create").length,
      closed: entries.filter(
        (e) => e.action === "status" && ["vendido", "alquilado"].includes(String(e.changes.status?.to)),
      ).length,
      priceDrops: entries.filter((e) => e.action === "price_drop").length,
      leads: weekLeads.length,
      leadsPending: leads.filter((l) => l.status === "nuevo").length,
      contentPublished: entries.filter((e) => e.action === "content_publish").length,
    },
    byActor: [...actors.entries()].map(([name, changes]) => ({ name, changes })).sort((a, b) => b.changes - a.changes),
    alerts,
  };
}

// Versión en texto para pegar en un email o en WhatsApp.
export function reportAsText(r: WeeklyReport, brandName: string, fmt: (iso: string) => string): string {
  const t = r.totals;
  const lines = [
    `Resumen semanal · ${brandName}`,
    `${fmt(r.from)} – ${fmt(r.to)}`,
    "",
    `• Cambios en la web: ${t.changes}`,
    `• Inmuebles nuevos: ${t.newProperties}`,
    `• Vendidos o alquilados: ${t.closed}`,
    `• Rebajas de precio: ${t.priceDrops}`,
    `• Contactos recibidos: ${t.leads} (${t.leadsPending} sin atender)`,
    `• Publicaciones de contenido: ${t.contentPublished}`,
  ];
  if (r.byActor.length) {
    lines.push("", "Quién ha trabajado:", ...r.byActor.map((a) => `• ${a.name}: ${a.changes} cambios`));
  }
  if (r.alerts.length) lines.push("", "Para revisar:", ...r.alerts.map((a) => `• ${a.text}`));
  return lines.join("\n");
}
