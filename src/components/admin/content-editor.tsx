"use client";

import { EyeIcon, ImageUpIcon, LockIcon, RotateCcwIcon, SaveIcon, SendIcon, Trash2Icon } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ContentOverrides, ContentState } from "@/lib/content/defaults";
import { CONTENT_GROUPS, defaultValue, validateContent, type ContentField } from "@/lib/content/fields";
import { setContentPreview, useContentImage } from "@/lib/content/use-content";
import { useRepoQuery, useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import { useSession } from "@/lib/data/use-session";
import { DomainError } from "@/lib/domain/errors";
import { formatDateTime } from "@/lib/format";
import { imageSrc } from "@/lib/media/image-url";
import { processCroppedImage } from "@/lib/media/process-image";
import { cn } from "@/lib/utils";

type Values = Record<string, string>;

function valuesFrom(overrides: ContentOverrides): Values {
  const out: Values = {};
  for (const g of CONTENT_GROUPS) for (const f of g.fields) out[f.path] = overrides[f.path] ?? defaultValue(f.path);
  return out;
}

function ImageField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: ContentField;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const repo = useRepository();
  const input = useRef<HTMLInputElement>(null);
  const url = useContentImage(value);
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const img = await processCroppedImage(file, field.aspect ?? 16 / 9);
      onChange(await repo.uploadContentImage(img.file));
      toast.success("Imagen preparada. Guarda o publica para aplicarla.");
    } catch (error) {
      toast.error(error instanceof DomainError ? error.message : "No se pudo procesar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-muted" style={{ aspectRatio: field.aspect ?? 16 / 9 }}>
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa de imagen local o remota
          <img src={imageSrc(url, 800)} alt="" className="size-full object-cover" />
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
      >
        <ImageUpIcon /> {busy ? "Procesando…" : "Cambiar imagen"}
      </Button>
    </div>
  );
}

