import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { HydrationGuard } from "@/components/HydrationGuard";
import { Nav } from "@/components/Nav";
import { getContent } from "@/content";
import { isLocale, locales } from "@/lib/i18n";
import { hasContact, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getContent(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s | ${site.name}` },
    description: t.meta.description,
    alternates: { canonical: `/${locale}`, languages: { es: "/es", en: "/en" } },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === "es" ? "es_MX" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getContent(locale);

  // Solo en desarrollo: si el JavaScript no se ejecuta, la página se ve pero nada responde y
  // el navegador no muestra ningún error. Este aviso lo hace visible.
  const warning =
    locale === "es"
      ? "Las demos no están cargando: el JavaScript de esta página no se ejecutó. Abre el sitio con http://localhost:3000 y revisa la terminal donde corre npm run dev. Ahí aparece el motivo. Dirección actual: "
      : "The demos are not loading: this page's JavaScript did not run. Open the site at http://localhost:3000 and check the terminal where npm run dev is running. The reason appears there. Current address: ";
  const guardScript = `setTimeout(function(){if(window.__hydrated)return;var d=document.createElement('div');d.setAttribute('role','alert');d.style.cssText='position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;background:#14171a;color:#fff;padding:14px 16px;border-radius:10px;font:15px/1.5 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35)';d.textContent=${JSON.stringify(warning)}+location.host;document.body.appendChild(d)},5000);`;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "Software Engineer",
    url: site.url,
  };

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <Nav locale={locale} t={t.nav} showContact={hasContact} name={site.name} />
        <main id="main">{children}</main>
        <Footer t={t.footer} />
        <HydrationGuard />
        {process.env.NODE_ENV !== "production" ? <script dangerouslySetInnerHTML={{ __html: guardScript }} /> : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </body>
    </html>
  );
}
