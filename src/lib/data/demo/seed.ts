import { brand } from "@/config/brand";
import type { AuditEntry } from "@/lib/domain/audit";
import type { Lead } from "@/lib/domain/lead";
import { propertyInputSchema, type Property, type PropertyInput, type PropertyStatus } from "@/lib/domain/property";
import { formatReference, propertySlug } from "@/lib/domain/slug";

// Inmuebles de ejemplo. Sube SEED_VERSION al cambiarlos: el navegador
// borra los datos de demo viejos y carga estos.
export const SEED_VERSION = 4;

type SeedItem = {
  input: PropertyInput;
  status?: PropertyStatus;
  previousPrice?: number;
  daysAgo: number;
};

// Fotos de Unsplash (licencia libre, uso comercial permitido). Mismo orden que `items`.
const UNSPLASH = "https://images.unsplash.com/photo-";
const photos: string[][] = [
  [
    "1493246318656-5bfd4cfb29b8",
    "1502672260266-1c1ef2d93688",
    "1556911220-bff31c812dba",
    "1616594039964-ae9021a400a0",
    "1584622650111-993a426fbf0a",
  ],
  [
    "1514895413746-feb3d266273d",
    "1522708323590-d24dbb6b0267",
    "1484154218962-a197022b5858",
    "1505693416388-ac5ce068fe85",
    "1631889993959-41b4e9c6e3c5",
  ],
  [
    "1613977257365-aaae5a9817ff",
    "1613490493576-7fde63acd811",
    "1600596542815-ffad4c1539a9",
    "1617228069096-4638a7ffc906",
    "1616486029423-aaa4789e8c9a",
    "1620626011761-996317b8d101",
  ],
  [
    "1583847268964-b28dc8f51f92",
    "1600489000022-c2086d79f9d4",
    "1615874959474-d609969a20ed",
    "1507652313519-d4e9174996dd",
  ],
  ["1570129477492-45c003edd2be", "1560448204-e02f11c3d0e2", "1522771739844-6a9f6d5f14af"],
  ["1560185893-a55cbc8c57e8", "1586023492125-27b2c045efd7", "1612320648993-61c1cd604b71"],
  ["1731611538351-722bb062ec0e", "1582570705862-93fdac879b4a"],
  [
    "1564078516393-cf04bd966897",
    "1585128792020-803d29415281",
    "1565538810643-b5bdb714032a",
    "1757417983938-2c2a931d41aa",
    "1661107259637-4e1c55462428",
  ],
];

export const HERO_IMAGE = `${UNSPLASH}1580587771525-78b9dba3b914`;

