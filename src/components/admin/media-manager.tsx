"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilmIcon,
  GripVerticalIcon,
  ImagePlusIcon,
  LoaderIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useMediaUrl } from "@/components/property/media-image";
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
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { brand } from "@/config/brand";
import { useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import { DomainError } from "@/lib/domain/errors";
import { assertFileAllowed, assertMediaCount, IMAGE_TYPES, VIDEO_TYPES } from "@/lib/domain/media-rules";
import type { Property, PropertyMedia } from "@/lib/domain/property";
import { normalizedType, processImage } from "@/lib/media/process-image";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = { property: Property };

type Job = { done: number; total: number; current: string };

function byPosition(media: PropertyMedia[]) {
  return [...media].sort((a, b) => a.position - b.position);
}

function PhotoTile({
  media,
  index,
  total,
  alt,
  onMove,
  onCover,
  onDelete,
}: {
  media: PropertyMedia;
  index: number;
  total: number;
  alt: string;
  onMove: (to: number) => void;
  onCover: () => void;
  onDelete: () => void;
}) {
  const url = useMediaUrl(media);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: media.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted",
        isDragging && "z-10 shadow-lg ring-2 ring-ring",
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: locales
        <img src={url} alt={alt} className="aspect-4/3 w-full object-cover" />
      ) : (
        <div className="aspect-4/3 w-full animate-pulse bg-muted" />
      )}

      {index === 0 && (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-cta px-2 py-0.5 text-xs font-semibold text-cta-foreground">
          <StarIcon className="size-3" aria-hidden /> Portada
        </span>
      )}

      <button
        type="button"
        className="absolute top-1.5 right-1.5 flex size-9 cursor-grab touch-none items-center justify-center rounded-md bg-card/90 text-foreground shadow-sm active:cursor-grabbing"
        aria-label={`Arrastrar foto ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" aria-hidden />
      </button>

      <div className="flex items-center justify-between gap-1 border-t bg-card p-1">
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
            aria-label={`Mover foto ${index + 1} a la izquierda`}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            disabled={index === total - 1}
            onClick={() => onMove(index + 1)}
            aria-label={`Mover foto ${index + 1} a la derecha`}
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="flex">
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={onCover}
              aria-label={`Usar foto ${index + 1} como portada`}
            >
              <StarIcon />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label={`Quitar foto ${index + 1}`}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>
    </li>
  );
}

function VideoPlayer({ media, onDelete }: { media: PropertyMedia; onDelete: () => void }) {
  const url = useMediaUrl(media);
  return (
    <div className="space-y-2">
      {url ? (
        <video src={url} controls preload="metadata" className="aspect-video w-full rounded-lg bg-black" />
      ) : (
        <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
      )}
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{formatBytes(media.sizeBytes)}</span>
        <Button type="button" variant="outline" size="lg" onClick={onDelete}>
          <Trash2Icon /> Quitar vídeo
        </Button>
      </div>
    </div>
  );
}

export function MediaManager({ property }: Props) {
  const repo = useRepository();
  const { run } = useAction();
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toDelete, setToDelete] = useState<PropertyMedia | null>(null);

  const media = byPosition(property.media);
  const photos = media.filter((m) => m.kind === "image");
  const video = media.find((m) => m.kind === "video") ?? null;
  const freeSlots = brand.media.maxPhotos - photos.length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Las fotos van primero; el vídeo siempre al final del orden.
  function saveOrder(orderedPhotos: PropertyMedia[]) {
    const ids = [...orderedPhotos.map((m) => m.id), ...(video ? [video.id] : [])];
    return run(() => repo.reorderMedia(property.id, ids));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    saveOrder(arrayMove(photos, from, to));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    move(
      photos.findIndex((m) => m.id === active.id),
      photos.findIndex((m) => m.id === over.id),
    );
  }

  async function addPhotos(files: File[]) {
    if (!files.length) return;
    // Se avisa antes de procesar nada: formato, peso y cupo.
    try {
      for (const f of files) {
        const kind = assertFileAllowed({ size: f.size, type: normalizedType(f) });
        if (kind !== "image") throw new DomainError("file_type", `${f.name} no es una foto.`);
      }
      assertMediaCount(property.media, { image: files.length, video: 0 });
    } catch (error) {
      toast.error(error instanceof DomainError ? error.message : "Archivo no válido");
      return;
    }

    let saved = 0;
    for (const [i, file] of files.entries()) {
      setJob({ done: i, total: files.length, current: file.name });
      try {
        const img = await processImage(file);
        await repo.addMedia(property.id, [
          { file: img.file, name: img.file.name, width: img.width, height: img.height },
        ]);
        saved++;
      } catch (error) {
        toast.error(error instanceof DomainError ? error.message : `No se pudo procesar ${file.name}`);
        if (!(error instanceof DomainError)) console.error(error);
      }
    }
    setJob(null);
    if (saved) toast.success(saved === 1 ? "Foto añadida" : `${saved} fotos añadidas`);
  }

  async function addVideo(file: File | undefined) {
    if (!file) return;
    const typed = file.type ? file : new File([file], file.name, { type: normalizedType(file) });
    setJob({ done: 0, total: 1, current: file.name });
    await run(() => repo.addMedia(property.id, [{ file: typed, name: file.name }]), "Vídeo añadido");
    setJob(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fotos y vídeo</CardTitle>
        <CardDescription>
          Hasta {brand.media.maxPhotos} fotos (JPG, PNG, WebP o HEIC, máx. {brand.media.maxPhotoMB} MB cada una). Se
          optimizan solas y se les quita la ubicación GPS.
        </CardDescription>
        <CardAction>
          <span className="text-sm font-medium tabular-nums" aria-live="polite">
            {photos.length}/{brand.media.maxPhotos}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <input
          ref={photoInput}
          type="file"
          multiple
          accept={[...IMAGE_TYPES, ".heic", ".heif"].join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            addPhotos(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />

        {freeSlots > 0 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addPhotos(Array.from(e.dataTransfer.files));
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
              dragOver ? "border-primary bg-accent" : "border-border",
            )}
          >
            <ImagePlusIcon className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Arrastra las fotos aquí o</p>
            <Button type="button" size="lg" onClick={() => photoInput.current?.click()} disabled={!!job}>
              <UploadIcon /> Elegir fotos
            </Button>
            <p className="text-xs text-muted-foreground">Quedan {freeSlots} huecos</p>
          </div>
        )}

        {job && (
          <div className="space-y-2 rounded-lg bg-muted p-4" role="status">
            <p className="flex items-center gap-2 text-sm">
              <LoaderIcon className="size-4 animate-spin" aria-hidden />
              Procesando {job.done + 1} de {job.total}: <span className="truncate">{job.current}</span>
            </p>
            <Progress value={(job.done / job.total) * 100} aria-label="Progreso de subida" />
          </div>
        )}

        {photos.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={photos.map((m) => m.id)} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((m, i) => (
                  <PhotoTile
                    key={m.id}
                    media={m}
                    index={i}
                    total={photos.length}
                    alt={m.alt || `${property.title}, foto ${i + 1}`}
                    onMove={(to) => move(i, to)}
                    onCover={() => move(i, 0)}
                    onDelete={() => setToDelete(m)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        {brand.modules.video && (
          <div className="space-y-3 border-t pt-6">
            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <FilmIcon className="size-4" aria-hidden /> Vídeo
              </h3>
              <p className="text-sm text-muted-foreground">
                {brand.media.maxVideos} vídeo MP4 o MOV, máx. {brand.media.maxVideoMB} MB. Recomendado: 1080p y menos de
                2 minutos.
              </p>
            </div>
            <input
              ref={videoInput}
              type="file"
              accept={[...VIDEO_TYPES, ".mov"].join(",")}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                addVideo(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {video ? (
              <VideoPlayer media={video} onDelete={() => setToDelete(video)} />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => videoInput.current?.click()}
                disabled={!!job}
              >
                <UploadIcon /> Subir vídeo
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toDelete?.kind === "video" ? "¿Quitar el vídeo?" : "¿Quitar esta foto?"}
            </AlertDialogTitle>
            <AlertDialogDescription>Se borra del inmueble. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => toDelete && run(() => repo.removeMedia(property.id, toDelete.id), "Archivo quitado")}
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
