// Modo demo: datos de ejemplo + cambios en el navegador, sin base de datos.
// Se apaga con NEXT_PUBLIC_DEMO_MODE=false cuando el cliente tenga Supabase.
export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