const items: SeedItem[] = [
  {
    daysAgo: 2,
    input: {
      title: "Ático con terraza de 40 m² en el centro",
      description:
        "Ático luminoso de 3 dormitorios y 2 baños, reformado en 2023. Terraza de 40 m² con vistas despejadas, cocina equipada, calefacción individual y plaza de garaje incluida. A dos minutos de la Plaza Mayor.",
      operation: "venta",
      type: "atico",
      price: 289000,
      builtArea: 118,
      usableArea: 102,
      bedrooms: 3,
      bathrooms: 2,
      floor: "5º",
      features: ["ascensor", "garaje", "terraza", "calefaccion", "aire_acondicionado", "exterior"],
      energyRating: "C",
      zone: "Centro",
      city: "Guadalajara",
      postalCode: "19001",
      published: true,
      featured: true,
    },
  },
  {
    daysAgo: 6,
    previousPrice: 215000,
    input: {
      title: "Piso de 3 dormitorios junto al parque",
      description:
        "Piso exterior de 3 dormitorios con balcón, en urbanización con piscina comunitaria. Armarios empotrados, trastero y garaje. Zona tranquila con colegios y comercios a pie de calle.",
      operation: "venta",
      type: "piso",
      price: 198000,
      builtArea: 105,
      usableArea: 88,
      bedrooms: 3,
      bathrooms: 2,
      floor: "2º",
      features: ["ascensor", "garaje", "trastero", "balcon", "piscina", "exterior"],
      energyRating: "D",
      zone: "Aguas Vivas",
      city: "Guadalajara",
      postalCode: "19005",
      published: true,
      featured: true,
    },
  },
  {
    daysAgo: 10,
    input: {
      title: "Chalet independiente con jardín y piscina",
      description:
        "Chalet de 4 dormitorios en parcela de 600 m² con jardín, piscina privada y barbacoa. Salón con chimenea, cocina office y garaje para dos coches. Ideal para familias.",
      operation: "venta",
      type: "chalet",
      price: 425000,
      builtArea: 240,
      usableArea: 210,
      bedrooms: 4,
      bathrooms: 3,
      features: ["garaje", "jardin", "piscina", "calefaccion", "aire_acondicionado"],
      energyRating: "E",
      zone: "Valdeluz",
      city: "Yebes",
      postalCode: "19141",
      published: true,
      featured: true,
    },
  },
  {
    daysAgo: 14,
    status: "reservado",
    input: {
      title: "Dúplex moderno a estrenar en Los Valles",
      description:
        "Dúplex de obra nueva con 3 dormitorios, 2 baños y aseo. Aerotermia, suelo radiante y terraza en la planta superior. Garaje y trastero incluidos en el precio.",
      operation: "venta",
      type: "duplex",
      price: 265000,
      builtArea: 132,
      usableArea: 115,
      bedrooms: 3,
      bathrooms: 3,
      floor: "3º",
      features: ["ascensor", "garaje", "trastero", "terraza", "calefaccion", "aire_acondicionado"],
      energyRating: "A",
      zone: "Los Valles",
      city: "Guadalajara",
      postalCode: "19005",
      published: true,
    },
  },
  {
    daysAgo: 21,
    status: "vendido",
    input: {
      title: "Casa adosada con patio en Marchamalo",
      description:
        "Casa adosada de 3 plantas con 4 dormitorios, patio trasero y garaje. Buhardilla diáfana y bodega. Cerca del centro del pueblo y bien comunicada con Guadalajara.",
      operation: "venta",
      type: "casa",
      price: 189000,
      builtArea: 180,
      bedrooms: 4,
      bathrooms: 2,
      features: ["garaje", "calefaccion"],
      energyRating: "F",
      zone: "Centro",
      city: "Marchamalo",
      postalCode: "19180",
      published: true,
    },
  },
  {
    daysAgo: 25,
    input: {
      title: "Estudio reformado ideal para inversión",
      description:
        "Estudio de 38 m² totalmente reformado y amueblado, con cocina americana y baño completo. Muy cerca de la estación de tren y de la universidad. Alta demanda de alquiler en la zona.",
      operation: "venta",
      type: "estudio",
      price: 79000,
      builtArea: 38,
      usableArea: 33,
      bedrooms: 0,
      bathrooms: 1,
      floor: "1º",
      features: ["amueblado", "calefaccion"],
      energyRating: "en_tramite",
      zone: "El Balconcillo",
      city: "Guadalajara",
      postalCode: "19004",
      published: true,
    },
  },
  {
    daysAgo: 30,
    input: {
      title: "Local comercial a pie de calle en zona de paso",
      description:
        "Local de 85 m² con escaparate de 6 metros, baño y almacén. Diáfano, con salida de humos. Calle comercial con mucho tránsito peatonal.",
      operation: "venta",
      type: "local",
      price: 120000,
      builtArea: 85,
      bedrooms: 0,
      bathrooms: 1,
      floor: "Bajo",
      features: [],
      energyRating: "exento",
      zone: "Centro",
      city: "Azuqueca de Henares",
      postalCode: "19200",
      published: true,
    },
  },
  {
    daysAgo: 4,
    input: {
      title: "Piso amueblado de 2 dormitorios en alquiler",
      description:
        "Piso de 2 dormitorios totalmente amueblado y equipado, con calefacción central y ascensor. Disponible de inmediato. Se requiere contrato de trabajo y fianza de dos meses.",
      operation: "alquiler",
      type: "piso",
      price: 750,
      builtArea: 75,
      usableArea: 64,
      bedrooms: 2,
      bathrooms: 1,
      floor: "4º",
      features: ["ascensor", "amueblado", "calefaccion", "exterior"],
      energyRating: "D",
      zone: "Las Lomas",
      city: "Guadalajara",
      postalCode: "19003",
      published: true,
    },
  },
];

