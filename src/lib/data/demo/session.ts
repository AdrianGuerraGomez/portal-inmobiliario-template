import type { Actor } from "@/lib/domain/audit";

// Login falso de la demo. Sin contraseñas: se elige usuario y listo.
// En producción esto lo sustituye Supabase Auth.

export const DEMO_USERS: Actor[] = [
  { id: "demo-admin", name: "Laura Martín", email: "admin@demo.local", role: "admin" },
  { id: "demo-editor", name: "Carlos Ruiz", email: "editor@demo.local", role: "editor" },
];

const KEY = "portal-demo-session";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function getDemoUser(): Actor | null {
  try {
    const id = storage()?.getItem(KEY);
    return DEMO_USERS.find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

export function signInDemo(userId: string): Actor {
  const user = DEMO_USERS.find((u) => u.id === userId);
  if (!user) throw new Error("Usuario de demo no válido");
  try {
    storage()?.setItem(KEY, user.id);
  } catch {
    // Sin almacenamiento (modo privado): la sesión dura lo que la pestaña.
  }
  return user;
}

export function signOutDemo() {
  try {
    storage()?.removeItem(KEY);
  } catch {
    // nada que limpiar
  }
}

// Actor para el histórico. Sin sesión (web pública) no se escribe nada,
// pero por si acaso se atribuye al admin.
export function currentActor(): Actor {
  return getDemoUser() ?? DEMO_USERS[0];
}
