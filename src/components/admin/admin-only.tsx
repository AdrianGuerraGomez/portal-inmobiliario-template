"use client";

import { LockIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useSession } from "@/lib/data/use-session";

// Pantallas solo para administradores. En producción también lo exige el servidor.
export function AdminOnly({ children }: { children: ReactNode }) {
  const session = useSession();
  if (session === undefined) return null;
  if (session?.role !== "admin") {
    return (
      <p className="flex items-center gap-2 rounded-lg border bg-card p-6">
        <LockIcon className="size-4" aria-hidden /> Esta sección es solo para administradores.
      </p>
    );
  }
  return children;
}
