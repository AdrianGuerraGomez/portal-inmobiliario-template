import { DomainError } from "@/lib/domain/errors";

// Prepara una foto antes de guardarla:
// HEIC (iPhone) → JPG, máx. 2000 px, WebP ~600 KB y sin EXIF (quita el GPS).

const MAX_SIDE = 2000;
const TARGET_MB = 0.6;

// Chrome deja file.type vacío en los HEIC: se deduce por la extensión.
export function normalizedType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "heic" || ext === "heif") return `image/${ext}`;
  if (ext === "mov") return "video/quicktime";
  return "";
}

async function heicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  try {
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(out) ? out[0] : out;
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
  } catch {
    throw new DomainError("file_type", `No se pudo convertir ${file.name}. Prueba a exportarla como JPG.`);
  }
}

export type ProcessedImage = { file: File; width: number; height: number };

export async function processImage(original: File): Promise<ProcessedImage> {
  const type = normalizedType(original);
  const source = type === "image/heic" || type === "image/heif" ? await heicToJpeg(original) : original;

  const { default: imageCompression } = await import("browser-image-compression");
  const compressed = await imageCompression(source, {
    maxWidthOrHeight: MAX_SIDE,
    maxSizeMB: TARGET_MB,
    fileType: "image/webp",
    initialQuality: 0.82,
    // Sin worker: la librería lo descargaría de un CDN externo.
    useWebWorker: false,
  });

  const bitmap = await createImageBitmap(compressed);
  const result = {
    file: new File([compressed], original.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" }),
    width: bitmap.width,
    height: bitmap.height,
  };
  bitmap.close();
  return result;
}
