@AGENTS.md

# Portal Inmobiliario · Template

Template vendible a varias inmobiliarias. Un despliegue por cliente. Textos de la web y del panel en español.

## Reglas

- **Tema:** nunca colores, fuentes ni radios a mano en componentes. Solo clases de tema (`bg-primary`, `text-cta`, `bg-status-sold`…). Tokens nuevos: añadir a los presets en `src/theme/presets/` y mapear en `src/app/globals.css`.
- **Cliente:** nada específico de un cliente en el código. Va en `src/config/brand.ts`, en el preset del tema o en la base de datos.
- **Seguridad:** RLS en todas las tablas. Las reglas de negocio (máx. 30 fotos, 1 vídeo…) se aplican en la base de datos, no solo en la UI. Cada Server Action comprueba permisos; el proxy es solo un filtro rápido. `SUPABASE_SECRET_KEY` solo en archivos con `import "server-only"`.
- **Contenido editable:** textos de la web nunca escritos a mano en componentes públicos. Van en `src/config/site-content.ts`, se declaran en `src/lib/content/fields.ts` y se leen con `useSiteContent()`.
- **Supabase:** cambios de esquema siempre como migración en `supabase/migrations/`.
- **Cache Components:** lo que lee cookies va detrás de `<Suspense>`. La web pública usa `createPublicClient()` (sin cookies) para poder cachear.
- **Diseño:** usar la skill `ui-ux-pro-max` (`.claude/skills/`) para decisiones de UI y revisar su checklist antes de entregar.
