import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EVIDENCE_ORDER } from "@/components/Evidence";
import { LayerDiagram } from "@/components/LayerDiagram";
import { CashSession } from "@/components/demos/CashSession";
import { DosingDemo } from "@/components/demos/DosingDemo";
import { InspectionLine } from "@/components/demos/InspectionLine";
import { LicenseExplorer } from "@/components/demos/LicenseExplorer";
import { PredictiveDemo } from "@/components/demos/PredictiveDemo";
import { SensorPipeline } from "@/components/demos/SensorPipeline";
import { TicketDesigner } from "@/components/demos/TicketDesigner";
import { WeighingSimulator } from "@/components/demos/WeighingSimulator";
import { KIND_STYLE, asKind } from "@/components/kinds";
import { container } from "@/components/ui";
import { CASE_SLUGS, getContent } from "@/content";
import type { CaseSlug } from "@/content/types";
import { isLocale, locales } from "@/lib/i18n";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => CASE_SLUGS.map((slug) => ({ locale, slug })));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

const isSlug = (s: string): s is CaseSlug => (CASE_SLUGS as readonly string[]).includes(s);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) return {};
  const c = getContent(locale).cases[slug];
  return {
    title: c.title,
    description: c.summary,
    alternates: { canonical: `/${locale}/work/${slug}`, languages: { es: `/es/work/${slug}`, en: `/en/work/${slug}` } },
  };
}

const h2 = "title text-[clamp(2rem,4vw,3rem)]";

