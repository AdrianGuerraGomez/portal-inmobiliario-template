"use client";

import { useSyncExternalStore } from "react";
import type { Actor } from "@/lib/domain/audit";
import { DEMO_USERS, getDemoUser, SESSION_EVENT } from "./demo/session";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SESSION_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SESSION_EVENT, onChange);
  };
}

const LOADING = "__loading__";

// undefined = aún no se sabe (servidor / primer render), null = sin sesión.
export function useSession(): Actor | null | undefined {
  const id = useSyncExternalStore(
    subscribe,
    () => getDemoUser()?.id ?? null,
    () => LOADING,
  );
  if (id === LOADING) return undefined;
  return DEMO_USERS.find((u) => u.id === id) ?? null;
}
