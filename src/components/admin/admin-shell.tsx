"use client";

import {
  Building2Icon,
  ChevronDownIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  HouseIcon,
  HistoryIcon,
  InboxIcon,
  LogOutIcon,
  MenuIcon,
  PanelsTopLeftIcon,
  RotateCcwIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { brand } from "@/config/brand";
import { isDemo } from "@/config/runtime";
import { DEMO_USERS, signInDemo, signOutDemo } from "@/lib/data/demo/session";
import { useDemoRepository } from "@/lib/data/provider";
import { useSession } from "@/lib/data/use-session";
import { ROLE_LABELS } from "@/lib/domain/audit";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: typeof Building2Icon; adminOnly?: boolean }[] = [
  { href: "/admin/inmuebles", label: "Inmuebles", icon: Building2Icon },
  { href: "/admin/contactos", label: "Contactos", icon: InboxIcon },
  { href: "/admin/contenido", label: "Contenido web", icon: PanelsTopLeftIcon },
  { href: "/admin/actividad", label: "Actividad", icon: HistoryIcon, adminOnly: true },
  { href: "/admin/resumen", label: "Resumen", icon: ClipboardListIcon, adminOnly: true },
  { href: "/admin/papelera", label: "Papelera", icon: Trash2Icon },
];

function NavLinks({
  onNavigate,
  vertical,
  isAdmin,
}: {
  onNavigate?: () => void;
  vertical?: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className={cn("flex gap-1", vertical && "flex-col")}>
      {NAV.filter((n) => !n.adminOnly || isAdmin).map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const repo = useDemoRepository();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (session === null) router.replace("/admin/login");
  }, [session, router]);

  // El contenido se pinta siempre (Next valida así la navegación instantánea).
  // En demo no hay nada que proteger; en producción lo protege el servidor.
  const other = session ? DEMO_USERS.find((u) => u.id !== session.id)! : null;

  async function reset() {
    await repo.reset();
    toast.success("Demo reiniciada con los inmuebles de ejemplo.");
    router.push("/admin/inmuebles");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted">
      {isDemo && (
        <p className="bg-secondary px-4 py-1.5 text-center text-xs text-secondary-foreground">
          Modo demo<span className="max-sm:hidden"> · Los cambios se guardan solo en este navegador</span>
        </p>
      )}
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Abrir menú">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>{brand.name}</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <Suspense>
                  <NavLinks vertical isAdmin={session?.role === "admin"} onNavigate={() => setMenuOpen(false)} />
                </Suspense>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/admin/inmuebles"
            aria-label={`${brand.name}: inicio del panel`}
            title={brand.name}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <HouseIcon className="size-5" aria-hidden />
          </Link>

          <div className="hidden min-w-0 lg:block">
            <Suspense>
              <NavLinks isAdmin={session?.role === "admin"} />
            </Suspense>
          </div>

          <Button asChild variant="ghost" size="lg" className="ml-auto hidden shrink-0 sm:inline-flex">
            <Link href="/" target="_blank" aria-label="Ver web" title="Ver web">
              <ExternalLinkIcon /> <span className="hidden xl:inline">Ver web</span>
            </Link>
          </Button>
          <div className="shrink-0 max-sm:ml-auto">
            {!session || !other ? (
              <Skeleton className="h-9 w-16 rounded-full xl:w-40" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="lg" className="gap-2" aria-label={`Cuenta de ${session.name}`}>
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {session.name.charAt(0)}
                    </span>
                    <span className="hidden whitespace-nowrap xl:inline">{session.name}</span>
                    <ChevronDownIcon className="text-muted-foreground" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <span className="block">{session.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {ROLE_LABELS[session.role]} · {session.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isDemo && (
                    <>
                      <DropdownMenuItem onSelect={() => signInDemo(other.id)}>
                        <UsersIcon /> Cambiar a {other.name}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setConfirmReset(true)}>
                        <RotateCcwIcon /> Reiniciar demo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onSelect={() => {
                      signOutDemo();
                      router.replace("/admin/login");
                    }}
                  >
                    <LogOutIcon /> Salir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reiniciar la demo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran los inmuebles, fotos e histórico creados en este navegador y vuelven los de ejemplo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={reset}>Reiniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
