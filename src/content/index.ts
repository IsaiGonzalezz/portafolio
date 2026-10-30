import { es } from "./es";
import { en } from "./en";
import type { Content, Locale } from "./types";

export type { Content, Locale, CaseSlug, EvidenceKey } from "./types";

export const CASE_SLUGS = ["formulacion", "reposteria", "warden", "automatizacion"] as const;

export function getContent(locale: Locale): Content {
  return locale === "en" ? en : (es as Content);
}
