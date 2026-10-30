import type { Locale } from "@/content/types";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "es" ? "en" : "es";
}
