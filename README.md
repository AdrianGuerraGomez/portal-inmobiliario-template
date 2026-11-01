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

## Fases

- [x] Fase 0 · Preparación y sistema de tema
- [ ] Fase 1 · Base de datos y seguridad (RLS)
- [ ] Fase 2 · Panel de inmuebles
- [ ] Fase 3 · Web pública
- [ ] Fase 4 · Contenido editable
- [ ] Fase 5 · Histórico de cambios y resumen semanal
- [ ] Fase 6 · Producción
