import type { Content } from "@/content/types";
import { site } from "@/lib/site";
import { container } from "./ui";

export function Footer({ t }: { t: Content["footer"] }) {
  const { email, github, linkedin } = site.contact;
  return (
    <footer className="border-t border-rule py-10 text-[0.95rem] text-ink-2">
      <div className={`${container} flex flex-col gap-4 md:flex-row md:justify-between`}>
        <div className="max-w-[56ch]">
          <p className="title text-[1.2rem] text-ink">{site.name}</p>
          <p className="mt-1">{t.built}</p>
          <p>{t.note}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 md:justify-end">
          {email ? (
            <li>
              <a className="underline underline-offset-4 hover:text-ink" href={`mailto:${email}`}>
                {email}
              </a>
            </li>
          ) : null}
          {github ? (
            <li>
              <a className="underline underline-offset-4 hover:text-ink" href={github} rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          ) : null}
          {linkedin ? (
            <li>
              <a className="underline underline-offset-4 hover:text-ink" href={linkedin} rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </footer>
  );
}
