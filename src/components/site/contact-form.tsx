"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { brand } from "@/config/brand";
import { useRepository } from "@/lib/data/provider";
import { DomainError } from "@/lib/domain/errors";
import { LEAD_REASON_LABELS, LEAD_REASONS, leadInputSchema, type LeadInput, type LeadReason } from "@/lib/domain/lead";
import { cn } from "@/lib/utils";

type Props = {
  propertyId?: string;
  defaultReason?: LeadReason;
  defaultMessage?: string;
  showReason?: boolean;
  className?: string;
};

export function ContactForm({
  propertyId,
  defaultReason = "informacion",
  defaultMessage = "",
  showReason,
  className,
}: Props) {
  const repo = useRepository();
  const id = useId();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadInputSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: defaultMessage,
      reason: defaultReason,
      propertyId: propertyId ?? null,
      consent: false as unknown as true,
      website: "",
    },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      await repo.createLead(data);
      setSent(true);
      reset();
    } catch (error) {
      setServerError(error instanceof DomainError ? error.message : "No se pudo enviar. Llámanos, por favor.");
    }
  });

  if (sent) {
    return (
      <div className={cn("space-y-3 rounded-xl bg-secondary p-6 text-secondary-foreground", className)} role="status">
        <CheckCircle2Icon className="size-8 text-status-available" aria-hidden />
        <p className="font-heading text-xl font-semibold">¡Mensaje enviado!</p>
        <p>Te contestamos lo antes posible, normalmente en el día.</p>
        <Button variant="outline" size="lg" onClick={() => setSent(false)}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-4", className)}>
      {showReason && (
        <Field>
          <FieldLabel htmlFor={`${id}-reason`}>Motivo</FieldLabel>
          <Controller
            control={control}
            name="reason"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={`${id}-reason`} className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {LEAD_REASON_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      )}
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={`${id}-name`}>Nombre</FieldLabel>
        <Input
          id={`${id}-name`}
          autoComplete="name"
          className="h-11"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError errors={[errors.name]} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            className="h-11"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor={`${id}-phone`}>
            Teléfono <span className="font-normal text-muted-foreground">(opcional)</span>
          </FieldLabel>
          <Input
            id={`${id}-phone`}
            type="tel"
            autoComplete="tel"
            className="h-11"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>
      </div>
      <Field data-invalid={!!errors.message}>
        <FieldLabel htmlFor={`${id}-message`}>Mensaje</FieldLabel>
        <Textarea id={`${id}-message`} rows={4} aria-invalid={!!errors.message} {...register("message")} />
        <FieldError errors={[errors.message]} />
      </Field>

      {/* Campo trampa: oculto para personas, los bots lo rellenan. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor={`${id}-website`}>No rellenar</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <Controller
        control={control}
        name="consent"
        render={({ field }) => (
          <Field orientation="horizontal" data-invalid={!!errors.consent} className="items-start">
            <Checkbox
              id={`${id}-consent`}
              checked={field.value === true}
              onCheckedChange={(v) => field.onChange(v === true)}
              aria-invalid={!!errors.consent}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <FieldLabel htmlFor={`${id}-consent`} className="font-normal leading-snug text-muted-foreground">
                <span>
                  Acepto que {brand.name} use mis datos para responderme. Más información en la{" "}
                  <Link href="/privacidad" className="text-foreground underline underline-offset-2">
                    política de privacidad
                  </Link>
                  .
                </span>
              </FieldLabel>
              <FieldError errors={[errors.consent]} />
            </div>
          </Field>
        )}
      />

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}
      <Button type="submit" variant="cta" size="lg" className="h-12 w-full text-base" disabled={isSubmitting}>
        <SendIcon /> Enviar mensaje
      </Button>
    </form>
  );
}
