"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldError as RHFFieldError,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { brand } from "@/config/brand";
import { useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import {
  ENERGY_LABELS,
  ENERGY_RATINGS,
  FEATURE_LABELS,
  FEATURES,
  OPERATION_LABELS,
  OPERATIONS,
  PROPERTY_TYPES,
  propertyInputSchema,
  TYPE_LABELS,
  type Property,
  type PropertyData,
  type PropertyInput,
} from "@/lib/domain/property";

type Props = { property?: Property };

const toNumber = (v: unknown) => (v === "" || v == null ? Number.NaN : Number(v));
const toNullableNumber = (v: unknown) => (v === "" || v == null ? null : Number(v));
const toNullableText = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

function emptyValues(): PropertyInput {
  return {
    title: "",
    description: "",
    operation: "venta",
    type: "piso",
    price: undefined as unknown as number,
    builtArea: undefined as unknown as number,
    usableArea: null,
    bedrooms: 0,
    bathrooms: 0,
    floor: null,
    features: [],
    energyRating: "en_tramite",
    address: "",
    zone: "",
    city: brand.city,
    postalCode: null,
    published: false,
    featured: false,
  };
}

function valuesOf(p: Property): PropertyInput {
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(propertyInputSchema.shape)) out[key] = p[key as keyof Property];
  return out as PropertyInput;
}

type TextProps = {
  label: string;
  error?: RHFFieldError;
  description?: string;
  registration: UseFormRegisterReturn;
} & Omit<React.ComponentProps<typeof Input>, "id">;

function TextField({ label, error, description, registration, ...input }: TextProps) {
  const id = useId();
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} aria-invalid={!!error} className="h-10" {...input} {...registration} />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}

