import type { ReactNode } from "react";

// Plantilla para textos legales. El contenido de cada cliente lo debe revisar su asesor.
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-heading text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        Texto de ejemplo. Debe revisarlo el asesor legal de la empresa antes de publicar la web.
      </p>
      <div className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold">
        {children}
      </div>
    </article>
  );
}
