import { brand } from "@/config/brand";
import { propertyInputSchema, type Property, type PropertyInput, type PropertyStatus } from "@/lib/domain/property";
import { formatReference, propertySlug } from "@/lib/domain/slug";

// Inmuebles de ejemplo. Sube SEED_VERSION al cambiarlos: el navegador
// borra los datos de demo viejos y carga estos.
export const SEED_VERSION = 1;

type SeedItem = {
  input: PropertyInput;
  status?: PropertyStatus;
  previousPrice?: number;
  daysAgo: number;
};

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
      media: [],
    };
  });
}
