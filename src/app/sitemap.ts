import type { MetadataRoute } from "next";
import { CASE_SLUGS } from "@/content";
import { locales } from "@/lib/i18n";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/ai", "/about", ...CASE_SLUGS.map((s) => `/work/${s}`)];
  return locales.flatMap((l) => paths.map((p) => ({ url: `${site.url}/${l}${p}`, changeFrequency: "monthly" as const })));
}
