import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Journey } from "@/components/Journey";
import { container } from "@/components/ui";
import { getContent } from "@/content";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getContent(locale);
  return { title: t.about.title, description: t.about.lead, alternates: { canonical: `/${locale}/about` } };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getContent(locale);

  return (
    <>
      <header className="blueprint-grid border-b border-rule">
        <div className={`${container} py-14 md:py-24`}>
          <h1 className="display text-[clamp(3rem,8vw,6.6rem)]">{t.about.title}</h1>
          <p className="prose-measure mt-6 text-[1.25rem] leading-relaxed">{t.about.lead}</p>
        </div>
      </header>

      <section className="border-b border-rule py-14 md:py-20">
        <div className={`${container} grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-14`}>
          <h2 className="title text-[clamp(2rem,4vw,3rem)]">{t.about.residencyTitle}</h2>
          <p className="prose-measure text-[1.1rem]">{t.about.residencyText}</p>
        </div>
      </section>

      <section className="border-b border-rule py-14 md:py-20">
        <div className={container}>
          <h2 className="title text-[clamp(2rem,4vw,3rem)]">{t.about.stackTitle}</h2>
          <p className="prose-measure mt-4 text-ink-2">{t.about.stackIntro}</p>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            {t.about.stack.map((g) => (
              <div key={g.area}>
                <h3 className="title border-b border-ink pb-2 text-[1.5rem]">{g.area}</h3>
                <ul>
                  {g.items.map((i) => (
                    <li key={i.name} className="border-b border-rule py-3">
                      <p className="font-semibold leading-snug">{i.name}</p>
                      <p className="text-[0.95rem] text-ink-2">{i.where}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className={container}>
          <h2 className="title text-[clamp(2rem,4vw,3rem)]">{t.journey.title}</h2>
          <div className="mt-8">
            <Journey t={t.journey} />
          </div>
        </div>
      </section>
    </>
  );
}
