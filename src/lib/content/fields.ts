import { brand } from "@/config/brand";
import { DomainError } from "@/lib/domain/errors";
import { contentDefaults, getPath, type ContentOverrides } from "./defaults";

// Qué se puede editar desde el panel. Lo que no está aquí, no se puede tocar.
// Para un hueco nuevo: añádelo a site-content.ts y declara su campo aquí.

export type FieldKind = "text" | "textarea" | "image" | "phone" | "email" | "url";

export type ContentField = {
  path: string;
  label: string;
  kind: FieldKind;
  max?: number;
  hint?: string;
  aspect?: number; // ancho/alto obligatorio para imágenes
  altPath?: string; // campo con el texto alternativo de la imagen
  optional?: boolean;
};

export type ContentGroup = {
  id: string;
  label: string;
  description: string;
  adminOnly?: boolean;
  previewHref: string;
  fields: ContentField[];
};

const home = contentDefaults.home;
const financing = contentDefaults.financing;
const company = contentDefaults.company;

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "home",
    label: "Portada",
    description: "Lo primero que ve quien entra en la web.",
    previewHref: "/",
    fields: [
      { path: "home.eyebrow", label: "Antetítulo", kind: "text", max: 40 },
      { path: "home.title", label: "Título principal", kind: "text", max: 60 },
      { path: "home.subtitle", label: "Subtítulo", kind: "textarea", max: 160 },
      {
        path: "home.heroImage",
        label: "Imagen de portada",
        kind: "image",
        aspect: 16 / 9,
        altPath: "home.heroImageAlt",
        hint: "Horizontal. Se recorta a 16:9.",
      },
      {
        path: "home.heroImageAlt",
        label: "Descripción de la imagen",
        kind: "text",
        max: 140,
        hint: "Para personas que no ven la imagen y para Google.",
      },
      { path: "home.featuredTitle", label: "Título de destacados", kind: "text", max: 40 },
      { path: "home.mapTitle", label: "Mapa: título", kind: "text", max: 50 },
      { path: "home.mapSubtitle", label: "Mapa: subtítulo", kind: "textarea", max: 140 },
      ...home.values.flatMap((_, i) => [
        { path: `home.values.${i}.title`, label: `Ventaja ${i + 1}: título`, kind: "text" as const, max: 40 },
        { path: `home.values.${i}.text`, label: `Ventaja ${i + 1}: texto`, kind: "textarea" as const, max: 120 },
      ]),
      { path: "home.sellTitle", label: "Bloque vender: título", kind: "text", max: 50 },
      { path: "home.sellText", label: "Bloque vender: texto", kind: "textarea", max: 160 },
      { path: "home.sellCta", label: "Bloque vender: botón", kind: "text", max: 30 },
    ],
  },
  ...(brand.modules.financing && brand.mortgagePartner
    ? [
        {
          id: "financing",
          label: "Hipotecas",
          description: "Página de financiación.",
          previewHref: "/financiacion",
          fields: [
            { path: "financing.title", label: "Título", kind: "text" as const, max: 60 },
            { path: "financing.subtitle", label: "Subtítulo", kind: "textarea" as const, max: 220 },
            ...financing.services.map((_, i) => ({
              path: `financing.services.${i}`,
              label: `Servicio ${i + 1}`,
              kind: "text" as const,
              max: 80,
            })),
            { path: "financing.rentTitle", label: "Bloque alquiler: título", kind: "text" as const, max: 40 },
            { path: "financing.rentText", label: "Bloque alquiler: texto", kind: "textarea" as const, max: 160 },
            { path: "financing.disclaimer", label: "Aviso de la calculadora", kind: "textarea" as const, max: 220 },
          ],
        },
      ]
    : []),
  {
    id: "contact",
    label: "Contacto",
    description: "Página de contacto.",
    previewHref: "/contacto",
    fields: [
      { path: "contact.title", label: "Título", kind: "text", max: 40 },
      { path: "contact.subtitle", label: "Subtítulo", kind: "textarea", max: 160 },
    ],
  },
  {
    id: "company",
    label: "Datos de la empresa",
    description: "Teléfonos, direcciones y redes. Se usan en toda la web.",
    adminOnly: true,
    previewHref: "/contacto",
    fields: [
      { path: "company.email", label: "Email público", kind: "email", max: 120, optional: true },
      {
        path: "company.whatsapp",
        label: "WhatsApp",
        kind: "phone",
        max: 15,
        hint: "Solo números con prefijo, p. ej. 34600111222.",
        optional: true,
      },
      ...company.offices.flatMap((_, i) => [
        { path: `company.offices.${i}.name`, label: `Oficina ${i + 1}: nombre`, kind: "text" as const, max: 60 },
        { path: `company.offices.${i}.address`, label: `Oficina ${i + 1}: dirección`, kind: "text" as const, max: 120 },
        { path: `company.offices.${i}.phone`, label: `Oficina ${i + 1}: teléfono`, kind: "phone" as const, max: 15 },
        {
          path: `company.offices.${i}.hours`,
          label: `Oficina ${i + 1}: horario`,
          kind: "text" as const,
          max: 80,
          hint: "P. ej.: L-V 10:00-14:00 y 17:00-20:00",
          optional: true,
        },
      ]),
      { path: "company.social.facebook", label: "Facebook", kind: "url", max: 200, optional: true },
      { path: "company.social.instagram", label: "Instagram", kind: "url", max: 200, optional: true },
    ],
  },
];

export const CONTENT_FIELDS = new Map(CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => [f.path, f] as const)));

export function isAdminOnly(path: string) {
  return CONTENT_GROUPS.some((g) => g.adminOnly && g.fields.some((f) => f.path === path));
}

export function defaultValue(path: string): string {
  const v = getPath(contentDefaults, path);
  return typeof v === "string" ? v : "";
}

// Imágenes subidas desde el panel: "local:<id>" en demo, ruta de Storage en producción.
export const LOCAL_ASSET_PREFIX = "local:";

// Mismas reglas en el formulario y en la capa de datos.
export function validateContent(overrides: ContentOverrides) {
  for (const [path, raw] of Object.entries(overrides)) {
    const field = CONTENT_FIELDS.get(path);
    if (!field) throw new DomainError("validation", `El campo «${path}» no se puede editar.`);
    const value = raw.trim();
    if (!value && !field.optional) {
      throw new DomainError("validation", `«${field.label}» no puede quedar vacío.`);
    }
    if (field.max && value.length > field.max) {
      throw new DomainError("validation", `«${field.label}»: máximo ${field.max} caracteres.`);
    }
    if (!value) continue;
    if (field.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new DomainError("validation", `«${field.label}» no es un email válido.`);
    }
    if (field.kind === "url" && !/^https:\/\/\S+$/.test(value)) {
      throw new DomainError("validation", `«${field.label}» debe empezar por https://`);
    }
    if (field.kind === "phone" && !/^[\d\s+]{6,15}$/.test(value)) {
      throw new DomainError("validation", `«${field.label}» no es un teléfono válido.`);
    }
    if (field.kind === "image" && !(value.startsWith(LOCAL_ASSET_PREFIX) || /^https:\/\/\S+$/.test(value))) {
      throw new DomainError("validation", `«${field.label}» no es una imagen válida.`);
    }
  }
}
