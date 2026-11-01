import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AuditEntry } from "@/lib/domain/audit";
import type { Lead } from "@/lib/domain/lead";
import type { Property } from "@/lib/domain/property";

// Base de datos del navegador para la demo. Cada visitante tiene la suya.

export type StoredBlob = { id: string; data: ArrayBuffer; type: string };

export interface DemoSchema extends DBSchema {
  properties: { key: string; value: Property; indexes: { slug: string } };
  blobs: { key: string; value: StoredBlob };
  audit: { key: string; value: AuditEntry; indexes: { at: string } };
  leads: { key: string; value: Lead; indexes: { createdAt: string } };
  meta: { key: string; value: string | number };
}

export type DemoDB = IDBPDatabase<DemoSchema>;

export const DEFAULT_DB_NAME = "portal-inmobiliario-demo";

export function openDemoDB(name = DEFAULT_DB_NAME): Promise<DemoDB> {
  return openDB<DemoSchema>(name, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const properties = db.createObjectStore("properties", { keyPath: "id" });
        properties.createIndex("slug", "slug", { unique: true });
        db.createObjectStore("blobs", { keyPath: "id" });
        const audit = db.createObjectStore("audit", { keyPath: "id" });
        audit.createIndex("at", "at");
        db.createObjectStore("meta");
      }
      if (oldVersion < 2) {
        const leads = db.createObjectStore("leads", { keyPath: "id" });
        leads.createIndex("createdAt", "createdAt");
      }
    },
  });
}
