import type { es } from "./es";

export type Locale = "es" | "en";
export type CaseSlug = "formulacion" | "reposteria" | "warden" | "automatizacion";
export type EvidenceKey = "live" | "interactive" | "architecture" | "request" | "nda";

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

/** La forma del contenido sale del español; el inglés debe cumplirla campo por campo. */
export type Content = Widen<typeof es>;
