"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PURCHASE_COSTS_PCT, simulateMortgage } from "@/lib/domain/mortgage";
import { formatPrice } from "@/lib/format";

type Props = { initialPrice?: number; disclaimer: string };

function NumberField({
  label,
  suffix,
  value,
  onChange,
  min,
  max,
  step,
  hint,
}: {
  label: string;
  suffix: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
          className="h-12 pr-14 text-base tabular-nums"
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} (deslizador)`}
        className="w-full accent-primary"
      />
    </div>
  );
}

export function MortgageCalculator({ initialPrice, disclaimer }: Props) {
  const [price, setPrice] = useState(initialPrice && initialPrice > 0 ? initialPrice : 200_000);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(3);

  const valid = [price, down, years, rate].every(Number.isFinite) && price > 0 && years > 0;
  const result = valid ? simulateMortgage({ price, downPaymentPct: down, years, annualRatePct: rate }) : null;

  return (
    <div className="grid gap-8 rounded-3xl border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-6 sm:grid-cols-2">
        <NumberField
          label="Precio de la vivienda"
          suffix="€"
          value={price}
          onChange={setPrice}
          min={30_000}
          max={1_000_000}
          step={5_000}
        />
        <NumberField
          label="Entrada"
          suffix="%"
          value={down}
          onChange={setDown}
          min={0}
          max={80}
          step={5}
          hint={valid ? formatPrice(Math.round((price * down) / 100)) : undefined}
        />
        <NumberField label="Plazo" suffix="años" value={years} onChange={setYears} min={5} max={40} step={1} />
        <NumberField label="Interés (TIN)" suffix="%" value={rate} onChange={setRate} min={0} max={8} step={0.05} />
      </div>

      <div
        className="flex flex-col justify-between gap-6 rounded-2xl bg-primary p-6 text-primary-foreground"
        aria-live="polite"
      >
        {result ? (
          <dl className="space-y-5">
            <div>
              <dt className="text-sm text-primary-foreground/75">Cuota mensual estimada</dt>
              <dd className="text-4xl font-semibold tracking-tight tabular-nums">
                {formatPrice(Math.round(result.monthly))}
                <span className="text-lg font-normal">/mes</span>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-primary-foreground/75">Importe de la hipoteca</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(Math.round(result.loan))}</dd>
              </div>
              <div>
                <dt className="text-primary-foreground/75">Intereses totales</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(Math.round(result.totalInterest))}</dd>
              </div>
            </div>
            <div className="text-sm">
              <dt className="text-primary-foreground/75">Ahorro necesario aprox.</dt>
              <dd className="font-semibold tabular-nums">{formatPrice(Math.round(result.savingsNeeded))}</dd>
              <dd className="mt-1 text-xs text-primary-foreground/70">
                Entrada más un {PURCHASE_COSTS_PCT} % aprox. en impuestos y gastos.
              </dd>
            </div>
          </dl>
        ) : (
          <p>Completa los datos para ver la cuota.</p>
        )}
        <p className="text-xs text-primary-foreground/70">{disclaimer}</p>
      </div>
    </div>
  );
}
