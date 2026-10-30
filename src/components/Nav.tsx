"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Content, Locale } from "@/content/types";
import { container } from "./ui";

export function Nav({
  locale,
  t,
  showContact,
  name,
}: {
  locale: Locale;
  t: Content["nav"];
  showContact: boolean;
  name: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const other: Locale = locale === "es" ? "en" : "es";
  const rest = pathname.replace(/^\/(es|en)/, "");
  const link =
    "py-1 text-[0.95rem] text-ink-2 underline-offset-[6px] decoration-2 hover:text-ink hover:underline";
  const current = (p: string) => pathname === `/${locale}${p}`;

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-3 py-2 text-paper focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        {t.skip}
      </a>
      <div className={`${container} flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3`}>
        <Link href={`/${locale}`} className="title text-[1.35rem]">
          {name}
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link href={`/${locale}#trabajo`} className={link}>
            {t.work}
          </Link>
          <Link href={`/${locale}#sistemas`} className={link}>
            {t.map}
          </Link>
          <Link
            href={`/${locale}/ai`}
            className={`${link} ${current("/ai") ? "text-ink underline" : ""}`}
            aria-current={current("/ai") ? "page" : undefined}
          >
            {t.ai}
          </Link>
          <Link
            href={`/${locale}/about`}
            className={`${link} ${current("/about") ? "text-ink underline" : ""}`}
            aria-current={current("/about") ? "page" : undefined}
          >
            {t.about}
          </Link>
          {showContact ? (
            <Link href={`/${locale}#contacto`} className={link}>
              {t.contact}
            </Link>
          ) : null}
          <Link
            href={`/${other}${rest}`}
            hrefLang={other}
            lang={other}
            className="rounded-md border border-ink/25 px-2.5 py-1 text-[0.9rem] hover:border-ink"
          >
            {t.language}
          </Link>
        </nav>
      </div>
    </header>
  );
}