// Datos fijos (sin fechas) para el servidor: rutas, títulos de página y sitemap.
export function seedSummaries() {
  return items.map((item, i) => {
    const reference = formatReference(brand.referencePrefix, i + 1);
    return {
      slug: propertySlug(item.input.title, reference),
      title: item.input.title,
      description: item.input.description,
      cover: photos[i]?.[0] ? `${UNSPLASH}${photos[i][0]}` : null,
    };
  });
}

// Fechas relativas a hoy para que la demo siempre parezca reciente.
export function seedProperties(now = new Date()): Property[] {
  return items.map((item, i) => {
    const data = propertyInputSchema.parse(item.input);
    const reference = formatReference(brand.referencePrefix, i + 1);
    const created = new Date(now.getTime() - item.daysAgo * 86_400_000).toISOString();
    const closed = item.status === "vendido" || item.status === "alquilado";
    return {
      ...data,
      id: `demo-${i + 1}`,
      reference,
      slug: propertySlug(data.title, reference),
      status: item.status ?? "disponible",
      previousPrice: item.previousPrice ?? null,
      priceReducedAt: item.previousPrice ? created : null,
      priceHistory: item.previousPrice ? [{ at: created, from: item.previousPrice, to: data.price }] : [],
      closedAt: closed ? created : null,
      deletedAt: null,
      createdAt: created,
      updatedAt: created,
      updatedBy: null,
      media: (photos[i] ?? []).map((id, position) => ({
        id: `demo-${i + 1}-${position + 1}`,
        kind: "image" as const,
        source: "static" as const,
        path: `${UNSPLASH}${id}`,
        position,
        alt: `${data.title}, foto ${position + 1}`,
        width: null,
        height: null,
        sizeBytes: 0,
        mimeType: "image/jpeg",
      })),
    };
  });
}

// Actividad y contactos de ejemplo para que el histórico y el resumen no salgan vacíos.
export function seedActivity(now = new Date()): { audit: AuditEntry[]; leads: Lead[] } {
  const at = (days: number, hours = 0) => new Date(now.getTime() - days * 86_400_000 - hours * 3_600_000).toISOString();
  const laura = { id: "demo-admin", name: "Laura Martín", role: "admin" as const };
  const carlos = { id: "demo-editor", name: "Carlos Ruiz", role: "editor" as const };
  const props = seedProperties(now);
  const label = (i: number) => `${props[i].reference} · ${props[i].title}`;
  const audit: AuditEntry[] = [
    {
      id: "seed-audit-1",
      at: at(6, 3),
      actor: laura,
      entity: "property",
      entityId: props[1].id,
      entityLabel: label(1),
      action: "price_drop",
      changes: { price: { from: 215000, to: 198000 }, previousPrice: { from: null, to: 215000 } },
    },
    {
      id: "seed-audit-2",
      at: at(4, 5),
      actor: carlos,
      entity: "property",
      entityId: props[7].id,
      entityLabel: label(7),
      action: "create",
      changes: {},
    },
    {
      id: "seed-audit-3",
      at: at(2, 2),
      actor: laura,
      entity: "property",
      entityId: props[3].id,
      entityLabel: label(3),
      action: "status",
      changes: { status: { from: "disponible", to: "reservado" } },
    },
    {
      id: "seed-audit-4",
      at: at(1, 4),
      actor: carlos,
      entity: "property",
      entityId: props[0].id,
      entityLabel: label(0),
      action: "update",
      changes: {
        featured: { from: false, to: true },
        features: { from: ["ascensor", "garaje", "terraza"], to: props[0].features },
      },
    },
  ];
  const leads: Lead[] = [
    {
      id: "seed-lead-1",
      name: "María González",
      email: "maria.gonzalez@example.com",
      phone: "600 123 456",
      message: "Hola, me interesa el ático. ¿Se puede ver este sábado por la mañana?",
      reason: "visita",
      propertyId: props[0].id,
      propertyLabel: label(0),
      createdAt: at(3),
      consentAt: at(3),
      status: "nuevo",
    },
    {
      id: "seed-lead-2",
      name: "Javier Moreno",
      email: "javier.moreno@example.com",
      phone: "",
      message: "Quiero vender mi piso en Los Valles, 90 m² y 3 dormitorios. ¿Me podéis hacer una valoración?",
      reason: "vender",
      propertyId: null,
      propertyLabel: null,
      createdAt: at(0, 6),
      consentAt: at(0, 6),
      status: "nuevo",
    },
  ];
  return { audit, leads };
}
