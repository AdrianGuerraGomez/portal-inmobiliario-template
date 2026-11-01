import { brand } from "@/config/brand";
import { DomainError } from "./errors";
import type { PropertyMedia } from "./property";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] as const;
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

const MB = 1024 * 1024;

export type MediaKind = PropertyMedia["kind"];

export function mediaKindOf(mimeType: string): MediaKind | null {
  if ((IMAGE_TYPES as readonly string[]).includes(mimeType)) return "image";
  if ((VIDEO_TYPES as readonly string[]).includes(mimeType)) return "video";
  return null;
}

// Mismas reglas en el navegador (aviso previo) y en la capa de datos (bloqueo).
export function assertFileAllowed(file: { size: number; type: string }): MediaKind {
  const kind = mediaKindOf(file.type);
  if (!kind) {
    throw new DomainError("file_type", "Formato no admitido. Fotos: JPG, PNG, WebP o HEIC. Vídeo: MP4 o MOV.");
  }
  if (kind === "video" && !brand.modules.video) {
    throw new DomainError("module_disabled", "Los vídeos no están activados en esta web.");
  }
  const maxMB = kind === "image" ? brand.media.maxPhotoMB : brand.media.maxVideoMB;
  if (file.size > maxMB * MB) {
    const what = kind === "image" ? "Cada foto" : "El vídeo";
    throw new DomainError("file_too_large", `${what} puede pesar como máximo ${maxMB} MB.`);
  }
  return kind;
}

export function assertMediaCount(current: PropertyMedia[], adding: { image: number; video: number }) {
  const images = current.filter((m) => m.kind === "image").length + adding.image;
  const videos = current.filter((m) => m.kind === "video").length + adding.video;
  if (images > brand.media.maxPhotos) {
    throw new DomainError("media_limit", `Máximo ${brand.media.maxPhotos} fotos por inmueble.`);
  }
  if (videos > brand.media.maxVideos) {
    throw new DomainError("media_limit", `Máximo ${brand.media.maxVideos} vídeo por inmueble.`);
  }
}
