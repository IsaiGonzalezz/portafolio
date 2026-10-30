import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/components/ui";
import { getContent } from "@/content";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getContent(locale);
  return { title: t.ai.title, description: t.ai.lead, alternates: { canonical: `/${locale}/ai` } };
}

export default async function AiPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getContent(locale);

  return (
    <>
      <header className="blueprint-grid border-b border-t-[10px] border-b-rule border-t-red">
        <div className={`${container} py-14 md:py-24`}>
          <h1 className="display max-w-[14ch] text-[clamp(3rem,8vw,6.6rem)]">{t.ai.title}</h1>
          <p className="prose-measure mt-6 text-[1.25rem] leading-relaxed">{t.ai.lead}</p>
        </div>
      </header>
      <section className="py-14 md:py-20">
        <div className={container}>
          <ul className="border-t border-ink">
            {t.ai.blocks.map((b) => (
              <li key={b.title} className="grid gap-3 border-b border-rule py-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
                <h2 className="title text-[1.8rem]">{b.title}</h2>
                <p className="prose-measure text-[1.1rem]">{b.text}</p>
              </li>
            ))}
          </ul>
          <p className="prose-measure mt-10 text-[1.15rem] font-medium">{t.ai.note}</p>
          <Link href={`/${locale}`} className="mt-8 inline-block underline decoration-red decoration-2 underline-offset-4">
            {t.caseUi.back}
          </Link>
        </div>
      </section>
    </>
  );
}
