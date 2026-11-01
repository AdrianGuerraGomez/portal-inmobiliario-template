# Portal Inmobiliario · Template

Web + panel de administración para inmobiliarias pequeñas. Un despliegue por cliente.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase (Postgres, Auth, Storage) · Vercel.

## Empezar

```bash
npm install
cp .env.example .env.local   # rellenar valores
npm run dev
```

- Web: http://localhost:3000
- Guía de estilo del tema activo: http://localhost:3000/styleguide

## Personalizar para un cliente

| Qué | Dónde |
|---|---|
| Nombre, logo, módulos, límites de fotos/vídeo | `src/config/brand.ts` |
| Colores, radios, estados de inmueble | `src/theme/presets/<cliente>.css` |
| Preset activo | `src/theme/theme.css` (una línea) |
| Fuentes | `src/theme/fonts.ts` |
| Logo y favicon | `public/brand/`, `src/app/favicon.ico` |

Los componentes solo usan clases de tema (`bg-primary`, `text-cta`, `bg-status-sold`…). Nunca colores a mano.
Pasos completos para un cliente nuevo: [SETUP.md](SETUP.md).

## Estructura

```
src/
  app/              rutas (web pública, /admin, /styleguide)
  components/ui/    componentes shadcn/ui
  config/brand.ts   configuración del cliente
  theme/            tema: presets, preset activo, fuentes
  lib/supabase/     clientes: navegador, servidor (sesión), público (cacheable), proxy
  lib/env*.ts       variables de entorno validadas con Zod
  proxy.ts          protege /admin (antes "middleware")
supabase/
  config.toml       config local (registro público cerrado, MFA activo)
  migrations/       esquema versionado
```

## Modo demo

Con `NEXT_PUBLIC_DEMO_MODE=true` (por defecto) no hace falta base de datos:

- Inmuebles de ejemplo en `src/lib/data/demo/seed.ts`.
- Los cambios se guardan en el navegador de cada visitante (IndexedDB).
- Login falso con dos usuarios (admin y editor) en `src/lib/data/demo/session.ts`.

Las pantallas solo usan la interfaz `Repository` (`src/lib/data/repository.ts`).
Para producción se añade una implementación con Supabase y se pone `NEXT_PUBLIC_DEMO_MODE=false`.

## Fases

- [x] Fase 0 · Preparación y sistema de tema
- [x] Fase 1 · Modelo de datos, datos de ejemplo y capa demo
- [x] Fase 2 · Panel de inmuebles (login demo, listado, crear/editar, fotos y vídeo, rebajas, estados, papelera)
- [x] Fase 3 · Web pública (portada, listados con filtros, ficha, contacto, legales, SEO) + bandeja de contactos
- [ ] Fase 4 · Contenido editable
- [ ] Fase 5 · Histórico de cambios
- [ ] Fase 6 · Supabase y producción (cuando el cliente compre)
