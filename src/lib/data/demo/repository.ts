import { z } from "zod";
import { brand } from "@/config/brand";
import { diff, type Actor, type AuditAction, type AuditEntry, type FieldChange } from "@/lib/domain/audit";
import { DomainError } from "@/lib/domain/errors";
import { assertFileAllowed, assertMediaCount } from "@/lib/domain/media-rules";
import {
  CLOSED_STATUS,
  propertyInputSchema,
  type Property,
  type PropertyData,
  type PropertyInput,
  type PropertyMedia,
  type PropertyStatus,
} from "@/lib/domain/property";
import { formatReference, propertySlug, slugify } from "@/lib/domain/slug";
import type { AuditFilter, MediaUpload, PropertyFilter, Repository } from "../repository";
import { openDemoDB, type DemoDB } from "./db";
import { SEED_VERSION, seedProperties } from "./seed";

type Options = {
  getActor: () => Actor;
  dbName?: string;
};

export type DemoRepository = Repository & {
  reset(): Promise<void>;
};

const CHANNEL = "portal-inmobiliario-demo";

function parseInput(data: unknown): PropertyData {
  const result = propertyInputSchema.safeParse(data);
  if (!result.success) {
    throw new DomainError("validation", result.error.issues[0]?.message ?? "Datos no válidos");
  }
  const parsed = result.data;
  if (parsed.operation === "alquiler" && !brand.modules.rentals) {
    throw new DomainError("module_disabled", "El alquiler no está activado en esta web.");
  }
  return parsed;
}

function normalize(text: string) {
  return slugify(text).replace(/-/g, " ");
}

function inputOf(p: Property): PropertyData {
  const data = {} as Record<string, unknown>;
  for (const key of Object.keys(propertyInputSchema.shape)) {
    data[key] = p[key as keyof Property];
  }
  return data as PropertyData;
}