export function PropertyForm({ property }: Props) {
  const repo = useRepository();
  const router = useRouter();
  const { run, pending } = useAction();
  const isNew = !property;

  const form = useForm<PropertyInput, unknown, PropertyData>({
    resolver: zodResolver(propertyInputSchema),
    defaultValues: property ? valuesOf(property) : emptyValues(),
    mode: "onTouched",
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  // Aviso al salir con cambios sin guardar.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // Cambios hechos fuera del formulario (rebaja, publicar desde el menú, otra pestaña):
  // se copian a los campos que el usuario no está tocando.
  const updatedAt = property?.updatedAt;
  useEffect(() => {
    if (!property) return;
    const fresh = valuesOf(property);
    for (const key of Object.keys(fresh) as (keyof PropertyInput)[]) {
      if (!form.getFieldState(key).isDirty) form.resetField(key, { defaultValue: fresh[key] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo cuando cambia el inmueble guardado
  }, [updatedAt]);

  const [operation, title, description] = useWatch({ control, name: ["operation", "title", "description"] });
  const titleLength = title?.length ?? 0;
  const descriptionLength = description?.length ?? 0;

  const onSubmit = handleSubmit(async (data) => {
    if (isNew) {
      const created = await run(() => repo.createProperty(data), "Inmueble creado. Ahora añade las fotos.");
      if (created) {
        form.reset(data);
        router.push(`/admin/inmuebles/${created.id}`);
      }
    } else {
      const saved = await run(() => repo.updateProperty(property.id, data), "Cambios guardados");
      if (saved) form.reset(valuesOf(saved));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos principales</CardTitle>
          <CardDescription>Lo primero que se ve en la web.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <TextField
              label="Título"
              placeholder="Ej.: Ático con terraza en el centro"
              registration={register("title")}
              error={errors.title}
              description={`${titleLength}/120 caracteres`}
              maxLength={120}
            />
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                rows={7}
                maxLength={5000}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldDescription>{descriptionLength}/5.000 caracteres</FieldDescription>
              <FieldError errors={[errors.description]} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.operation}>
                <FieldLabel htmlFor="operation">Operación</FieldLabel>
                <Controller
                  control={control}
                  name="operation"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="operation" className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATIONS.filter((o) => o === "venta" || brand.modules.rentals).map((o) => (
                          <SelectItem key={o} value={o}>
                            {OPERATION_LABELS[o]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field data-invalid={!!errors.type}>
                <FieldLabel htmlFor="type">Tipo de inmueble</FieldLabel>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type" className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precio y superficie</CardTitle>
          {!isNew && (
            <CardDescription>
              Para mostrar una rebaja con el precio tachado, usa «Acciones → Rebajar precio».
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              label={operation === "alquiler" ? "Precio al mes (€)" : "Precio (€)"}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              registration={register("price", { setValueAs: toNumber })}
              error={errors.price}
            />
            <TextField
              label="Superficie construida (m²)"
              type="number"
              inputMode="decimal"
              min={1}
              registration={register("builtArea", { setValueAs: toNumber })}
              error={errors.builtArea}
            />
            <TextField
              label="Superficie útil (m²)"
              type="number"
              inputMode="decimal"
              min={1}
              description="Opcional"
              registration={register("usableArea", { setValueAs: toNullableNumber })}
              error={errors.usableArea}
            />
            <TextField
              label="Dormitorios"
              type="number"
              inputMode="numeric"
              min={0}
              registration={register("bedrooms", { setValueAs: toNumber })}
              error={errors.bedrooms}
            />
            <TextField
              label="Baños"
              type="number"
              inputMode="numeric"
              min={0}
              registration={register("bathrooms", { setValueAs: toNumber })}
              error={errors.bathrooms}
            />
            <TextField
              label="Planta"
              placeholder="Ej.: 3º, Bajo"
              description="Opcional"
              maxLength={20}
              registration={register("floor", { setValueAs: toNullableText })}
              error={errors.floor}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={control}
              name="features"
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">Extras</FieldLegend>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => {
                      const checked = field.value?.includes(f) ?? false;
                      return (
                        <Field key={f} orientation="horizontal">
                          <Checkbox
                            id={`feature-${f}`}
                            checked={checked}
                            onCheckedChange={(on) =>
                              field.onChange(
                                on ? [...(field.value ?? []), f] : (field.value ?? []).filter((x) => x !== f),
                              )
                            }
                          />
                          <FieldLabel htmlFor={`feature-${f}`} className="font-normal">
                            {FEATURE_LABELS[f]}
                          </FieldLabel>
                        </Field>
                      );
                    })}
                  </div>
                </FieldSet>
              )}
            />
            <Field data-invalid={!!errors.energyRating} className="sm:max-w-xs">
              <FieldLabel htmlFor="energy">Certificado energético</FieldLabel>
              <Controller
                control={control}
                name="energyRating"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="energy" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENERGY_RATINGS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ENERGY_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>Obligatorio en los anuncios de venta y alquiler.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
          <CardDescription>En la web solo se muestran la zona y el municipio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Zona o barrio"
              placeholder="Ej.: Centro, Los Valles"
              registration={register("zone")}
              error={errors.zone}
            />
            <TextField label="Municipio" registration={register("city")} error={errors.city} />
            <TextField
              label="Dirección"
              description="Privada: solo para el equipo."
              autoComplete="off"
              registration={register("address")}
              error={errors.address}
            />
            <TextField
              label="Código postal"
              inputMode="numeric"
              maxLength={5}
              description="Opcional"
              registration={register("postalCode", { setValueAs: toNullableText })}
              error={errors.postalCode}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publicación</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {(
              [
                ["published", "Publicado en la web", "Si está apagado, solo se ve en el panel."],
                ["featured", "Destacado", "Aparece en la portada."],
              ] as const
            ).map(([name, label, hint]) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor={name}>{label}</FieldLabel>
                      <FieldDescription>{hint}</FieldDescription>
                    </FieldContent>
                    <Switch id={name} checked={!!field.value} onCheckedChange={field.onChange} />
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-20 -mx-4 flex items-center justify-end gap-3 border-t bg-card/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <p className="mr-auto text-sm text-muted-foreground" aria-live="polite">
          {isDirty ? "Hay cambios sin guardar" : isNew ? "" : "Todo guardado"}
        </p>
        {isNew && (
          <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/inmuebles")}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="lg" disabled={pending || (!isNew && !isDirty)}>
          <SaveIcon /> {isNew ? "Crear inmueble" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
