import type { Metadata } from "next";
import { PropertyList } from "@/components/admin/property-list";

export const metadata: Metadata = { title: "Inmuebles" };

export default function PropertiesPage() {
  return <PropertyList />;
}
