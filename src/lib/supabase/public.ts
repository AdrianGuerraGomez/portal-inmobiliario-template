import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

// Cliente anónimo y sin cookies para la web pública.
// Al no leer la petición, sus consultas se pueden cachear con "use cache".
// RLS limita lo que ve: solo inmuebles publicados.
export function createPublicClient() {
  const env = publicEnv();
  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
