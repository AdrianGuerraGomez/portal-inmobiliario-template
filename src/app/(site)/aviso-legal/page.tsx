import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Aviso legal", robots: { index: false } };

export default function LegalNoticePage() {
  const office = brand.contact.offices[0];
  return (
    <LegalPage title="Aviso legal">
      <h2>Titular de la web</h2>
      <p>
        {brand.legalName}, con domicilio en {office?.address ?? brand.city}. CIF: [pendiente]. Inscrita en el Registro
        Mercantil de [pendiente].
      </p>
      <h2>Objeto</h2>
      <p>
        Esta web informa sobre los inmuebles que {brand.name} ofrece en venta y alquiler y permite contactar con la
        agencia. Los datos de cada inmueble son orientativos y no constituyen una oferta vinculante.
      </p>
      <h2>Propiedad intelectual</h2>
      <p>Los textos, fotografías y diseño de la web pertenecen a {brand.legalName} o se usan con permiso.</p>
    </LegalPage>
  );
}
