# Portafolio de Isai González

Sitio bilingüe (ES/EN) construido con Next.js (App Router), TypeScript estricto, Tailwind CSS 4 y Framer Motion. Listo para desplegar en Vercel.

## Empezar

```bash
npm install
npm run dev        # http://localhost:3000, redirige a /es
npm run typecheck
npm run build
```

Requiere Node 20 o superior.

## Si la página se ve pero no responde

En desarrollo, Next bloquea el JavaScript cuando abres el sitio desde un origen que no es `localhost` o `127.0.0.1` (por ejemplo, la IP de tu red). Los enlaces funcionan, pero las demos y la báscula no. Agrega ese origen en `.env.local`:

```
ALLOWED_DEV_ORIGINS=192.168.1.50
```

y reinicia `npm run dev`. En producción (Vercel) no ocurre.

## Antes de publicar

1. Copia `.env.example` a `.env.local` y completa:
   - `NEXT_PUBLIC_SITE_URL`: la URL pública (para metadatos y sitemap).
   - `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_LINKEDIN_URL`: los canales que quieras mostrar.
   Si los tres están vacíos, la sección de contacto y su enlace del menú no se muestran.
2. Revisa los datos que se asumieron, en `src/lib/site.ts` y en `src/content/es.ts` y `en.ts`:
   - El nombre (`Isai González`).
   - Los periodos y el rol en SIAUMEX (estadía profesional de 12 meses).
   - El texto de la sección AI-Augmented Development, incluida la frase que dice que este sitio se construyó con asistencia de IA.
3. En Vercel, importa el repositorio. No requiere configuración adicional.

## Estructura

```
src/
  app/[locale]/            páginas: inicio, work/[slug], ai, about
  components/              interfaz y mapa de sistemas
  components/demos/        simulador de pesaje, licencias, tickets, sensores, caja
  content/                 todo el texto: es.ts es la fuente de la forma; en.ts debe cumplirla
  lib/                     configuración, i18n y codificador Code 128
```

- **Contenido**: se edita solo en `src/content`. `en.ts` está tipado contra `es.ts`, así que TypeScript marca cualquier campo que falte en inglés.
- **Categorías**: cada proyecto declara `kind` (`professional`, `personal` o `school`) en `work.rows`. La portada los agrupa y cada categoría tiene su color en `src/components/kinds.ts`.
- **Evidencia**: cada proyecto declara qué tipos de evidencia existen (`work.rows[].evidence`). Las casillas de la portada salen de ahí.
- **Demos**: usan datos sintéticos. Ninguna información de clientes está en este repositorio.

## Decisiones de diseño

- Fondo de papel y tinta. El color tiene significado: azul para lo profesional, verde para lo personal, amarillo para lo escolar y rojo para la sección de IA. Las demos usan pantallas oscuras con ámbar.
- Archivo, en su variante condensada para titulares y normal para texto; IBM Plex Mono solo donde el contenido es un ticket o código.
- Un solo momento de movimiento en la portada (la báscula que se estabiliza). El resto del movimiento responde a acciones de la persona.
- Respeta `prefers-reduced-motion`.
