import type { Metadata } from "next";
import { LISTING_META, ListingPage } from "@/components/site/listing-page";

export const metadata: Metadata = LISTING_META.venta;

export default function SalePage({ searchParams }: PageProps<"/venta">) {
  return <ListingPage operation="venta" searchParams={searchParams} />;
}
