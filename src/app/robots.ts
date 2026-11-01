import type { MetadataRoute } from "next";
import { isDemo } from "@/config/runtime";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // La demo no debe aparecer en Google.
  if (isDemo) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/styleguide"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
