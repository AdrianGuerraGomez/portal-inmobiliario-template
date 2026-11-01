import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyEditor } from "@/components/admin/property-editor";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Editar inmueble" };

// useParams lee un segmento dinámico: con Cache Components va dentro de <Suspense>.
export default function EditPropertyPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-3xl" />}>
      <PropertyEditor />
    </Suspense>
  );
}
