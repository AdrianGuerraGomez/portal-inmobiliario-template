import { ExternalLinkIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactForm } from "@/components/site/contact-form";
import { FinancingHero, FinancingRent } from "@/components/site/financing-sections";
import { MortgageCalculator } from "@/components/site/mortgage-calculator";
import { telHref } from "@/components/site/nav";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Hipotecas y financiación",
  description: `Calcula tu cuota y pide un estudio gratuito de tu hipoteca con ${brand.mortgagePartner?.name ?? brand.name}.`,
};

// El precio puede venir de la ficha de un inmueble (?precio=...).
async function Calculator({ searchParams }: { searchParams: PageProps<"/financiacion">["searchParams"] }) {
  const { precio } = await searchParams;
  const price = Number(Array.isArray(precio) ? precio[0] : precio);
  return <MortgageCalculator initialPrice={Number.isFinite(price) ? price : undefined} />;
}

export default function FinancingPage({ searchParams }: PageProps<"/financiacion">) {
  const partner = brand.mortgagePartner;
  if (!brand.modules.financing || !partner) notFound();
  const host = partner.url.replace(/^https?:\/\//, "");

  return (
    <>
      <FinancingHero partnerName={partner.name} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="mb-2 text-3xl font-semibold">Calcula tu cuota</h2>
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Una primera idea en segundos. Para tu caso real, el equipo de {partner.name} estudia tu perfil gratis.
        </p>
        <Suspense fallback={<div className="h-96 rounded-3xl border bg-card" />}>
          <Calculator searchParams={searchParams} />
        </Suspense>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_460px]">
          <div className="space-y-8">
            <FinancingRent />
            <ul className="grid gap-4 sm:grid-cols-2">
              {partner.contacts.map((p) => (
                <li key={p.phone} className="space-y-2 rounded-2xl bg-card p-5 text-card-foreground">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.role}</p>
                  <a href={telHref(p.phone)} className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <PhoneIcon className="size-4" aria-hidden /> {p.phone}
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="lg" className="h-12 bg-card">
              <a href={partner.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon /> {host}
              </a>
            </Button>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-2 text-2xl font-semibold">Pide tu estudio gratuito</h2>
            <p className="mb-6 text-sm text-muted-foreground">Sin compromiso. Te llamamos para conocer tu caso.</p>
            <ContactForm
              defaultReason="hipoteca"
              defaultMessage="Hola, me gustaría un estudio de financiación para comprar vivienda."
            />
          </div>
        </div>
      </section>
    </>
  );
}
