// Configuración del sitio. Todo lo personal vive aquí o en variables de entorno.
export const site = {
  name: "Isai González",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Si ningún canal está configurado, la sección de contacto no se muestra.
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
    github: process.env.NEXT_PUBLIC_GITHUB_URL || null,
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || null,
  },
  live: {
    formulacion: "https://formulacion.siaumex.com.mx/",
    warden: "https://warden-eight.vercel.app/",
  },
} as const;

export const hasContact = Boolean(
  site.contact.email || site.contact.github || site.contact.linkedin,
);
