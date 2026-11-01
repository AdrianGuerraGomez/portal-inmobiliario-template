"use client";

import {
  BathIcon,
  BedDoubleIcon,
  BuildingIcon,
  CalculatorIcon,
  CheckIcon,
  ChevronRightIcon,
  LeafIcon,
  MapPinIcon,
  PhoneIcon,
  RulerIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMediaUrl } from "@/components/property/media-image";
import { PriceTag } from "@/components/property/price-tag";
import { PropertyCard } from "@/components/property/property-card";
import { StatusBadge } from "@/components/property/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { brand } from "@/config/brand";
import { useRepoQuery } from "@/lib/data/provider";
import {
  ENERGY_LABELS,
  FEATURE_LABELS,
  OPERATION_LABELS,
  TYPE_LABELS,
  type Property,
  type PropertyMedia,
} from "@/lib/domain/property";
import { formatArea, formatPrice } from "@/lib/format";
import { siteUrl } from "@/lib/site-url";
import { ContactForm } from "./contact-form";
import { Gallery } from "./gallery";
import { JsonLd } from "./json-ld";
import { telHref } from "./nav";

function Video({ media }: { media: PropertyMedia }) {
  const url = useMediaUrl(media);
  if (!url) return <Skeleton className="aspect-video w-full rounded-xl" />;
  return <video src={url} controls preload="metadata" className="aspect-video w-full rounded-xl bg-primary" />;
}

function listingJsonLd(p: Property, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url,
    datePosted: p.createdAt,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: brand.currency,
      availability: p.status === "disponible" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      businessFunction: p.operation === "alquiler" ? "https://schema.org/LeaseOut" : "https://schema.org/Sell",
    },
    itemOffered: {
      "@type": p.type === "casa" || p.type === "chalet" ? "SingleFamilyResidence" : "Accommodation",
      numberOfRooms: p.bedrooms || undefined,
      numberOfBathroomsTotal: p.bathrooms || undefined,
      floorSize: { "@type": "QuantitativeValue", value: p.builtArea, unitCode: "MTK" },
      address: {
        "@type": "PostalAddress",
        addressLocality: p.city,
        postalCode: p.postalCode ?? undefined,
        addressCountry: "ES",
      },
    },
  };
}

