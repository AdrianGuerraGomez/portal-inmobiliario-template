import { priceDropPercent, type Property } from "@/lib/domain/property";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  property: Pick<Property, "price" | "previousPrice" | "operation">;
  className?: string;
  size?: "sm" | "lg";
};

export function PriceTag({ property, className, size = "sm" }: Props) {
  const drop = priceDropPercent(property);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-semibold tabular-nums", size === "lg" ? "text-2xl" : "text-sm")}>
        {formatPrice(property.price, property.operation)}
      </span>
      {drop && property.previousPrice && (
        <>
          <span className="text-xs text-muted-foreground tabular-nums line-through">
            <span className="sr-only">Antes </span>
            {formatPrice(property.previousPrice, property.operation)}
          </span>
          <span className="text-xs font-semibold text-price-drop">−{drop} %</span>
        </>
      )}
    </span>
  );
}
