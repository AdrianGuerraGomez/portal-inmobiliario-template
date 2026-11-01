import { brand } from "@/config/brand";
import { siteContent } from "@/config/site-content";

// Contenido editable de la web. Los valores por defecto salen de la
// configuración del cliente; el panel guarda solo lo que se cambia.
export const contentDefaults = {
  ...siteContent,
  company: {
    email: brand.contact.email,
    whatsapp: brand.contact.whatsapp,
    offices: brand.contact.offices,
    social: { facebook: brand.contact.social.facebook ?? "", instagram: brand.contact.social.instagram ?? "" },
  },
};

export type SiteContent = typeof contentDefaults;

// Cambios guardados: ruta → texto. P. ej. "home.values.0.title" → "Conocemos tu barrio".
export type ContentOverrides = Record<string, string>;

export type ContentState = {
  published: ContentOverrides;
  publishedAt: string | null;
  publishedBy: string | null;
  draft: ContentOverrides | null; // null = sin borrador pendiente
  draftAt: string | null;
};

export const EMPTY_CONTENT_STATE: ContentState = {
  published: {},
  publishedAt: null,
  publishedBy: null,
  draft: null,
  draftAt: null,
};

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

// Copia del contenido por defecto con los cambios aplicados.
export function applyOverrides(overrides: ContentOverrides): SiteContent {
  const out = structuredClone(contentDefaults) as unknown as Record<string, unknown>;
  for (const [path, value] of Object.entries(overrides)) {
    const keys = path.split(".");
    let node = out as Record<string, unknown>;
    for (const k of keys.slice(0, -1)) {
      if (node[k] == null || typeof node[k] !== "object") break;
      node = node[k] as Record<string, unknown>;
    }
    const last = keys[keys.length - 1];
    if (typeof node[last] === "string") node[last] = value;
  }
  return out as unknown as SiteContent;
}
