import { describe, expect, it } from "vitest";
import { seedProperties } from "@/lib/data/demo/seed";
import type { AuditEntry } from "@/lib/domain/audit";
import type { Lead } from "@/lib/domain/lead";
import { buildWeeklyReport, reportAsText } from "./weekly-report";

const now = new Date("2026-11-09T09:00:00Z");
const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const laura = { id: "a", name: "Laura", role: "admin" as const };
const carlos = { id: "e", name: "Carlos", role: "editor" as const };

function entry(partial: Partial<AuditEntry>): AuditEntry {
  return {
    id: crypto.randomUUID(),
    at: ago(1),
    actor: laura,
    entity: "property",
    entityId: "x",
    entityLabel: "x",
    action: "update",
    changes: {},
    ...partial,
  };
}

describe("resumen semanal", () => {
  it("cuenta solo lo de la semana y agrupa por persona", () => {
    const audit = [
      entry({ action: "create" }),
      entry({ action: "price_drop", actor: carlos }),
      entry({ action: "status", changes: { status: { from: "disponible", to: "vendido" } } }),
      entry({ action: "update", at: ago(10) }), // fuera de la semana
    ];
    const leads = [
      { createdAt: ago(1), status: "nuevo" },
      { createdAt: ago(3), status: "nuevo" },
      { createdAt: ago(2), status: "atendido" },
    ] as Lead[];
    const r = buildWeeklyReport({ audit, properties: seedProperties(now), leads, now });
    expect(r.totals).toMatchObject({
      changes: 3,
      newProperties: 1,
      closed: 1,
      priceDrops: 1,
      leads: 3,
      leadsPending: 2,
    });
    expect(r.byActor).toEqual([
      { name: "Laura", changes: 2 },
      { name: "Carlos", changes: 1 },
    ]);
    expect(r.alerts.some((a) => a.text.includes("48 h"))).toBe(true);
    expect(r.alerts.some((a) => a.text.includes("CB-0006") && a.text.includes("trámite"))).toBe(true);
  });

  it("avisa si no hubo cambios y genera el texto", () => {
    const r = buildWeeklyReport({ audit: [], properties: [], leads: [], now });
    expect(r.alerts[0].text).toMatch(/ningún cambio/);
    const text = reportAsText(r, "Casa Blanca", (iso) => iso.slice(0, 10));
    expect(text).toContain("Resumen semanal · Casa Blanca");
    expect(text).toContain("Contactos recibidos: 0 (0 sin atender)");
  });
});
