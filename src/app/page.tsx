import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

// Portada provisional (Fase 0). Se sustituye en la Fase 3.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-24">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {brand.defaults.city}
      </p>
      <h1 className="text-4xl font-semibold text-balance sm:text-5xl">{brand.name}</h1>
      <p className="max-w-prose text-lg text-muted-foreground">{brand.description}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/styleguide">Ver guía de estilo</Link>
        </Button>
      </div>
    </main>
  );
}
