import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { EvidenceLegend, EvidenceMeter } from "@/components/Evidence";
import { HeroScale } from "@/components/HeroScale";
import { Journey } from "@/components/Journey";
import { SystemsMap } from "@/components/SystemsMap";
import { KINDS, KIND_STYLE, asKind } from "@/components/kinds";
import { container } from "@/components/ui";
import { getContent } from "@/content";
import { isLocale } from "@/lib/i18n";
import { hasContact, site } from "@/lib/site";

const h2 = "title text-[clamp(2.4rem,5vw,4rem)]";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getContent(locale);
  const { email, github, linkedin } = site.contact;

  return (
    <>
      <section className="blueprint-grid border-b border-rule">
        <div className={`${container} grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:py-20`}>
          <div className="flex flex-col justify-between gap-10">
            <h1 className="display text-[clamp(3.1rem,7.4vw,6.4rem)]">{t.hero.headline}</h1>
            <div>
              <p className="max-w-[46ch] text-[1.2rem] leading-relaxed text-ink-2">{t.hero.sub}</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
                <a
                  href="#trabajo"
                  className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper transition-colors hover:bg-blue"
                >
                  {t.hero.cta}
                </a>
                <Link
                  href={`/${locale}/work/formulacion#demos`}
                  className="underline decoration-2 underline-offset-[6px] hover:text-blue"
                >
                  {t.hero.cta2}
                </Link>
              </div>
            </div>
          </div>
          <HeroScale t={t.hero.scale} locale={locale} />
        </div>
      </section>

      <section id="trabajo" className="scroll-mt-16 border-b border-rule py-16 md:py-24">
        <div className={container}>
          <h2 className={h2}>{t.work.title}</h2>
          <p className="prose-measure mt-4 text-ink-2">{t.work.intro}</p>
          <div className="mt-6">
            <p className="mb-2 text-[0.9rem] font-semibold">{t.work.legend}</p>
            <EvidenceLegend labels={t.work.evidence} />
          </div>

          {KINDS.map((k) => {
            const g = t.work.groups[k];
            const st = KIND_STYLE[k];
            const rows = t.work.rows.filter((r) => asKind(r.kind) === k);
            return (
              <div key={k} className="mt-14 first:mt-10">
                <div className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-[3px] pb-3 ${st.border}`}>
                  <span aria-hidden className={`h-4 w-4 self-center ${st.bg}`} />
                  <h3 className="title text-[clamp(1.8rem,3vw,2.4rem)]">{g.title}</h3>
                  <p className="text-ink-2">{g.text}</p>
                </div>
                <ul>
                  {rows.map((r) => (
                    <li key={r.slug} className="border-b border-rule">
                      <Link
                        href={`/${locale}/work/${r.slug}`}
                        className={`group grid gap-5 border-l-[6px] py-9 pl-5 transition-colors hover:bg-paper-2/60 md:grid-cols-[1.1fr_1.3fr_0.9fr] md:gap-10 ${st.rowBar}`}
                      >
                        <div>
                          <h4 className="title text-[clamp(1.9rem,3.2vw,2.7rem)] decoration-2 underline-offset-8 group-hover:underline">
                            {r.name}
                          </h4>
                          <p className="mt-3 text-[0.95rem] text-ink-2">{r.role}</p>
                          <p className="text-[0.95rem] text-ink-2">{r.period}</p>
                        </div>
                        <div>
                          <p className="prose-measure">{r.line}</p>
                          <ul className="mt-3 space-y-0.5 text-[0.95rem] text-ink-2">
                            {r.facts.map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="md:text-right">
                          <EvidenceMeter have={r.evidence} labels={t.work.evidence} kind={k} />
                          <p className="mt-3 text-[0.95rem]">{r.stack.join(", ")}</p>
                          <p className={`mt-2 font-semibold ${st.text}`}>{r.status}</p>
                          <span className="mt-3 inline-block underline underline-offset-4">{t.work.open}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section id="sistemas" className="scroll-mt-16 border-b border-rule py-16 md:py-24">
        <div className={container}>
          <h2 className={h2}>{t.map.title}</h2>
          <p className="prose-measure mt-4 text-ink-2">{t.map.intro}</p>
          <div className="mt-10">
            <SystemsMap t={t.map} locale={locale} kindLabels={t.work.groups} />
          </div>
        </div>
      </section>

      <section className="border-b border-rule py-16 md:py-24">
        <div className={container}>
          <h2 className={h2}>{t.principles.title}</h2>
          <p className="prose-measure mt-4 text-ink-2">{t.principles.intro}</p>
          <div className="mt-10 border-t border-ink">
            {t.principles.items.map((item) => (
              <article key={item.title} className="grid gap-6 border-b border-rule py-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
                <div>
                  <h3 className="title text-[1.9rem]">{item.title}</h3>
                  <p className="prose-measure mt-3 text-ink-2">{item.body}</p>
                </div>
                <div className="min-w-0">
                  {item.code ? (
                    <CodeBlock code={item.code} label={t.principles.codeLabel} />
                  ) : (
                    <ul className="space-y-2 border-l-2 border-blue pl-4">
                      {item.list.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rule py-16 md:py-24">
        <div className={container}>
          <h2 className={h2}>{t.journey.title}</h2>
          <div className="mt-10">
            <Journey t={t.journey} />
          </div>
        </div>
      </section>

      <section className="border-b border-rule py-16 md:py-24">
        <div className={`${container} grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14`}>
          <div>
            <span aria-hidden className="mb-4 block h-2 w-16 bg-red" />
            <h2 className={h2}>{t.ai.title}</h2>
            <p className="prose-measure mt-4 text-[1.15rem]">{t.ai.lead}</p>
          </div>
          <div>
            <p className="prose-measure text-ink-2">{t.ai.note}</p>
            <Link
              href={`/${locale}/ai`}
              className="mt-5 inline-block font-semibold underline decoration-red decoration-2 underline-offset-4"
            >
              {t.ai.more}
            </Link>
          </div>
        </div>
      </section>

      {hasContact ? (
        <section id="contacto" className="scroll-mt-16 py-16 md:py-24">
          <div className={container}>
            <h2 className={h2}>{t.contact.title}</h2>
            <p className="prose-measure mt-4 text-ink-2">{t.contact.intro}</p>
            <ul className="mt-8 space-y-2 text-[1.15rem]">
              {email ? (
                <li>
                  <a className="underline underline-offset-4" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
              ) : null}
              {github ? (
                <li>
                  <a className="underline underline-offset-4" href={github} rel="noopener noreferrer">
                    {t.contact.github}
                  </a>
                </li>
              ) : null}
              {linkedin ? (
                <li>
                  <a className="underline underline-offset-4" href={linkedin} rel="noopener noreferrer">
                    {t.contact.linkedin}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
