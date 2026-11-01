import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

// Cliente para componentes de cliente (subida directa de fotos, etc.).
export function createClient() {
  const env = publicEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
