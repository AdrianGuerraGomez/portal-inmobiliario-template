"use client";

import {
  BadgePercentIcon,
  CircleDotIcon,
  EyeIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRepository } from "@/lib/data/provider";
import { useAction } from "@/lib/data/use-action";
import { CLOSED_STATUS, STATUS_LABELS, type Property, type PropertyStatus } from "@/lib/domain/property";
import { PriceDropDialog } from "./price-drop-dialog";

type Props = {
  property: Property;
  // "row": botón de icono en el listado. "toolbar": botón con texto en la ficha.
  variant?: "row" | "toolbar";
  showEdit?: boolean;
};

export function PropertyActions({ property, variant = "row", showEdit = true }: Props) {
  const repo = useRepository();
  const router = useRouter();
  const { run } = useAction();
  const [dropOpen, setDropOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const statuses: PropertyStatus[] = ["disponible", "reservado", CLOSED_STATUS[property.operation]];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === "row" ? (
            <Button variant="ghost" size="icon-lg" aria-label={`Acciones de ${property.reference}`}>
              <MoreHorizontalIcon />
            </Button>
          ) : (
            <Button variant="outline" size="lg">
              <MoreHorizontalIcon /> Acciones
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {showEdit && (
            <DropdownMenuItem asChild>
              <Link href={`/admin/inmuebles/${property.id}`}>
                <PencilIcon /> Editar
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CircleDotIcon /> Estado: {STATUS_LABELS[property.status]}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={property.status}
                onValueChange={(s) =>
                  run(
                    () => repo.setStatus(property.id, s as PropertyStatus),
                    `${property.reference} marcado como ${STATUS_LABELS[s as PropertyStatus].toLowerCase()}`,
                  )
                }
              >
                {statuses.map((s) => (
                  <DropdownMenuRadioItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onSelect={() => setDropOpen(true)}>
            <BadgePercentIcon /> Rebajar precio
          </DropdownMenuItem>
          {property.previousPrice && (
            <DropdownMenuItem onSelect={() => run(() => repo.removePriceDrop(property.id), "Rebaja quitada")}>
              <Undo2Icon /> Quitar rebaja
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() =>
              run(
                () => repo.updateProperty(property.id, { published: !property.published }),
                property.published ? "Oculto en la web" : "Publicado en la web",
              )
            }
          >
            {property.published ? (
              <>
                <EyeOffIcon /> Ocultar de la web
              </>
            ) : (
              <>
                <EyeIcon /> Publicar en la web
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2Icon /> Borrar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PriceDropDialog property={property} open={dropOpen} onOpenChange={setDropOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar {property.reference}?</AlertDialogTitle>
            <AlertDialogDescription>
              Deja de verse en la web y pasa a la papelera. Desde allí se puede restaurar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                await run(() => repo.deleteProperty(property.id), `${property.reference} enviado a la papelera`);
                if (variant === "toolbar") router.push("/admin/inmuebles");
              }}
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
