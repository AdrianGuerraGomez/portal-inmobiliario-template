"use client";

import { ArrowRightIcon, ShieldCheckIcon, UserPenIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { brand } from "@/config/brand";
import { DEMO_USERS, signInDemo } from "@/lib/data/demo/session";
import { useSession } from "@/lib/data/use-session";
import { ROLE_LABELS } from "@/lib/domain/audit";

const ROLE_HINTS = {
  admin: "Todo el panel, incluidos usuarios y ajustes.",
  editor: "Inmuebles y contenido de la web.",
} as const;

export function DemoLogin() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) router.replace("/admin/inmuebles");
  }, [session, router]);

  function enter(id: string) {
    signInDemo(id);
    router.replace("/admin/inmuebles");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-muted px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{brand.name}</p>
          <CardTitle className="font-heading text-2xl">Entrar al panel</CardTitle>
          <CardDescription>
            Versión de demostración: elige un usuario. En la versión final se entra con email, contraseña y código de
            verificación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {DEMO_USERS.map((u) => {
              const Icon = u.role === "admin" ? ShieldCheckIcon : UserPenIcon;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => enter(u.id)}
                    className="group flex min-h-16 w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {u.name} <span className="font-normal text-muted-foreground">· {ROLE_LABELS[u.role]}</span>
                      </span>
                      <span className="block text-sm text-muted-foreground">{ROLE_HINTS[u.role]}</span>
                    </span>
                    <ArrowRightIcon
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
