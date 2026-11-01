import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

// Guía de estilo: sirve para revisar un tema nuevo de un vistazo.
export const metadata: Metadata = {
  title: "Guía de estilo",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "primary", className: "bg-primary text-primary-foreground" },
  { name: "cta", className: "bg-cta text-cta-foreground" },
  { name: "secondary", className: "bg-secondary text-secondary-foreground" },
  { name: "muted", className: "bg-muted text-muted-foreground" },
  { name: "card", className: "bg-card text-card-foreground border" },
  { name: "background", className: "bg-background text-foreground border" },
];

const statuses = [
  { label: "Disponible", className: "bg-status-available" },
  { label: "Reservado", className: "bg-status-reserved" },
  { label: "Vendido", className: "bg-status-sold" },
  { label: "Rebajado", className: "bg-price-drop" },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-14 px-4 py-16">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Tema activo · {brand.name}</p>
        <h1 className="text-4xl font-semibold">Guía de estilo</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Colores</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {swatches.map((s) => (
            <li key={s.name} className={`rounded-lg p-4 text-sm font-medium ${s.className}`}>
              {s.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tipografía</h2>
        <p className="font-heading text-5xl">Ático con terraza en el centro</p>
        <p className="max-w-prose text-lg">
          Texto de cuerpo. Piso luminoso de 3 habitaciones y 2 baños, reformado, con ascensor y plaza de garaje. A cinco
          minutos del centro de {brand.city}.
        </p>
        <p className="text-sm text-muted-foreground">Texto secundario · Ref. CB-0123</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Botones</h2>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" variant="cta">
            Pedir visita
          </Button>
          <Button size="lg">Ver inmuebles</Button>
          <Button size="lg" variant="secondary">
            Secundario
          </Button>
          <Button size="lg" variant="outline">
            Contorno
          </Button>
          <Button size="lg" variant="ghost">
            Fantasma
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Estados de inmueble</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <span key={s.label} className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${s.className}`}>
              {s.label}
            </span>
          ))}
        </div>
        <p className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold">172.000 €</span>
          <span className="text-muted-foreground line-through">185.000 €</span>
          <span className="font-semibold text-price-drop">−7 %</span>
        </p>
      </section>
    </main>
  );
}