function Similar({ property }: { property: Property }) {
  const { data } = useRepoQuery(
    (r) =>
      r.listProperties({
        operation: property.operation,
        onlyPublished: true,
        status: ["disponible", "reservado"],
        minPrice: Math.round(property.price * 0.6),
        maxPrice: Math.round(property.price * 1.4),
      }),
    [property.id],
  );
  const items = (data ?? []).filter((p) => p.id !== property.id).slice(0, 3);
  if (!items.length) return null;
  return (
    <section className="border-t bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="mb-8 font-heading text-3xl font-semibold">También te puede interesar</h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="flex">
              <PropertyCard property={p} className="w-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: property, loading } = useRepoQuery((r) => r.getPropertyBySlug(slug), [slug]);

  if (loading && property === undefined) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6" aria-busy="true">
        <Skeleton className="h-[50vh] w-full rounded-2xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!property || !property.published) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl font-semibold">Este inmueble ya no está disponible</h1>
        <p className="mt-3 text-muted-foreground">Puede que se haya vendido o retirado. Echa un vistazo a los demás.</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/venta">Ver inmuebles</Link>
        </Button>
      </div>
    );
  }

  const p = property;
  const media = [...p.media].sort((a, b) => a.position - b.position);
  const photos = media.filter((m) => m.kind === "image");
  const video = media.find((m) => m.kind === "video");
  const closed = p.status === "vendido" || p.status === "alquilado";
  const listUrl = p.operation === "alquiler" ? "/alquiler" : "/venta";
  const phone = brand.contact.offices[0]?.phone;
  // En el navegador, la dirección real de la página.
  const pageUrl = `${typeof window !== "undefined" ? window.location.origin : siteUrl()}/inmueble/${p.slug}`;

  const facts = [
    { icon: RulerIcon, label: "Construidos", value: formatArea(p.builtArea) },
    p.usableArea ? { icon: RulerIcon, label: "Útiles", value: formatArea(p.usableArea) } : null,
    p.bedrooms ? { icon: BedDoubleIcon, label: "Dormitorios", value: String(p.bedrooms) } : null,
    p.bathrooms ? { icon: BathIcon, label: "Baños", value: String(p.bathrooms) } : null,
    p.floor ? { icon: BuildingIcon, label: "Planta", value: p.floor } : null,
    { icon: LeafIcon, label: "Certificado energético", value: ENERGY_LABELS[p.energyRating] },
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  return (
    <>
      <JsonLd data={listingJsonLd(p, pageUrl)} />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <nav aria-label="Migas de pan" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
            </li>
            <ChevronRightIcon className="size-3.5" aria-hidden />
            <li>
              <Link href={listUrl} className="hover:text-foreground">
                {OPERATION_LABELS[p.operation]}
              </Link>
            </li>
            <ChevronRightIcon className="size-3.5" aria-hidden />
            <li aria-current="page" className="truncate text-foreground">
              {p.reference}
            </li>
          </ol>
        </nav>
        <Gallery photos={photos} title={p.title} />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:py-14">
        <article className="min-w-0 space-y-10">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {p.status !== "disponible" && <StatusBadge status={p.status} />}
              <span>
                {TYPE_LABELS[p.type]} en {p.operation} · Ref. {p.reference}
              </span>
            </div>
            <h1 className="font-heading text-3xl leading-tight font-semibold text-balance sm:text-5xl">{p.title}</h1>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <MapPinIcon className="size-4" aria-hidden /> {p.zone}, {p.city}
            </p>
            <PriceTag property={p} size="lg" className="[&>span:first-child]:text-3xl" />
            {p.operation === "venta" && !closed && brand.modules.financing && brand.mortgagePartner && (
              <Link
                href={`/financiacion?precio=${p.price}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                <CalculatorIcon className="size-4" aria-hidden /> Calcula tu hipoteca
              </Link>
            )}
          </header>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <f.icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="font-semibold">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <section className="space-y-3">
            <h2 className="font-heading text-2xl font-semibold">Descripción</h2>
            <p className="max-w-prose text-lg leading-relaxed whitespace-pre-line">{p.description}</p>
          </section>

          {p.features.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold">Características</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-status-available" aria-hidden /> {FEATURE_LABELS[f]}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {video && (
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold">Vídeo</h2>
              <Video media={video} />
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Contacto">
          <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
            {closed ? (
              <div className="space-y-2">
                <p className="font-heading text-xl font-semibold">
                  Este inmueble ya está {p.status === "vendido" ? "vendido" : "alquilado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cuéntanos qué buscas y te avisamos cuando entre algo parecido.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{formatPrice(p.price, p.operation)}</p>
                <p className="font-heading text-xl font-semibold">¿Te interesa? Escríbenos</p>
              </div>
            )}
            <ContactForm
              propertyId={p.id}
              defaultReason={closed ? "informacion" : "visita"}
              defaultMessage={
                closed ? "" : `Hola, me interesa el inmueble ${p.reference}. ¿Podemos concertar una visita?`
              }
            />
            {phone && (
              <Button asChild variant="outline" size="lg" className="h-12 w-full text-base">
                <a href={telHref(phone)}>
                  <PhoneIcon /> Llamar al {phone}
                </a>
              </Button>
            )}
            {brand.contact.whatsapp && (
              <Button asChild variant="outline" size="lg" className="h-12 w-full text-base">
                <a
                  href={`https://wa.me/${brand.contact.whatsapp}?text=${encodeURIComponent(`Hola, me interesa ${p.reference}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </aside>
      </div>

      <Similar property={p} />
    </>
  );
}
