import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
import { seedSummaries } from "@/lib/data/demo/seed";
import { siteUrl } from "@/lib/site-url";

// En demo, los inmuebles del sitemap son los de ejemplo.
// Con Supabase se leerán los publicados de la base de datos.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages = ["", "/venta", ...(brand.modules.rentals ? ["/alquiler"] : []), "/contacto"];
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "daily" as const, priority: path ? 0.8 : 1 })),
    ...seedSummaries().map((p) => ({
      url: `${base}/inmueble/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
