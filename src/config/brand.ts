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
  defaults: {
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  modules: {
    rentals: boolean;
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
  name: "Casablanca Inmobiliarias",
  legalName: "Casablanca Inmobiliarias S.L.",
  description: "Pisos, casas y locales en venta y alquiler en Guadalajara.",
  locale: "es-ES",
  currency: "EUR",
  referencePrefix: "CB",
  logo: { src: "/brand/logo.svg", alt: "Casablanca Inmobiliarias", width: 160, height: 40 },
  defaults: {
    phone: "",
    email: "",
    address: "",
    city: "Guadalajara",
  },
  modules: {
    rentals: true,
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
