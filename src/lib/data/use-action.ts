"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DomainError } from "@/lib/domain/errors";

// Ejecuta una mutación, enseña el resultado en un aviso y evita dobles clics.
export function useAction() {
  const [pending, setPending] = useState(false);

  const run = useCallback(async <T>(fn: () => Promise<T>, success?: string): Promise<T | undefined> => {
    setPending(true);
    try {
      const result = await fn();
      if (success) toast.success(success);
      return result;
    } catch (error) {
      toast.error(error instanceof DomainError ? error.message : "Algo ha fallado. Inténtalo de nuevo.");
      if (!(error instanceof DomainError)) console.error(error);
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  return { run, pending };
}