export default async function CasePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) notFound();
  const t = getContent(locale);
  const c = t.cases[slug];
  const row = t.work.rows.find((r) => r.slug === slug);
  const have = row?.evidence ?? [];
  const kind = asKind(row?.kind ?? "professional");
  const st = KIND_STYLE[kind];
  const liveHref = slug === "formulacion" ? site.live.formulacion : slug === "warden" ? site.live.warden : null;
  const nextSlug = CASE_SLUGS[(CASE_SLUGS.indexOf(slug) + 1) % CASE_SLUGS.length];

  return (
    <article>
      <header className={`blueprint-grid border-b border-t-[10px] border-b-rule ${st.topBorder}`}>
        <div className={`${container} py-12 md:py-20`}>
          <Link href={`/${locale}#trabajo`} className="text-[0.95rem] text-ink-2 underline underline-offset-4 hover:text-ink">
            {t.caseUi.back}
          </Link>
          <h1 className="display mt-6 max-w-[16ch] text-[clamp(3rem,8vw,6.6rem)]">{c.title}</h1>
          <p className="prose-measure mt-6 text-[1.2rem] leading-relaxed text-ink-2">{c.summary}</p>
          <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-ink pt-5 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                [t.caseUi.kindLabel, t.caseUi.kinds[kind]],
                [t.caseUi.role, c.role],
                [t.caseUi.period, c.period],
                [t.caseUi.status, c.status],
                [t.caseUi.stack, c.stack],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.9rem] text-ink-2">{label}</dt>
                <dd className="mt-0.5 flex items-start gap-2 font-medium">
                  {label === t.caseUi.kindLabel ? <span aria-hidden className={`mt-[0.45em] h-3 w-3 shrink-0 ${st.bg}`} /> : null}
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {c.live && liveHref ? (
            <a
              href={liveHref}
              rel="noopener noreferrer"
              target="_blank"
              className={`mt-8 inline-block rounded-md bg-ink px-5 py-2.5 font-semibold text-paper transition-colors ${st.hover}`}
            >
              {c.live}
            </a>
          ) : null}
        </div>
      </header>

      <section className="border-b border-rule py-14 md:py-20">
        <div className={`${container} grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-14`}>
          <h2 className={h2}>{t.caseUi.problem}</h2>
          <div className="space-y-4">
            {c.problem.map((p) => (
              <p key={p} className="prose-measure text-[1.1rem]">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rule py-14 md:py-20">
        <div className={container}>
          <h2 className={h2}>{t.caseUi.architecture}</h2>
          <p className="prose-measure mt-4 text-ink-2">{c.architectureIntro}</p>
          <div className="mt-8">
            <LayerDiagram layers={c.layers} label={t.caseUi.architecture} kind={kind} />
          </div>
        </div>
      </section>

      <section className="border-b border-rule py-14 md:py-20">
        <div className={container}>
          <h2 className={h2}>{t.caseUi.decisions}</h2>
          <ul className="mt-8 border-t border-ink">
            {c.decisions.map((d) => (
              <li key={d.name} className="grid gap-3 border-b border-rule py-7 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-10">
                <h3 className="title text-[1.5rem]">{d.name}</h3>
                <p>
                  <span className="block text-[0.9rem] text-ink-2">{t.caseUi.why}</span>
                  {d.why}
                </p>
                <p>
                  <span className="block text-[0.9rem] text-ink-2">{t.caseUi.cost}</span>
                  {d.cost}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="demos" className="scroll-mt-16 border-b border-rule py-14 md:py-20">
        <div className={container}>
          <h2 className={h2}>{t.caseUi.demos}</h2>
          <p className="prose-measure mt-4 text-ink-2">
            {c.demosIntro} {t.caseUi.demosHint}
          </p>
          <div className="mt-8 space-y-8">
            {slug === "formulacion" ? (
              <>
                <WeighingSimulator t={t.demos.weigh} />
                <LicenseExplorer t={t.demos.license} />
                <TicketDesigner t={t.demos.ticket} />
              </>
            ) : null}
            {slug === "reposteria" ? <CashSession t={t.demos.cash} /> : null}
            {slug === "warden" ? <SensorPipeline t={t.demos.sensors} /> : null}
            {slug === "automatizacion" ? (
              <>
                <InspectionLine t={t.demos.inspection} />
                <PredictiveDemo t={t.demos.predictive} />
                <DosingDemo t={t.demos.dosing} />
              </>
            ) : null}
          </div>
        </div>
      </section>

      {slug === "formulacion" ? (
        <section className="border-b border-rule py-14 md:py-20">
          <div className={container}>
            <h2 className={h2}>{t.privacy.title}</h2>
            <p className="prose-measure mt-4 text-[1.1rem]">{t.privacy.body}</p>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {t.privacy.levels.map((l, i) => (
                <li key={l.name} className={`border-t-[3px] pt-3 ${st.border}`}>
                  <p className="num text-[0.9rem] text-ink-2">{i + 1} de {t.privacy.levels.length}</p>
                  <h3 className="mt-1 text-[1.1rem] font-semibold">{l.name}</h3>
                  <p className="mt-1 text-ink-2">{l.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="border-b border-rule py-14 md:py-20">
        <div className={`${container} grid gap-8 lg:grid-cols-2 lg:gap-14`}>
          <div>
            <h2 className={h2}>{t.caseUi.evidenceTitle}</h2>
            <ul className="mt-6 space-y-3">
              {EVIDENCE_ORDER.filter((k) => have.includes(k)).map((k) => (
                <li key={k} className="flex gap-3">
                  <span aria-hidden className={`mt-2 h-3 w-3 shrink-0 border ${st.border} ${st.bg}`} />
                  <span>
                    <span className="font-semibold">{t.work.evidence[k]}.</span>{" "}
                    <span className="text-ink-2">{t.caseUi.evidenceNotes[k]}</span>
                  </span>
                </li>
              ))}
            </ul>
            {c.evidenceNote ? <p className="prose-measure mt-5 text-ink-2">{c.evidenceNote}</p> : null}
          </div>
          <div>
            <h2 className={h2}>{t.caseUi.retro}</h2>
            <ul className="mt-6 space-y-3">
              {c.retro.map((r) => (
                <li key={r} className="border-l-2 border-ink pl-4">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className={`${container} flex flex-wrap items-baseline justify-between gap-4`}>
          <Link href={`/${locale}#trabajo`} className="underline underline-offset-4">
            {t.caseUi.back}
          </Link>
          <Link href={`/${locale}/work/${nextSlug}`} className="title text-[1.8rem] decoration-2 underline-offset-8 hover:underline">
            {t.cases[nextSlug].title}
          </Link>
        </div>
      </section>
    </article>
  );
}
