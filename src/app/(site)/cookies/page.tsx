import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Política de cookies", robots: { index: false } };

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        Esta web no usa cookies de publicidad ni de seguimiento. Solo guarda en tu navegador lo imprescindible para que
        funcione (por ejemplo, la sesión del panel de administración).
      </p>
      <p>
        Si en el futuro se añade analítica, se usará una herramienta sin cookies o se pedirá tu permiso antes de
        activarla.
      </p>
    </LegalPage>
  );
}
