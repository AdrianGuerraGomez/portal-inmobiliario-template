// Tamaños de imagen. Las URL de Unsplash aceptan ancho por parámetro;
// las fotos locales (blob:) se sirven tal cual.

const WIDTHS = [480, 800, 1200, 1600, 2000];

function isResizable(url: string) {
  return url.startsWith("https://images.unsplash.com/");
}

export function imageSrc(url: string, width: number): string {
  if (!isResizable(url)) return url;
  return `${url}?auto=format&fit=crop&w=${width}&q=75`;
}

export function imageSrcSet(url: string, maxWidth = 2000): string | undefined {
  if (!isResizable(url)) return undefined;
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${imageSrc(url, w)} ${w}w`)
    .join(", ");
}
