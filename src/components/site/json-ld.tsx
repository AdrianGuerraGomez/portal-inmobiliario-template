import { brand } from "@/config/brand";
import { siteUrl } from "@/lib/site-url";

// Datos estructurados para Google (schema.org).
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify no escapa "</script>": se escapa "<" para que no se pueda cerrar la etiqueta.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd() {
  const sameAs = Object.values(brand.contact.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: brand.name,
    description: brand.description,
    url: siteUrl(),
    email: brand.contact.email || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    location: brand.contact.offices.map((o) => ({
      "@type": "Place",
      name: o.name,
      telephone: `+34 ${o.phone}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: o.address,
        addressLocality: brand.city,
        addressCountry: "ES",
      },
    })),
  };
}
