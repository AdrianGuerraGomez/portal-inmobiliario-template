import { PhoneIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { MobileMenu } from "./mobile-menu";
import { SITE_NAV, telHref } from "./nav";

export function SiteHeader() {
  const phone = brand.contact.offices[0]?.phone;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="min-w-0 truncate font-heading text-xl font-semibold tracking-tight">
          {brand.name}
        </Link>
        <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 lg:flex">
          {SITE_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {phone && (
            <Button asChild variant="cta" size="lg" className="hidden h-10 px-4 sm:inline-flex">
              <a href={telHref(phone)}>
                <PhoneIcon /> {phone}
              </a>
            </Button>
          )}
          {phone && (
            <Button asChild variant="cta" size="icon-lg" className="size-11 sm:hidden">
              <a href={telHref(phone)} aria-label={`Llamar al ${phone}`}>
                <PhoneIcon className="size-5" />
              </a>
            </Button>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
