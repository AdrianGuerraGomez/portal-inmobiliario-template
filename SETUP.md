# Montar la web para un cliente nuevo

Cada cliente tiene su propio repo, su propio proyecto de Supabase y su propio proyecto de Vercel.
Así sus datos nunca se mezclan y se puede ir con todo si se va.

## 1. Repo

1. En GitHub: **Use this template → Create a new repository** (privado), p. ej. `web-<cliente>`.
2. Clonar y `npm install`.

## 2. Marca

1. `src/config/brand.ts`: nombre, razón social, descripción, ciudad, módulos y límites.
2. Copiar `src/theme/presets/casablanca.css` a `src/theme/presets/<cliente>.css` y cambiar los `--brand-*`.
3. En `src/theme/theme.css`, apuntar el `@import` al preset nuevo.
4. `src/theme/fonts.ts`: cambiar fuentes si hace falta.
5. Logo en `public/brand/logo.svg` y favicon en `src/app/favicon.ico`.
6. `npm run dev` y revisar `/styleguide`. Contraste mínimo 4.5:1 en textos.

## 3. Supabase

1. Crear proyecto en la región **eu-west** (datos en la UE, RGPD).
2. Authentication → Sign In / Providers: **desactivar "Allow new users to sign up"**.
3. Authentication → MFA: activar TOTP.
4. Aplicar migraciones:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push
   ```
5. Crear los usuarios del cliente a mano (Authentication → Users → Add user).
6. Copiar URL, publishable key y secret key a `.env.local`.

## 4. Vercel

1. Importar el repo. Framework: Next.js.
2. Variables de entorno: las de `.env.example`.
3. Plan **Pro** para uso comercial (Hobby es solo personal).
4. Dominio del cliente → Settings → Domains.

## 5. Antes de entregar

- [ ] `/styleguide` revisado con el tema del cliente
- [ ] Registro público cerrado en Supabase
- [ ] MFA activo para los admins
- [ ] Copias de seguridad configuradas
- [ ] Aviso legal, privacidad y cookies con datos del cliente
