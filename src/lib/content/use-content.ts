"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRepoQuery, useRepository } from "@/lib/data/provider";
import { applyOverrides, contentDefaults, type SiteContent } from "./defaults";

// Vista previa: el panel la activa para ver el borrador en la web antes de publicarlo.
const PREVIEW_KEY = "portal-content-preview";
const PREVIEW_EVENT = "portal-content-preview-change";

function readPreview(): boolean {
  try {
    return window.localStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
}

export function setContentPreview(on: boolean) {
  try {
    if (on) window.localStorage.setItem(PREVIEW_KEY, "1");
    else window.localStorage.removeItem(PREVIEW_KEY);
  } catch {
    // sin almacenamiento: la vista previa no se puede activar
  }
  window.dispatchEvent(new Event(PREVIEW_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREVIEW_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREVIEW_EVENT, onChange);
  };
}

export function usePreviewMode(): boolean {
  return useSyncExternalStore(subscribe, readPreview, () => false);
}

// Contenido de la web con los cambios publicados (o el borrador en vista previa).
// Mientras carga, devuelve el contenido por defecto.
export function useSiteContent(): SiteContent {
  const preview = usePreviewMode();
  const { data } = useRepoQuery((r) => r.getContentState(), []);
  return useMemo(() => {
    if (!data) return contentDefaults;
    return applyOverrides(preview && data.draft ? data.draft : data.published);
  }, [data, preview]);
}

// Resuelve el valor de un campo de imagen (URL o imagen subida desde el panel).
export function useContentImage(value: string): string | null {
  const repo = useRepository();
  const [resolved, setResolved] = useState<{ value: string; url: string } | null>(null);
  const isRemote = /^https?:\/\//.test(value);

  useEffect(() => {
    if (isRemote) return;
    let active = true;
    repo.contentImageUrl(value).then(
      (url) => active && setResolved({ value, url }),
      () => active && setResolved(null),
    );
    return () => {
      active = false;
    };
  }, [repo, value, isRemote]);

  if (isRemote) return value;
  return resolved?.value === value ? resolved.url : null;
}
