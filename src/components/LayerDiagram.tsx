import { Fragment } from "react";
import { KIND_STYLE, type Kind } from "./kinds";

type Layer = { title: string; nodes: { name: string; note: string }[] };

function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 28 12"
      className="h-3 w-7 shrink-0 rotate-90 self-center text-ink-2 md:rotate-0"
    >
      <path d="M0 6h24M19 1l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Diagrama de capas en estilo plano: izquierda a derecha, de lo físico a los datos. */
export function LayerDiagram({ layers, label, kind = "professional" }: { layers: Layer[]; label: string; kind?: Kind }) {
  const st = KIND_STYLE[kind];
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3 md:flex-row md:items-stretch">
      {layers.map((layer, i) => (
        <Fragment key={layer.title}>
          <div className={`flex-1 border ${st.softBorder} bg-paper p-4`}>
            <h4 className={`title text-[1.15rem] ${st.text}`}>{layer.title}</h4>
            <ul className="mt-3 space-y-3">
              {layer.nodes.map((n) => (
                <li key={n.name} className="border-t border-rule pt-2">
                  <p className="font-semibold leading-snug">{n.name}</p>
                  <p className="text-[0.9rem] leading-snug text-ink-2">{n.note}</p>
                </li>
              ))}
            </ul>
          </div>
          {i < layers.length - 1 ? <Arrow /> : null}
        </Fragment>
      ))}
    </div>
  );
}
