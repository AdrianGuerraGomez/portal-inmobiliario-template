"use client";

import { MenuIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { brand } from "@/config/brand";
import { SITE_NAV, telHref } from "./nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="size-11 lg:hidden" aria-label="Abrir menú">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">{brand.name}</SheetTitle>
        </SheetHeader>
        <nav aria-label="Principal" className="flex flex-col px-4">
          {SITE_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b py-4 text-lg font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 p-4">
          {brand.contact.offices.map((o) => (
            <Button key={o.phone} asChild variant="cta" size="lg" className="h-12 w-full">
              <a href={telHref(o.phone)}>
                <PhoneIcon /> {o.phone}
              </a>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
