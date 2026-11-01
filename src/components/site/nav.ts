import { brand } from "@/config/brand";

export const SITE_NAV = [
  { href: "/venta", label: "Comprar" },
  ...(brand.modules.rentals ? [{ href: "/alquiler", label: "Alquilar" }] : []),
  { href: "/contacto#vender", label: "Vender tu casa" },
  { href: "/contacto", label: "Contacto" },
];

export function telHref(phone: string) {
  return `tel:+34${phone.replace(/\s/g, "")}`;
}
