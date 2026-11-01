import { CONTENT_FIELDS } from "@/lib/content/fields";
import type { AuditEntry } from "@/lib/domain/audit";
import {
  ENERGY_LABELS,
  FEATURE_LABELS,
  OPERATION_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  type EnergyRating,
  type Feature,
  type Operation,
  type PropertyStatus,
  type PropertyType,
} from "@/lib/domain/property";
import { formatArea, formatDateTime, formatPrice } from "@/lib/format";

// Traduce el histórico a lenguaje de persona: "Precio: 289.000 € → 265.000 €".

const PROPERTY_FIELD_LABELS: Record<string, string> = {
  title: "Título",
  description: "Descripción",
  operation: "Operación",
  type: "Tipo",
  price: "Precio",
  previousPrice: "Precio anterior (tachado)",
  priceReducedAt: "Fecha de la rebaja",
  builtArea: "Superficie construida",
  usableArea: "Superficie útil",
  bedrooms: "Dormitorios",
  bathrooms: "Baños",
  floor: "Planta",
  features: "Características",
  energyRating: "Certificado energético",
  address: "Dirección",
  zone: "Zona",
  city: "Municipio",
  postalCode: "Código postal",
  published: "Publicado en la web",
  featured: "Destacado",
  status: "Estado",
  closedAt: "Fecha de cierre",
  slug: "Dirección web",
  priceHistory: "Historial de precios",
  media: "Fotos y vídeo",
};

// Campos internos que se guardan pero no aportan nada al leer el histórico.
const HIDDEN = new Set(["slug", "priceHistory", "priceReducedAt", "closedAt", "updatedAt", "updatedBy"]);

export function fieldLabel(entry: Pick<AuditEntry, "entity">, key: string): string {
  if (entry.entity === "content") return CONTENT_FIELDS.get(key)?.label ?? key;
  return PROPERTY_FIELD_LABELS[key] ?? key;
}

export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  switch (key) {
    case "price":
    case "previousPrice":
      return typeof value === "number" ? formatPrice(value) : String(value);
    case "builtArea":
    case "usableArea":
      return typeof value === "number" ? formatArea(value) : String(value);
    case "status":
      return STATUS_LABELS[value as PropertyStatus] ?? String(value);
    case "operation":
      return OPERATION_LABELS[value as Operation] ?? String(value);
    case "type":
      return TYPE_LABELS[value as PropertyType] ?? String(value);
    case "energyRating":
      return ENERGY_LABELS[value as EnergyRating] ?? String(value);
    case "features":
      return Array.isArray(value) && value.length
        ? value.map((f) => FEATURE_LABELS[f as Feature] ?? f).join(", ")
        : "Ninguna";
    case "media":
      return typeof value === "number" ? `${value} archivos` : String(value);
    case "priceReducedAt":
    case "closedAt":
      return formatDateTime(String(value));
  }
  if (typeof value === "string" && value.startsWith("local:")) return "Imagen subida";
  if (typeof value === "string" && value.startsWith("https://images.unsplash.com/")) return "Imagen de la plantilla";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export type ReadableChange = { key: string; label: string; from: string; to: string };

export function readableChanges(entry: AuditEntry): ReadableChange[] {
  return Object.entries(entry.changes)
    .filter(([key]) => !HIDDEN.has(key))
    .map(([key, c]) => ({
      key,
      label: fieldLabel(entry, key),
      from: formatValue(key, c.from),
      to: formatValue(key, c.to),
    }));
}

// Acciones que se pueden deshacer. Las fotos borradas ya no existen, así que esas no.
const REVERTIBLE = new Set([
  "create",
  "update",
  "status",
  "price_drop",
  "price_drop_removed",
  "delete",
  "restore",
  "content_publish",
  "revert",
]);

export function canRevert(entry: AuditEntry): boolean {
  if (entry.entity === "system") return false;
  if (!REVERTIBLE.has(entry.action)) return false;
  // Una edición sin cambios visibles no tiene nada que deshacer.
  const needsChanges = !["create", "delete", "restore"].includes(entry.action);
  return !needsChanges || Object.keys(entry.changes).length > 0;
}
