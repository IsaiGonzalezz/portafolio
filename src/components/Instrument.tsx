import type { ReactNode } from "react";

/** Panel oscuro para las demos: el sitio es papel, los instrumentos son pantallas. */
export function Instrument({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="on-dark rounded-[14px] border border-panel-line bg-panel p-5 text-paper md:p-7">
      <h3 className="title text-[1.7rem] md:text-[2.1rem]">{title}</h3>
      {intro ? <p className="mt-2 max-w-[62ch] text-paper/65">{intro}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
