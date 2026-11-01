import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Solo corre en el panel. La web pública queda estática y sin sesión.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