export function createDemoRepository({ getActor, dbName }: Options): DemoRepository {
  let dbPromise: Promise<DemoDB> | null = null;
  const listeners = new Set<() => void>();
  const objectUrls = new Map<string, string>();
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

  channel?.addEventListener("message", () => listeners.forEach((l) => l()));

  function notify() {
    listeners.forEach((l) => l());
    channel?.postMessage("change");
  }

  async function seed(db: DemoDB) {
    const tx = db.transaction(["properties", "blobs", "audit", "meta"], "readwrite");
    await Promise.all([
      tx.objectStore("properties").clear(),
      tx.objectStore("blobs").clear(),
      tx.objectStore("audit").clear(),
      tx.objectStore("meta").clear(),
    ]);
    const items = seedProperties();
    for (const p of items) await tx.objectStore("properties").put(p);
    await tx.objectStore("meta").put(items.length, "counter");
    await tx.objectStore("meta").put(SEED_VERSION, "seedVersion");
    await tx.done;
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.clear();
  }

  function db(): Promise<DemoDB> {
    dbPromise ??= openDemoDB(dbName).then(async (d) => {
      if ((await d.get("meta", "seedVersion")) !== SEED_VERSION) await seed(d);
      return d;
    });
    return dbPromise;
  }

  async function mustGet(id: string): Promise<Property> {
    const p = await (await db()).get("properties", id);
    if (!p) throw new DomainError("not_found", "Inmueble no encontrado");
    return p;
  }

  // Hora estrictamente creciente: el histórico se ordena por "at".
  let lastAt = 0;
  function nextAt() {
    lastAt = Math.max(Date.now(), lastAt + 1);
    return new Date(lastAt).toISOString();
  }

  async function audit(p: Property, action: AuditAction, changes: Record<string, FieldChange> = {}) {
    const actor = getActor();
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      at: nextAt(),
      actor: { id: actor.id, name: actor.name, role: actor.role },
      entity: "property",
      entityId: p.id,
      entityLabel: `${p.reference} · ${p.title}`,
      action,
      changes,
    };
    await (await db()).put("audit", entry);
  }

  // Guarda, registra en el histórico y avisa a la UI.
  async function save(next: Property, action: AuditAction, changes: Record<string, FieldChange>) {
    next.updatedAt = new Date().toISOString();
    next.updatedBy = getActor().id;
    await (await db()).put("properties", next);
    await audit(next, action, changes);
    notify();
    return next;
  }

  return {
    async listProperties(filter: PropertyFilter = {}) {
      const all = await (await db()).getAll("properties");
      const q = filter.search ? normalize(filter.search) : null;
      const rows = all.filter((p) => {
        if (filter.onlyDeleted ? !p.deletedAt : p.deletedAt) return false;
        if (filter.onlyPublished && !p.published) return false;
        if (filter.operation && p.operation !== filter.operation) return false;
        if (filter.type && p.type !== filter.type) return false;
        if (filter.status?.length && !filter.status.includes(p.status)) return false;
        if (filter.zone && normalize(p.zone) !== normalize(filter.zone)) return false;
        if (filter.minPrice != null && p.price < filter.minPrice) return false;
        if (filter.maxPrice != null && p.price > filter.maxPrice) return false;
        if (filter.minBedrooms != null && p.bedrooms < filter.minBedrooms) return false;
        if (q && !normalize(`${p.reference} ${p.title} ${p.zone} ${p.city}`).includes(q)) return false;
        return true;
      });
      const sort = filter.sort ?? "recent";
      return rows.sort((a, b) =>
        sort === "price_asc"
          ? a.price - b.price
          : sort === "price_desc"
            ? b.price - a.price
            : b.createdAt.localeCompare(a.createdAt),
      );
    },

    async getProperty(id) {
      return (await (await db()).get("properties", id)) ?? null;
    },

    async getPropertyBySlug(slug) {
      const p = await (await db()).getFromIndex("properties", "slug", slug);
      return p && !p.deletedAt ? p : null;
    },

    async createProperty(input: PropertyInput) {
      const data = parseInput(input);
      const d = await db();
      const counter = Number((await d.get("meta", "counter")) ?? 0) + 1;
      await d.put("meta", counter, "counter");
      const reference = formatReference(brand.referencePrefix, counter);
      const now = new Date().toISOString();
      const p: Property = {
        ...data,
        id: crypto.randomUUID(),
        reference,
        slug: propertySlug(data.title, reference),
        status: "disponible",
        previousPrice: null,
        priceReducedAt: null,
        priceHistory: [],
        closedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
        updatedBy: null,
        media: [],
      };
      return save(p, "create", {});
    },

    async updateProperty(id, input) {
      const current = await mustGet(id);
      const data = parseInput({ ...inputOf(current), ...input });
      const next: Property = { ...current, ...data };

      if (data.title !== current.title) next.slug = propertySlug(data.title, current.reference);
      if (data.price !== current.price) {
        next.priceHistory = [
          ...current.priceHistory,
          { at: new Date().toISOString(), from: current.price, to: data.price },
        ];
        // Si sube por encima del precio anterior, ya no es rebaja.
        if (current.previousPrice && data.price >= current.previousPrice) {
          next.previousPrice = null;
          next.priceReducedAt = null;
        }
      }
      // Un vendido que pasa a alquiler queda alquilado, y al revés.
      if (data.operation !== current.operation && current.status === CLOSED_STATUS[current.operation]) {
        next.status = CLOSED_STATUS[data.operation];
      }
      return save(next, "update", diff(current, next));
    },

    async setStatus(id, status: PropertyStatus) {
      const current = await mustGet(id);
      const closed = status === "vendido" || status === "alquilado";
      if (closed && status !== CLOSED_STATUS[current.operation]) {
        throw new DomainError(
          "validation",
          current.operation === "venta"
            ? "Un inmueble en venta se marca como vendido."
            : "Un inmueble en alquiler se marca como alquilado.",
        );
      }
      if (status === current.status) return current;
      const next: Property = { ...current, status, closedAt: closed ? new Date().toISOString() : null };
      return save(next, "status", diff(current, { status }));
    },

    async applyPriceDrop(id, newPrice) {
      const current = await mustGet(id);
      if (!z.number().int().positive().safeParse(newPrice).success || newPrice >= current.price) {
        throw new DomainError("invalid_price_drop", "El nuevo precio debe ser menor que el actual.");
      }
      const at = new Date().toISOString();
      const next: Property = {
        ...current,
        price: newPrice,
        previousPrice: current.price,
        priceReducedAt: at,
        priceHistory: [...current.priceHistory, { at, from: current.price, to: newPrice }],
      };
      return save(next, "price_drop", diff(current, { price: newPrice, previousPrice: current.price }));
    },

    // Deja el precio actual y deja de mostrar el tachado.
    async removePriceDrop(id) {
      const current = await mustGet(id);
      if (!current.previousPrice) throw new DomainError("validation", "Este inmueble no tiene rebaja.");
      const next: Property = { ...current, previousPrice: null, priceReducedAt: null };
      return save(next, "price_drop_removed", diff(current, { previousPrice: null }));
    },

    async deleteProperty(id) {
      const current = await mustGet(id);
      if (current.deletedAt) return;
      await save({ ...current, deletedAt: new Date().toISOString() }, "delete", {});
    },

    async restoreProperty(id) {
      const current = await mustGet(id);
      return save({ ...current, deletedAt: null }, "restore", {});
    },

    async addMedia(propertyId, uploads: MediaUpload[]) {
      const current = await mustGet(propertyId);
      const kinds = uploads.map((u) => assertFileAllowed({ size: u.file.size, type: u.file.type }));
      assertMediaCount(current.media, {
        image: kinds.filter((k) => k === "image").length,
        video: kinds.filter((k) => k === "video").length,
      });

      const d = await db();
      const added: PropertyMedia[] = [];
      for (const [i, u] of uploads.entries()) {
        const id = crypto.randomUUID();
        await d.put("blobs", { id, data: await u.file.arrayBuffer(), type: u.file.type });
        added.push({
          id,
          kind: kinds[i],
          source: "local",
          path: id,
          position: current.media.length + i,
          alt: u.alt ?? "",
          width: u.width ?? null,
          height: u.height ?? null,
          sizeBytes: u.file.size,
          mimeType: u.file.type,
        });
      }
      const next: Property = { ...current, media: [...current.media, ...added] };
      return save(next, "media_add", { media: { from: current.media.length, to: next.media.length } });
    },

    async removeMedia(propertyId, mediaId) {
      const current = await mustGet(propertyId);
      const target = current.media.find((m) => m.id === mediaId);
      if (!target) throw new DomainError("not_found", "Archivo no encontrado");
      if (target.source === "local") {
        await (await db()).delete("blobs", target.path);
        const url = objectUrls.get(target.path);
        if (url) URL.revokeObjectURL(url);
        objectUrls.delete(target.path);
      }
      const media = current.media
        .filter((m) => m.id !== mediaId)
        .sort((a, b) => a.position - b.position)
        .map((m, position) => ({ ...m, position }));
      return save({ ...current, media }, "media_remove", { media: { from: current.media.length, to: media.length } });
    },

    async reorderMedia(propertyId, orderedIds) {
      const current = await mustGet(propertyId);
      const ids = new Set(current.media.map((m) => m.id));
      if (orderedIds.length !== ids.size || !orderedIds.every((id) => ids.has(id))) {
        throw new DomainError("validation", "El orden no coincide con los archivos del inmueble.");
      }
      const media = orderedIds.map((id, position) => ({ ...current.media.find((m) => m.id === id)!, position }));
      return save({ ...current, media }, "media_reorder", {});
    },

    async mediaUrl(path, source) {
      if (source === "static") return path;
      if (source !== "local") throw new DomainError("validation", "Origen de archivo no disponible en la demo.");
      const cached = objectUrls.get(path);
      if (cached) return cached;
      const blob = await (await db()).get("blobs", path);
      if (!blob) throw new DomainError("not_found", "Archivo no encontrado");
      const url = URL.createObjectURL(new Blob([blob.data], { type: blob.type }));
      objectUrls.set(path, url);
      return url;
    },

    async listAudit(filter: AuditFilter = {}) {
      const all = await (await db()).getAllFromIndex("audit", "at");
      return all
        .reverse()
        .filter(
          (e) =>
            (!filter.entityId || e.entityId === filter.entityId) &&
            (!filter.actorId || e.actor.id === filter.actorId) &&
            (!filter.since || e.at >= filter.since),
        )
        .slice(0, filter.limit ?? 200);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async reset() {
      const d = await db();
      await seed(d);
      const actor = getActor();
      await d.put("audit", {
        id: crypto.randomUUID(),
        at: nextAt(),
        actor: { id: actor.id, name: actor.name, role: actor.role },
        entity: "system",
        entityId: "demo",
        entityLabel: "Demo",
        action: "reset",
        changes: {},
      });
      notify();
    },
  };
}
