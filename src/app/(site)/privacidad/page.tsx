import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Política de privacidad", robots: { index: false } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad">
      <h2>Responsable</h2>
      <p>{brand.legalName}.</p>
      <h2>Qué datos tratamos y para qué</h2>
      <p>
        Nombre, email, teléfono y el mensaje que nos envías por el formulario, solo para responder a tu consulta y, si
        lo pides, gestionar visitas o la venta de tu inmueble.
      </p>
      <h2>Base legal</h2>
      <p>Tu consentimiento al enviar el formulario (art. 6.1.a RGPD).</p>
      <h2>Cuánto tiempo</h2>
      <p>Mientras dure la relación y, después, el plazo que exija la ley.</p>
      <h2>Tus derechos</h2>
      <p>
        Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiéndonos o visitando
        cualquiera de nuestras oficinas. También puedes reclamar ante la Agencia Española de Protección de Datos
        (aepd.es).
      </p>
    </LegalPage>
  );
}
