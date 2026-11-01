import { z } from "zod";

// Modelo de inmueble. Es el contrato entre el panel, la web y la capa de datos.
// La futura tabla de Supabase debe seguir estos mismos campos.

export const OPERATIONS = ["venta", "alquiler"] as const;
export const PROPERTY_TYPES = [
  "piso",
  "atico",
  "duplex",
  "estudio",
  "casa",
  "chalet",
  "local",
  "oficina",
  "nave",
  "garaje",
  "trastero",
  "terreno",
] as const;
export const STATUSES = ["disponible", "reservado", "vendido", "alquilado"] as const;
export const ENERGY_RATINGS = ["A", "B", "C", "D", "E", "F", "G", "en_tramite", "exento"] as const;
export const FEATURES = [
  "ascensor",
  "garaje",
  "trastero",
  "terraza",
  "balcon",
  "jardin",
  "piscina",
  "aire_acondicionado",
  "calefaccion",
  "amueblado",
  "exterior",
] as const;

export type Operation = (typeof OPERATIONS)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PropertyStatus = (typeof STATUSES)[number];
export type EnergyRating = (typeof ENERGY_RATINGS)[number];
export type Feature = (typeof FEATURES)[number];

export const OPERATION_LABELS: Record<Operation, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
};

export const TYPE_LABELS: Record<PropertyType, string> = {
  piso: "Piso",
  atico: "Ático",
  duplex: "Dúplex",
  estudio: "Estudio",
  casa: "Casa",
  chalet: "Chalet",
  local: "Local",
  oficina: "Oficina",
  nave: "Nave",
  garaje: "Garaje",
  trastero: "Trastero",
  terreno: "Terreno",
};

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  alquilado: "Alquilado",
};

export const ENERGY_LABELS: Record<EnergyRating, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  en_tramite: "En trámite",
  exento: "Exento",
};

export const FEATURE_LABELS: Record<Feature, string> = {
  ascensor: "Ascensor",
  garaje: "Plaza de garaje",
  trastero: "Trastero",
  terraza: "Terraza",
  balcon: "Balcón",
  jardin: "Jardín",
  piscina: "Piscina",
  aire_acondicionado: "Aire acondicionado",
  calefaccion: "Calefacción",
  amueblado: "Amueblado",
  exterior: "Exterior",
};

// Estados finales según la operación.
export const CLOSED_STATUS: Record<Operation, PropertyStatus> = {
  venta: "vendido",
  alquiler: "alquilado",
};

const optionalNumber = (schema: z.ZodNumber) => schema.nullable().default(null);

// Lo que rellena el formulario del panel.
export const propertyInputSchema = z.object({
  title: z.string().trim().min(10, "El título debe tener al menos 10 caracteres").max(120, "Máximo 120 caracteres"),
  description: z
    .string()
    .trim()
    .min(30, "La descripción debe tener al menos 30 caracteres")
    .max(5000, "Máximo 5.000 caracteres"),
  operation: z.enum(OPERATIONS),
  type: z.enum(PROPERTY_TYPES),
  price: z
    .number({ error: "Indica un precio" })
    .int("Sin decimales")
    .positive("El precio debe ser mayor que 0")
    .max(100_000_000),
  builtArea: z.number({ error: "Indica los m² construidos" }).positive().max(1_000_000),
  usableArea: optionalNumber(z.number().positive().max(1_000_000)),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  floor: z.string().trim().max(20).nullable().default(null),
  features: z.array(z.enum(FEATURES)).default([]),
  energyRating: z.enum(ENERGY_RATINGS),
  address: z.string().trim().max(200).default(""), // privada: no se muestra en la web
  zone: z.string().trim().min(2, "Indica la zona").max(80),
  city: z.string().trim().min(2).max(80),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Código postal de 5 cifras")
    .nullable()
    .default(null),
  // Punto aproximado para el mapa de la web (no la dirección exacta).
  location: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .nullable()
    .default(null),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

export type PropertyInput = z.input<typeof propertyInputSchema>;
export type PropertyData = z.output<typeof propertyInputSchema>;

export const mediaSchema = z.object({
  id: z.string(),
  kind: z.enum(["image", "video"]),
  // "static": archivo en /public (datos de ejemplo). "local": guardado en el navegador (demo).
  // "storage": Supabase Storage (producción).
  source: z.enum(["static", "local", "storage"]),
  path: z.string(),
  position: z.number().int().min(0),
  alt: z.string().max(200).default(""),
  width: z.number().int().positive().nullable().default(null),
  height: z.number().int().positive().nullable().default(null),
  sizeBytes: z.number().int().nonnegative(),
  mimeType: z.string(),
});

export type PropertyMedia = z.output<typeof mediaSchema>;

export type PriceChange = {
  at: string;
  from: number;
  to: number;
};

export type Property = PropertyData & {
  id: string;
  reference: string;
  slug: string;
  status: PropertyStatus;
  previousPrice: number | null;
  priceReducedAt: string | null;
  priceHistory: PriceChange[];
  closedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  media: PropertyMedia[];
};

// Rebaja visible: hay precio anterior y es mayor que el actual.
export function priceDropPercent(p: Pick<Property, "price" | "previousPrice">): number | null {
  if (!p.previousPrice || p.previousPrice <= p.price) return null;
  return Math.round(((p.previousPrice - p.price) / p.previousPrice) * 100);
}

export function coverImage(p: Pick<Property, "media">): PropertyMedia | null {
  return p.media.filter((m) => m.kind === "image").sort((a, b) => a.position - b.position)[0] ?? null;
}
