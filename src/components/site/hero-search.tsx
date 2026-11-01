"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brand } from "@/config/brand";
import { PROPERTY_TYPES, TYPE_LABELS, type Operation } from "@/lib/domain/property";
import { cn } from "@/lib/utils";

const ANY = "cualquiera";
const MAX_SALE = [100000, 150000, 200000, 300000, 400000];
const MAX_RENT = [500, 750, 1000, 1500];

export function HeroSearch() {
  const router = useRouter();
  const [operation, setOperation] = useState<Operation>("venta");
  const [type, setType] = useState<string>(ANY);
  const [max, setMax] = useState<string>(ANY);

  const prices = operation === "venta" ? MAX_SALE : MAX_RENT;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (type !== ANY) q.set("tipo", type);
    if (max !== ANY) q.set("max", max);
    router.push(`/${operation}${q.size ? `?${q}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-3xl rounded-2xl bg-card p-3 text-card-foreground shadow-xl sm:p-4">
      {brand.modules.rentals && (
        <div role="radiogroup" aria-label="Operación" className="mb-3 inline-flex rounded-lg bg-muted p-1">
          {(["venta", "alquiler"] as const).map((o) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={operation === o}
              onClick={() => {
                setOperation(o);
                setMax(ANY);
              }}
              className={cn(
                "min-h-9 rounded-md px-4 text-sm font-medium transition-colors",
                operation === o ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o === "venta" ? "Comprar" : "Alquilar"}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-12 w-full" aria-label="Tipo de inmueble">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Cualquier tipo</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={max} onValueChange={setMax}>
          <SelectTrigger className="h-12 w-full" aria-label="Precio máximo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Sin límite de precio</SelectItem>
            {prices.map((p) => (
              <SelectItem key={p} value={String(p)}>
                Hasta {p.toLocaleString(brand.locale, { useGrouping: "always" })} €{operation === "alquiler" && "/mes"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="cta" size="lg" className="h-12 px-6 text-base">
          <SearchIcon /> Buscar
        </Button>
      </div>
    </form>
  );
}
