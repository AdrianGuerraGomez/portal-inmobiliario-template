import type { Metadata } from "next";
import { ContactView } from "@/components/site/contact-view";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Oficinas, teléfonos y formulario de contacto de ${brand.name}.`,
};

export default function ContactPage() {
  return <ContactView />;
}
