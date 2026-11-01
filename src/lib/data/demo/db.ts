import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AuditEntry } from "@/lib/domain/audit";
import type { Property } from "@/lib/domain/property";

// Base de datos del navegador para la demo. Cada visitante tiene la suya.

export type StoredBlob = { id: string; data: ArrayBuffer; type: string };

export interface DemoSchema extends DBSchema {
  properties: { key: string; value: Property; indexes: { slug: string } };
  blobs: { key: string; value: StoredBlob };
  audit: { key: string; value: AuditEntry; indexes: { at: string } };
  meta: { key: string; value: string | number };
}

export type DemoDB = IDBPDatabase<DemoSchema>;

export const DEFAULT_DB_NAME = "portal-inmobiliario-demo";

export function openDemoDB(name = DEFAULT_DB_NAME): Promise<DemoDB> {
  return openDB<DemoSchema>(name, 1, {
    upgrade(db) {
      const properties = db.createObjectStore("properties", { keyPath: "id" });
      properties.createIndex("slug", "slug", { unique: true });
      db.createObjectStore("blobs", { keyPath: "id" });
      const audit = db.createObjectStore("audit", { keyPath: "id" });
      audit.createIndex("at", "at");
      db.createObjectStore("meta");
    },
  });
}
