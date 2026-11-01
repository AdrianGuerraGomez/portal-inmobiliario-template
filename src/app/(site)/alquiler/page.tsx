import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LISTING_META, ListingPage } from "@/components/site/listing-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = LISTING_META.alquiler;

export default function RentPage({ searchParams }: PageProps<"/alquiler">) {
  if (!brand.modules.rentals) notFound();
  return <ListingPage operation="alquiler" searchParams={searchParams} />;
}
