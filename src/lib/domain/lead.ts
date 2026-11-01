import { z } from "zod";

// Mensaje del formulario de contacto (web pública → panel).

export const LEAD_REASONS = ["informacion", "visita", "vender", "otro"] as const;
export type LeadReason = (typeof LEAD_REASONS)[number];

export const LEAD_REASON_LABELS: Record<LeadReason, string> = {
  informacion: "Pedir información",
  visita: "Concertar una visita",
  vender: "Vender mi casa",
  otro: "Otro motivo",
};

export const leadInputSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(100),
  email: z.email("Revisa el email").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s]{8,15}$/, "Revisa el teléfono")
    .or(z.literal(""))
    .default(""),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(2000),
  reason: z.enum(LEAD_REASONS).default("informacion"),
  propertyId: z.string().nullable().default(null),
  consent: z.literal(true, { error: "Necesitamos tu permiso para responderte" }),
  // Trampa para bots: un campo oculto que las personas dejan vacío.
  website: z.string().max(0).default(""),
});

export type LeadInput = z.input<typeof leadInputSchema>;

export type Lead = Omit<z.output<typeof leadInputSchema>, "website" | "consent"> & {
  id: string;
  createdAt: string;
  consentAt: string;
  propertyLabel: string | null;
  status: "nuevo" | "atendido";
};
