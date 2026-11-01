import { siFacebook, siInstagram, type SimpleIcon } from "simple-icons";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

// Iconos de marca de Simple Icons (licencia CC0). Lucide ya no incluye logos de marcas.
const NETWORKS: { key: keyof typeof brand.contact.social; label: string; icon: SimpleIcon }[] = [
  { key: "facebook", label: "Facebook", icon: siFacebook },
  { key: "instagram", label: "Instagram", icon: siInstagram },
];

export function SocialLinks({ className }: { className?: string }) {
  const links = NETWORKS.filter((n) => brand.contact.social[n.key]);
  if (!links.length) return null;
  return (
    <ul className={cn("flex gap-3", className)}>
      {links.map((n) => (
        <li key={n.key}>
          <a
            href={brand.contact.social[n.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${brand.name} en ${n.label}`}
            className="flex size-11 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-cta hover:text-cta-foreground focus-visible:ring-3 focus-visible:ring-cta/60 focus-visible:outline-none"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d={n.icon.path} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
