// Textos e imágenes de la web por defecto para este cliente.
// Se editan desde el panel (Contenido web); estos valores quedan de respaldo.
// Para añadir un hueco editable: ponlo aquí y declara su campo en src/lib/content/fields.ts.

export const siteContent = {
  home: {
    eyebrow: "Inmobiliaria en Guadalajara",
    title: "Encuentra tu casa en Guadalajara",
    subtitle: "Pisos, casas y locales seleccionados por un equipo que conoce cada barrio.",
    heroImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
    heroImageAlt: "Fachada de una vivienda unifamiliar blanca con jardín",
    featuredTitle: "Inmuebles destacados",
    mapTitle: "Dónde están nuestros inmuebles",
    mapSubtitle: "Guadalajara y alrededores. Pulsa en un precio para ver el inmueble.",
    values: [
      { title: "Conocemos la zona", text: "Dos oficinas en Guadalajara y años vendiendo en cada barrio.", href: "" },
      { title: "Tasación sin coste", text: "Te decimos cuánto vale tu casa antes de ponerla a la venta.", href: "" },
      { title: "Te ayudamos con la hipoteca", text: "Buscamos contigo la mejor financiación.", href: "/financiacion" },
    ],
    sellTitle: "¿Quieres vender tu casa?",
    sellText: "Te hacemos una valoración gratuita y nos encargamos de todo: fotos, visitas y papeleo.",
    sellCta: "Pide tu valoración",
  },
  financing: {
    eyebrow: "Financiación",
    title: "Te ayudamos a conseguir tu hipoteca",
    subtitle:
      "Simulación gratuita, adaptada a cada cliente, 100 % personalizada y sin compromiso. Porque tu futuro financiero no puede depender de una simple calculadora online.",
    services: [
      "Calculamos tu hipoteca y la cuota mensual.",
      "Analizamos el porcentaje máximo de financiación.",
      "Buscamos el mejor tipo de interés disponible.",
      "Te asesoramos también sobre cualquier préstamo que necesites.",
    ],
    rentTitle: "¿Sigues de alquiler?",
    rentText: "No sigas perdiendo dinero. Conseguimos financiación hasta el 100 %.",
    disclaimer:
      "Cálculo orientativo. La cuota real depende de las condiciones del banco y del perfil de cada cliente; no es una oferta vinculante.",
  },
  contact: {
    title: "Hablemos",
    subtitle: "Llámanos, pásate por la oficina o déjanos un mensaje y te respondemos en el día.",
  },
};
