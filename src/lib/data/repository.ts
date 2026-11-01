import type { AuditEntry } from "@/lib/domain/audit";
import type { Lead, LeadInput } from "@/lib/domain/lead";
import type { Operation, Property, PropertyInput, PropertyStatus, PropertyType } from "@/lib/domain/property";

// Contrato de la capa de datos. Hoy: demo en el navegador.
// Mañana: Supabase. Las pantallas solo conocen esta interfaz.

export type PropertyFilter = {
  operation?: Operation;
  type?: PropertyType;
  status?: PropertyStatus[];
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  onlyPublished?: boolean;
  onlyDeleted?: boolean;
  search?: string;
  sort?: "recent" | "price_asc" | "price_desc";
};

export type MediaUpload = {
  file: Blob;
  name: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
};

export type AuditFilter = {
  entityId?: string;
  actorId?: string;
  since?: string;
  limit?: number;
};

export interface Repository {
  listProperties(filter?: PropertyFilter): Promise<Property[]>;
  getProperty(id: string): Promise<Property | null>;
  getPropertyBySlug(slug: string): Promise<Property | null>;

  createProperty(input: PropertyInput): Promise<Property>;
  updateProperty(id: string, input: Partial<PropertyInput>): Promise<Property>;
  setStatus(id: string, status: PropertyStatus): Promise<Property>;
  applyPriceDrop(id: string, newPrice: number): Promise<Property>;
  removePriceDrop(id: string): Promise<Property>;
  deleteProperty(id: string): Promise<void>; // borrado blando, va a la papelera
  restoreProperty(id: string): Promise<Property>;

  addMedia(propertyId: string, uploads: MediaUpload[]): Promise<Property>;
  removeMedia(propertyId: string, mediaId: string): Promise<Property>;
  reorderMedia(propertyId: string, orderedIds: string[]): Promise<Property>;
  // URL para mostrar el archivo (ruta pública, blob: o URL firmada).
  mediaUrl(path: string, source: Property["media"][number]["source"]): Promise<string>;

  listAudit(filter?: AuditFilter): Promise<AuditEntry[]>;

  // Mensajes del formulario de contacto. createLead es lo único que la web pública escribe.
  createLead(input: LeadInput): Promise<Lead>;
  listLeads(): Promise<Lead[]>;
  setLeadStatus(id: string, status: Lead["status"]): Promise<Lead>;

  // Avisa cuando cambian los datos (otra pestaña incluida).
  subscribe(listener: () => void): () => void;
}
