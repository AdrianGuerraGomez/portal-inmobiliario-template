// Configuración por cliente. Lo único (junto al tema) que cambia
// al montar la web de una inmobiliaria nueva.
// Teléfono, email, horario y textos editables viven en la base de datos
// (panel admin). Aquí solo van valores por defecto y la identidad fija.

export type BrandConfig = {
  name: string;
  legalName: string;
  description: string;
  locale: string;
  currency: string;
  referencePrefix: string;
  logo: { src: string; alt: string; width: number; height: number };
  city: string;
  // Valores por defecto. Con el módulo de contenido editable, se cambian desde el panel.
  contact: {
    email: string;
    whatsapp: string; // solo dígitos con prefijo, p. ej. 34600000000
    offices: { name: string; address: string; phone: string; hours: string }[];
    social: { facebook?: string; instagram?: string };
  };
  // Empresa de hipotecas con la que colabora (página /financiacion). null si no hay.
  mortgagePartner: {
    name: string;
    url: string;
    contacts: { name: string; role: string; phone: string }[];
  } | null;
  modules: {
    rentals: boolean;
    financing: boolean;
    video: boolean;
    editableContent: boolean;
    auditLog: boolean;
    weeklyReport: boolean;
  };
  media: {
    maxPhotos: number;
    maxPhotoMB: number;
    maxVideos: number;
    maxVideoMB: number;
  };
};

export const brand: BrandConfig = {
  name: "Casa Blanca Inmobiliaria",
  legalName: "Casa Blanca Inmobiliaria", // razón social completa: pendiente de confirmar
  description: "Pisos, casas y locales en venta y alquiler en Guadalajara.",
  locale: "es-ES",
  currency: "EUR",
  referencePrefix: "CB",
  logo: { src: "/brand/logo.svg", alt: "Casa Blanca Inmobiliaria", width: 160, height: 40 },
  city: "Guadalajara",
  contact: {
    email: "",
    whatsapp: "",
    offices: [
      { name: "Oficina Avda. Castilla", address: "Avda. Castilla, 18, Guadalajara", phone: "949 410 284", hours: "" },
      { name: "Oficina Avda. Beleña", address: "Avda. Beleña, 16, Guadalajara", phone: "949 410 344", hours: "" },
    ],
    social: {
      facebook: "https://www.facebook.com/Inmobiliaria-Casa-Blanca-529957037178072/",
      instagram: "https://www.instagram.com/casa.blanca.inmobiliaria/",
    },
  },
  mortgagePartner: {
    name: "CB Hipotecas",
    url: "https://www.cbhipotecas.com",
    contacts: [
      { name: "Jénnifer Sánchez", role: "Asesora financiera", phone: "641 239 763" },
      { name: "Miguel Sánchez", role: "Director financiero", phone: "670 109 437" },
    ],
  },
  modules: {
    rentals: true,
    financing: true,
    video: true,
    editableContent: true,
    auditLog: true,
    weeklyReport: true,
  },
  media: {
    maxPhotos: 30,
    maxPhotoMB: 10,
    maxVideos: 1,
    maxVideoMB: 50,
  },
};