function ContentForm({
  state,
  canEditCompany,
  groupId,
  onGroupChange: setGroupId,
}: {
  state: ContentState;
  canEditCompany: boolean;
  groupId: string;
  onGroupChange: (id: string) => void;
}) {
  const repo = useRepository();
  const { run, pending } = useAction();
  const initial = useMemo(() => valuesFrom(state.draft ?? state.published), [state]);
  const [values, setValues] = useState<Values>(initial);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const formId = useId();

  const dirty = Object.keys(values).some((k) => values[k] !== initial[k]);
  const group = CONTENT_GROUPS.find((g) => g.id === groupId)!;
  const locked = group.adminOnly && !canEditCompany;

  function set(path: string, v: string) {
    setValues((prev) => ({ ...prev, [path]: v }));
  }

  // Valida aquí también para avisar antes de tocar los datos.
  function check(): boolean {
    try {
      validateContent(values);
      return true;
    } catch (error) {
      toast.error(error instanceof DomainError ? error.message : "Revisa los campos.");
      return false;
    }
  }

  async function saveDraft(message?: string) {
    if (!check()) return false;
    return Boolean(await run(() => repo.saveContentDraft(values), message));
  }

  async function preview() {
    if (dirty && !(await saveDraft())) return;
    setContentPreview(true);
    window.open(group.previewHref, "_blank");
  }

  async function publish() {
    if (dirty && !(await saveDraft())) return;
    await run(() => repo.publishContent(), "Cambios publicados en la web");
  }

  const hasDraft = state.draft !== null || dirty;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Secciones" className="flex gap-2 overflow-x-auto lg:flex-col">
        {CONTENT_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroupId(g.id)}
            aria-current={g.id === groupId ? "page" : undefined}
            className={cn(
              "flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-left text-sm font-medium transition-colors",
              g.id === groupId ? "bg-card shadow-sm" : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
            )}
          >
            {g.label}
            {g.adminOnly && <LockIcon className="size-3.5" aria-label="Solo administradores" />}
          </button>
        ))}
      </nav>

      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{group.label}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {locked && (
              <p className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                <LockIcon className="size-4" aria-hidden /> Solo un administrador puede cambiar estos datos.
              </p>
            )}
            {group.fields.map((f) => {
              const id = `${formId}-${f.path}`;
              const value = values[f.path] ?? "";
              const changedFromDefault = value !== defaultValue(f.path);
              return (
                <Field key={f.path}>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel htmlFor={id}>{f.label}</FieldLabel>
                    {changedFromDefault && !locked && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => set(f.path, defaultValue(f.path))}
                        title="Volver al texto original de la plantilla"
                      >
                        <RotateCcwIcon /> Original
                      </Button>
                    )}
                  </div>
                  {f.kind === "image" ? (
                    <ImageField field={f} value={value} onChange={(v) => set(f.path, v)} disabled={locked} />
                  ) : f.kind === "textarea" ? (
                    <Textarea
                      id={id}
                      rows={3}
                      value={value}
                      maxLength={f.max}
                      disabled={locked}
                      onChange={(e) => set(f.path, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={id}
                      className="h-10"
                      type={
                        f.kind === "email" ? "email" : f.kind === "url" ? "url" : f.kind === "phone" ? "tel" : "text"
                      }
                      value={value}
                      maxLength={f.max}
                      disabled={locked}
                      onChange={(e) => set(f.path, e.target.value)}
                    />
                  )}
                  {(f.hint || f.max) && f.kind !== "image" && (
                    <FieldDescription className="flex justify-between gap-4">
                      <span>
                        {f.hint}
                        {f.optional && !f.hint?.includes("Opcional") ? `${f.hint ? " · " : ""}Opcional` : ""}
                      </span>
                      {f.max && (
                        <span className="tabular-nums">
                          {value.length}/{f.max}
                        </span>
                      )}
                    </FieldDescription>
                  )}
                  {f.kind === "image" && f.hint && <FieldDescription>{f.hint}</FieldDescription>}
                </Field>
              );
            })}
          </CardContent>
        </Card>

        <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t bg-card/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
          <p className="mr-auto text-sm text-muted-foreground" aria-live="polite">
            {dirty
              ? "Cambios sin guardar"
              : state.draft
                ? `Borrador guardado${state.draftAt ? ` · ${formatDateTime(state.draftAt)}` : ""}`
                : state.publishedAt
                  ? `Publicado ${formatDateTime(state.publishedAt)} por ${state.publishedBy}`
                  : "Sin cambios: la web usa los textos de la plantilla"}
          </p>
          {state.draft && !dirty && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={pending}
              onClick={() => run(() => repo.discardContentDraft(), "Borrador descartado")}
            >
              <Trash2Icon /> Descartar borrador
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={pending || !dirty}
            onClick={() => saveDraft("Borrador guardado")}
          >
            <SaveIcon /> Guardar borrador
          </Button>
          <Button type="button" variant="outline" size="lg" disabled={pending || !hasDraft} onClick={preview}>
            <EyeIcon /> Vista previa
          </Button>
          <Button type="button" size="lg" disabled={pending || !hasDraft} onClick={() => setConfirmPublish(true)}>
            <SendIcon /> Publicar
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Publicar los cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Los visitantes verán los nuevos textos e imágenes al momento. Queda registrado en el histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={publish}>Publicar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ContentEditor() {
  const session = useSession();
  const { data: state } = useRepoQuery((r) => r.getContentState(), []);
  const [groupId, setGroupId] = useState(CONTENT_GROUPS[0].id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Contenido web</h1>
        <p className="text-sm text-muted-foreground">
          Cambia textos e imágenes de la web. La estructura y el diseño no se tocan.
        </p>
      </div>
      {!state || session === undefined ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        // Se vuelve a montar al guardar o publicar, para partir de lo guardado.
        <ContentForm
          key={`${state.draftAt}-${state.publishedAt}`}
          state={state}
          canEditCompany={session?.role === "admin"}
          groupId={groupId}
          onGroupChange={setGroupId}
        />
      )}
    </div>
  );
}
