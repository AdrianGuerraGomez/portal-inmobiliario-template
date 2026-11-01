"use client";

import { EyeIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setContentPreview, usePreviewMode } from "@/lib/content/use-content";

// Aviso fijo mientras se ve el borrador del contenido.
export function PreviewBanner() {
  const preview = usePreviewMode();
  if (!preview) return null;
  return (
    <div
      role="status"
      className="relative z-50 flex flex-wrap items-center justify-center gap-3 bg-cta px-4 py-2 text-sm font-medium text-cta-foreground"
    >
      <EyeIcon className="size-4" aria-hidden />
      Vista previa del borrador: los visitantes aún no ven estos cambios.
      <Button size="sm" variant="outline" className="bg-card" onClick={() => setContentPreview(false)}>
        <XIcon /> Salir
      </Button>
    </div>
  );
}
