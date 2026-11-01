"use client";

import { HouseIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRepository } from "@/lib/data/provider";
import type { PropertyMedia } from "@/lib/domain/property";
import { cn } from "@/lib/utils";

export function useMediaUrl(media: Pick<PropertyMedia, "path" | "source"> | null) {
  const repo = useRepository();
  const [url, setUrl] = useState<string | null>(null);
  const path = media?.path;
  const source = media?.source;

  useEffect(() => {
    let active = true;
    if (!path || !source) return;
    repo.mediaUrl(path, source).then(
      (u) => active && setUrl(u),
      () => active && setUrl(null),
    );
    return () => {
      active = false;
    };
  }, [repo, path, source]);

  return path ? url : null;
}

type Props = {
  media: PropertyMedia | null;
  alt: string;
  className?: string;
};

// Imagen guardada en la capa de datos. Sin foto, muestra un hueco neutro.
export function MediaImage({ media, alt, className }: Props) {
  const url = useMediaUrl(media);
  if (!media || !url) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <HouseIcon className="size-1/3 max-h-10 max-w-10" aria-hidden />
        <span className="sr-only">{media ? "Cargando foto" : "Sin foto"}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- blob: locales, next/image no aplica
  return <img src={url} alt={alt} className={cn("object-cover", className)} loading="lazy" decoding="async" />;
}
