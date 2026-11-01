"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import type { Property } from "@/lib/domain/property";
import { formatPrice } from "@/lib/format";

type Props = {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PriceDropDialog({ property, open, onOpenChange }: Props) {
  const repo = useRepository();
  const { run, pending } = useAction();
  const [value, setValue] = useState("");

  const next = Number(value.replace(/\./g, ""));
  const valid = Number.isInteger(next) && next > 0 && next < property.price;
  const percent = valid ? Math.round(((property.price - next) / property.price) * 100) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const done = await run(() => repo.applyPriceDrop(property.id, next), `Rebaja aplicada: −${percent} %`);
    if (done) {
      setValue("");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Rebajar precio</DialogTitle>
            <DialogDescription>
              En la web se verá el precio anterior tachado y el porcentaje de rebaja.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={value !== "" && !valid}>
            <FieldLabel htmlFor="new-price">Nuevo precio (€)</FieldLabel>
            <Input
              id="new-price"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ""))}
              aria-invalid={value !== "" && !valid}
            />
            <FieldDescription>
              Precio actual: {formatPrice(property.price, property.operation)}
              {percent !== null && ` · Rebaja del ${percent} %`}
            </FieldDescription>
            {value !== "" && !valid && <FieldError>Tiene que ser menor que el precio actual.</FieldError>}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={!valid || pending}>
              Aplicar rebaja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
