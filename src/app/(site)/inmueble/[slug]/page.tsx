import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PropertyDetail } from "@/components/site/property-detail";
import { seedSummaries } from "@/lib/data/demo/seed";
import { imageSrc } from "@/lib/media/image-url";

// En demo los datos viven en el navegador. Para el título de la página
// se usan los inmuebles de ejemplo; con Supabase se leerá de la base de datos.

// Los de ejemplo se generan al compilar; los creados en el panel, al visitarlos.
export function generateStaticParams() {
  return seedSummaries().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = seedSummaries().find((x) => x.slug === slug);
  if (!p) return { title: "Inmueble" };
  return {
    title: p.title,
    description: p.description.slice(0, 155),
    alternates: { canonical: `/inmueble/${p.slug}` },
    openGraph: p.cover ? { images: [{ url: imageSrc(p.cover, 1200), width: 1200 }] } : undefined,
  };
}

// Marca la página como dinámica para los inmuebles creados en el panel
// (sin bloquear el resto). Patrón de la guía de generateMetadata.
async function Connection() {
  await connection();
  return null;
}

export default function PropertyPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-[80vh]" />}>
        <PropertyDetail />
      </Suspense>
      <Suspense>
        <Connection />
      </Suspense>
    </>
  );
}
