import { MapPinIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { brand } from "@/config/brand";
import { SITE_NAV, telHref } from "./nav";
import { SocialLinks } from "./social-links";

const LEGAL = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
];

export function SiteFooter() {
  const { offices, email } = brand.contact;
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_0.7fr_2fr]">
        <div className="space-y-3">
          <p className="font-heading text-2xl font-semibold">{brand.name}</p>
          <p className="max-w-xs text-sm text-primary-foreground/75">{brand.description}</p>
          {email && (
            <a href={`mailto:${email}`} className="block text-sm underline-offset-4 hover:underline">
              {email}
            </a>
          )}
          <SocialLinks className="pt-2" />
        </div>
        <nav aria-label="Pie de página">
          <ul className="space-y-2 text-sm">
            {SITE_NAV.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-primary-foreground/75 hover:text-primary-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="grid gap-8 sm:grid-cols-2">
          {offices.map((o) => (
            <li key={o.name} className="space-y-2 text-sm">
              <p className="font-semibold">{o.name}</p>
              <p className="flex gap-2 text-primary-foreground/75">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden /> {o.address}
              </p>
              <a href={telHref(o.phone)} className="flex gap-2 font-medium hover:text-cta">
                <PhoneIcon className="mt-0.5 size-4 shrink-0" aria-hidden /> {o.phone}
              </a>
              {o.hours && <p className="text-primary-foreground/75">{o.hours}</p>}
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-5 text-xs text-primary-foreground/70 sm:px-6">
          <span>© {brand.legalName}</span>
          {LEGAL.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-primary-foreground">
              {l.label}
            </Link>
          ))}
          <Link href="/admin" className="ml-auto hover:text-primary-foreground">
            Acceso equipo
          </Link>
        </div>
      </div>
    </footer>
  );
}
