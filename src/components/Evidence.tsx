import type { EvidenceKey } from "@/content/types";
import { KIND_STYLE, type Kind } from "./kinds";

export const EVIDENCE_ORDER: EvidenceKey[] = ["live", "interactive", "architecture", "request", "nda"];

type Labels = Record<EvidenceKey, string>;

/** Cinco casillas fijas: llena significa que ese tipo de evidencia existe para el proyecto. */
export function EvidenceMeter({ have, labels, kind = "professional" }: { have: string[]; labels: Labels; kind?: Kind }) {
  const st = KIND_STYLE[kind];
  const present = EVIDENCE_ORDER.filter((k) => have.includes(k));
  return (
    <span
      role="img"
      aria-label={present.map((k) => labels[k]).join(", ")}
      title={present.map((k) => labels[k]).join(", ")}
      className="inline-flex gap-1"
    >
      {EVIDENCE_ORDER.map((k) => (
        <span
          key={k}
          aria-hidden
          className={`h-3 w-3 border ${have.includes(k) ? `${st.border} ${st.bg}` : "border-ink/30"}`}
        />
      ))}
    </span>
  );
}

export function EvidenceLegend({ labels }: { labels: Labels }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9rem] text-ink-2">
      {EVIDENCE_ORDER.map((k) => (
        <li key={k} className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 border border-ink bg-ink" />
          {labels[k]}
        </li>
      ))}
    </ul>
  );
}
