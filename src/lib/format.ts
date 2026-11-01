import { brand } from "@/config/brand";
import type { Operation } from "@/lib/domain/property";

const money = new Intl.NumberFormat(brand.locale, {
  style: "currency",
  currency: brand.currency,
  maximumFractionDigits: 0,
  useGrouping: "always",
});

const number = new Intl.NumberFormat(brand.locale, { useGrouping: "always" });

export function formatPrice(price: number, operation?: Operation): string {
  return operation === "alquiler" ? `${money.format(price)}/mes` : money.format(price);
}

export function formatNumber(n: number): string {
  return number.format(n);
}

export function formatArea(m2: number): string {
  return `${number.format(m2)} m²`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

const dateTime = new Intl.DateTimeFormat(brand.locale, { dateStyle: "medium", timeStyle: "short" });
const date = new Intl.DateTimeFormat(brand.locale, { dateStyle: "medium" });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}
