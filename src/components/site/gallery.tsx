"use client";

import { ChevronLeftIcon, ChevronRightIcon, ImagesIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { MediaImage } from "@/components/property/media-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { PropertyMedia } from "@/lib/domain/property";
import { cn } from "@/lib/utils";

type Props = { photos: PropertyMedia[]; title: string };

export function Gallery({ photos, title }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (!photos.length) {
    return <MediaImage media={null} alt="" className="aspect-16/9 w-full rounded-2xl" />;
  }

  const altOf = (m: PropertyMedia, i: number) => m.alt || `${title}, foto ${i + 1}`;
  const side = photos.slice(1, 5);

  return (
    <>
      {/* Móvil: carrusel con desplazamiento */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:hidden" aria-label="Fotos">
        {photos.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => show(i)}
            className="w-[85%] shrink-0 snap-center overflow-hidden rounded-xl"
            aria-label={`Ampliar foto ${i + 1} de ${photos.length}`}
          >
            <MediaImage
              media={m}
              alt={altOf(m, i)}
              className="aspect-4/3 w-full"
              sizes="85vw"
              width={800}
              priority={i === 0}
            />
          </button>
        ))}
      </div>

      {/* Escritorio: mosaico */}
      <div
        className="relative hidden gap-2 overflow-hidden rounded-2xl sm:grid sm:grid-cols-4 sm:grid-rows-2"
        style={{ height: "min(62vh, 560px)" }}
      >
        <button
          type="button"
          onClick={() => show(0)}
          className={cn("relative overflow-hidden", side.length ? "col-span-2 row-span-2" : "col-span-4 row-span-2")}
          aria-label={`Ampliar foto 1 de ${photos.length}`}
        >
          <MediaImage
            media={photos[0]}
            alt={altOf(photos[0], 0)}
            className="size-full"
            sizes="50vw"
            width={1600}
            priority
          />
        </button>
        {side.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => show(i + 1)}
            className={cn("relative overflow-hidden", side.length < 3 && "row-span-2")}
            aria-label={`Ampliar foto ${i + 2} de ${photos.length}`}
          >
            <MediaImage
              media={m}
              alt={altOf(m, i + 1)}
              className="size-full transition-opacity hover:opacity-90"
              sizes="25vw"
              width={800}
            />
          </button>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="absolute right-4 bottom-4 shadow-md"
          onClick={() => show(0)}
        >
          <ImagesIcon /> Ver las {photos.length} fotos
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(96vw,1200px)] border-0 bg-primary p-0 text-primary-foreground sm:max-w-[min(96vw,1200px)]">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Foto {index + 1} de {photos.length}. Usa las flechas para pasar de foto.
          </DialogDescription>
          <div className="relative flex items-center justify-center">
            <MediaImage
              key={photos[index].id}
              media={photos[index]}
              alt={altOf(photos[index], index)}
              className="max-h-[82vh] w-full object-contain"
              sizes="96vw"
              width={2000}
              priority
            />
            {photos.length > 1 && (
              <>
                <Button
                  type="button"
                  size="icon-lg"
                  variant="secondary"
                  className="absolute left-3 size-11 rounded-full"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-lg"
                  variant="secondary"
                  className="absolute right-3 size-11 rounded-full"
                  onClick={() => go(1)}
                  aria-label="Foto siguiente"
                >
                  <ChevronRightIcon />
                </Button>
              </>
            )}
          </div>
          <p className="pb-3 text-center text-sm text-primary-foreground/80" aria-live="polite">
            {index + 1} / {photos.length}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
