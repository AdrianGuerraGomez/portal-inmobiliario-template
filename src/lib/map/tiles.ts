// Capa de mapa. OpenStreetMap es gratis y sin clave, con atribución obligatoria.
// Con mucho tráfico en producción, cambiar a un proveedor con plan propio
// (p. ej. MapTiler o Stadia) solo tocando este archivo.
export const MAP_TILES = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
};
