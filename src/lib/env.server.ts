import "server-only";
import { z } from "zod";

// Secretos. Nunca llegan al navegador: server-only rompe el build si alguien
// importa este archivo desde un componente de cliente.
const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export function serverEnv() {
  return serverSchema.parse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });
}
