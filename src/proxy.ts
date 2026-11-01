import { NextResponse, type NextRequest } from "next/server";
import { isDemo } from "@/config/runtime";
import { updateSession } from "@/lib/supabase/proxy";

// Solo corre en el panel. La web pública queda estática y sin sesión.
// En modo demo no hay Supabase: el login falso se resuelve en el navegador.
export async function proxy(request: NextRequest) {
  if (isDemo) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
