"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { brand } from "@/config/brand";
import { MAP_TILES } from "@/lib/map/tiles";

export type LatLng = { lat: number; lng: number };

// Punto simple con clases de tema (sin imágenes de marcador de Leaflet).
const pin = L.divIcon({
  className: "",
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  html: `<span class="absolute -left-3 -top-3 block size-6 rounded-full border-4 border-white bg-cta shadow-lg"></span>`,
});

const round = (n: number) => Math.round(n * 10000) / 10000; // ~10 m: no hace falta más precisión

function ClickToPlace({ onChange }: { onChange: (v: LatLng) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) }) });
  return null;
}

export default function LocationPickerMap({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
}) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : [brand.map.lat, brand.map.lng]}
      zoom={value ? 15 : brand.map.zoom}
      scrollWheelZoom
      className="size-full cursor-crosshair"
    >
      <TileLayer url={MAP_TILES.url} attribution={MAP_TILES.attribution} maxZoom={MAP_TILES.maxZoom} />
      <ClickToPlace onChange={onChange} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pin}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onChange({ lat: round(p.lat), lng: round(p.lng) });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
