import type { Content } from "@/content/types";
import { KIND_STYLE, asKind } from "./kinds";

/** Línea de tiempo real: las fechas sí son una secuencia. */
export function Journey({ t }: { t: Content["journey"] }) {
  return (
    <ol className="border-t border-ink">
      {t.items.map((item) => (
        <li key={item.title} className="grid gap-1 border-b border-rule py-6 md:grid-cols-[220px_1fr] md:gap-8">
          <p className="flex items-center gap-3">
            <span aria-hidden className={`h-4 w-4 shrink-0 ${KIND_STYLE[asKind(item.kind)].bg}`} />
            <span className="title text-[1.6rem]">{item.when}</span>
          </p>
          <div>
            <h3 className="text-[1.15rem] font-semibold">{item.title}</h3>
            <p className="prose-measure mt-1 text-ink-2">{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
