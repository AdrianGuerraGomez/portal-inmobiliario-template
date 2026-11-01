import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PropertyForm } from "@/components/admin/property-form";

export const metadata: Metadata = { title: "Nuevo inmueble" };

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/inmuebles"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden /> Inmuebles
        </Link>
        <h1 className="text-2xl font-semibold sm:text-3xl">Nuevo inmueble</h1>
        <p className="text-sm text-muted-foreground">Después de crearlo podrás añadir las fotos y el vídeo.</p>
      </div>
      <PropertyForm />
    </div>
  );
}
