export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

// La referencia va al final para que el slug sea único aunque cambie el título.
export function propertySlug(title: string, reference: string): string {
  return `${slugify(title)}-${slugify(reference)}`;
}

export function formatReference(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}
