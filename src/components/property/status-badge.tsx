import { STATUS_LABELS, type PropertyStatus } from "@/lib/domain/property";
import { cn } from "@/lib/utils";

const STYLES: Record<PropertyStatus, string> = {
  disponible: "bg-status-available",
  reservado: "bg-status-reserved",
  vendido: "bg-status-sold",
  alquilado: "bg-status-sold",
};

export function StatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-white",
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
