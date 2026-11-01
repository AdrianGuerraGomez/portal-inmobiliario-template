// Histórico de cambios: quién, cuándo, qué y el antes/después.

export type Role = "admin" | "editor";

export type Actor = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "status"
  | "price_drop"
  | "price_drop_removed"
  | "media_add"
  | "media_remove"
  | "media_reorder"
  | "reset";

export type FieldChange = { from: unknown; to: unknown };

export type AuditEntry = {
  id: string;
  at: string;
  actor: Pick<Actor, "id" | "name" | "role">;
  entity: "property" | "content" | "system";
  entityId: string;
  entityLabel: string;
  action: AuditAction;
  changes: Record<string, FieldChange>;
};

export const ACTION_LABELS: Record<AuditAction, string> = {
  create: "Creó",
  update: "Editó",
  delete: "Borró",
  restore: "Restauró",
  status: "Cambió estado",
  price_drop: "Rebajó precio",
  price_drop_removed: "Quitó rebaja",
  media_add: "Añadió archivos",
  media_remove: "Quitó archivos",
  media_reorder: "Reordenó fotos",
  reset: "Reinició la demo",
};

// Solo los campos que cambian. Compara por valor (arrays y objetos incluidos).
export function diff<T extends object>(before: T, after: Partial<T>): Record<string, FieldChange> {
  const changes: Record<string, FieldChange> = {};
  for (const key of Object.keys(after) as (keyof T)[]) {
    const from = before[key];
    const to = after[key];
    if (to === undefined) continue;
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[key as string] = { from, to };
    }
  }
  return changes;
}
