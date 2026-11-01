"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import L from "leaflet";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MediaImage } from "@/components/property/media-image";
import { PriceTag } from "@/components/property/price-tag";
import { StatusBadge } from "@/components/property/status-badge";
import { brand } from "@/config/brand";
import { coverImage, TYPE_LABELS, type Property } from "@/lib/domain/property";
import { formatPrice } from "@/lib/format";
import { MAP_TILES } from "@/lib/map/tiles";

type Located = Property & { location: { lat: number; lng: number } };

// Marcador con el precio. Clases de tema: Tailwind las encuentra en este archivo.
function priceIcon(p: Located) {
  const reserved = p.status === "reservado";
  const bg = reserved ? "bg-status-reserved" : "bg-primary";
  const text = reserved ? "text-white" : "text-primary-foreground";
  return L.divIcon({
    className: "group",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -34],
    html: `<span class="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
      <span class="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap shadow-md ring-2 ring-white transition-transform group-hover:scale-110 ${bg} ${text}">${formatPrice(p.price, p.operation)}</span>
      <span class="-mt-1 size-2.5 rotate-45 ${bg}"></span>
    </span>`,
  });
}

// Varios inmuebles muy juntos se agrupan en un círculo con el número.
function clusterIcon(cluster: L.MarkerCluster) {
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<span class="absolute -left-5 -top-5 flex size-10 items-center justify-center rounded-full bg-cta text-sm font-bold text-cta-foreground shadow-md ring-4 ring-white/80">${cluster.getChildCount()}</span>`,
  });
}

// Encuadra todos los inmuebles visibles. Se repite si el mapa cambia de tamaño
// (al cargar, al girar el móvil), porque Leaflet calcula con el tamaño del momento.
function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 });
      else if (points.length === 1) map.setView(points[0], 14);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key resume los puntos
  }, [map, key]);
  return null;
}

export default function PropertiesMap({ properties }: { properties: Located[] }) {
  const points = properties.map((p) => [p.location.lat, p.location.lng] as [number, number]);
  return (
    <MapContainer
      center={[brand.map.lat, brand.map.lng]}
      zoom={brand.map.zoom}
      scrollWheelZoom={false}
      className="size-full"
      aria-label="Mapa de inmuebles"
    >
      <TileLayer url={MAP_TILES.url} attribution={MAP_TILES.attribution} maxZoom={MAP_TILES.maxZoom} />
      <FitToMarkers points={points} />
      <MarkerClusterGroup
        iconCreateFunction={clusterIcon}
        showCoverageOnHover={false}
        maxClusterRadius={56}
        spiderfyOnMaxZoom
      >
        {properties.map((p) => {
          const cover = coverImage(p);
          return (
            <Marker
              key={p.id}
              position={[p.location.lat, p.location.lng]}
              icon={priceIcon(p)}
              title={`${p.title}, ${formatPrice(p.price, p.operation)}`}
              alt={p.title}
            >
              <Popup minWidth={240} maxWidth={260}>
                <div className="w-60 space-y-2 font-sans text-foreground">
                  <Link href={`/inmueble/${p.slug}`} className="block overflow-hidden rounded-md">
                    <MediaImage media={cover} alt={cover?.alt || p.title} className="aspect-4/3 w-full" sizes="240px" />
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {p.status !== "disponible" && <StatusBadge status={p.status} />}
                    <span>
                      {TYPE_LABELS[p.type]} · {p.zone}
                    </span>
                  </div>
                  <Link
                    href={`/inmueble/${p.slug}`}
                    className="block text-sm leading-snug font-semibold hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div>
                    <PriceTag property={p} />
                  </div>
                  <Link
                    href={`/inmueble/${p.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                  >
                    <span className="text-primary">Ver inmueble</span>
                    <ArrowRightIcon className="size-3 text-primary" aria-hidden />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
