"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Content, Locale } from "@/content/types";
import { KINDS, KIND_STYLE, PROJECT_KIND, asKind, type Kind } from "./kinds";

const PHYSICAL = ["scale", "rfid", "labelprinter", "posprinter", "sensors"] as const;
const SOFTWARE = ["api", "license", "agent", "django", "firebase", "mqtt", "mobile"] as const;

const LINKS: Record<string, string[]> = {
  scale: ["api"],
  rfid: ["api"],
  labelprinter: ["agent"],
  posprinter: ["django"],
  sensors: ["mqtt", "firebase"],
  api: ["scale", "rfid", "license"],
  license: ["api"],
  agent: ["labelprinter"],
  django: ["posprinter", "firebase"],
  firebase: ["sensors", "django", "mobile"],
  mqtt: ["sensors"],
  mobile: ["firebase"],
};

type Line = { id: string; d: string; color: string };

const hexOf = (project: string) => KIND_STYLE[PROJECT_KIND[project] ?? "professional"].hex;
const inkOf = (project: string) => KIND_STYLE[PROJECT_KIND[project] ?? "professional"].inkHex;

export function SystemsMap({
  t,
  locale,
  kindLabels,
}: {
  t: Content["map"];
  locale: Locale;
  kindLabels: Record<Kind, { title: string }>;
}) {
  const [active, setActive] = useState<string>("scale");
  const [lines, setLines] = useState<Line[]>([]);
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const nodes = useRef<Record<string, HTMLButtonElement | null>>({});

  const nodeText = t.nodes as Record<string, Content["map"]["nodes"]["scale"]>;
  const connected = new Set(LINKS[active] ?? []);

  const measure = useCallback(() => {
    const box = wrap.current;
    if (!box || window.innerWidth < 1024) {
      setLines([]);
      return;
    }
    const origin = box.getBoundingClientRect();
    const out: Line[] = [];
    const pair = (phys: string, soft: string) => {
      const a = nodes.current[phys]?.getBoundingClientRect();
      const b = nodes.current[soft]?.getBoundingClientRect();
      if (!a || !b) return;
      const x1 = a.left + a.width / 2 - origin.left;
      const y1 = a.bottom - origin.top;
      const x2 = b.left + b.width / 2 - origin.left;
      const y2 = b.top - origin.top;
      const mid = (y1 + y2) / 2;
      out.push({
        id: `${phys}-${soft}`,
        d: `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`,
        color: hexOf((nodeText[phys]?.projects as string[])[0] ?? "formulacion"),
      });
    };
    for (const p of PHYSICAL) {
      for (const s of LINKS[p] ?? []) {
        if ((SOFTWARE as readonly string[]).includes(s)) {
          if (p === active || s === active) pair(p, s);
        }
      }
    }
    setLines(out);
  }, [active]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [measure]);

  const button = (id: string) => {
    const isActive = id === active;
    const isLinked = connected.has(id);
    const n = nodeText[id];
    return (
      <button
        key={id}
        type="button"
        ref={(el) => {
          nodes.current[id] = el;
        }}
        onClick={() => setActive(id)}
        aria-pressed={isActive}
        style={isLinked && !isActive ? { borderColor: inkOf((n.projects as string[])[0]), color: inkOf((n.projects as string[])[0]) } : undefined}
        className={`relative h-full w-full overflow-hidden border px-3 pb-2.5 pt-3.5 text-left transition-colors ${
          isActive
            ? "border-ink bg-ink text-paper"
            : isLinked
              ? "bg-paper"
              : "border-rule bg-paper text-ink hover:border-ink/50"
        }`}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 flex h-[4px]">
          {(n.projects as string[]).map((p) => (
            <span key={p} className="flex-1" style={{ background: hexOf(p) }} />
          ))}
        </span>
        <span className="block font-semibold leading-tight">{n.name}</span>
        <span className={`mt-0.5 block text-[0.82rem] leading-tight ${isActive ? "text-paper/70" : "text-ink-2"}`}>
          {n.via}
        </span>
      </button>
    );
  };

  const current = nodeText[active];
  const slugs = current.projects as string[];

  return (
    <div>
      <div ref={wrap} className="relative">
        <ul className="mb-6 flex flex-wrap gap-x-6 gap-y-1 text-[0.9rem] text-ink-2">
          {KINDS.map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span aria-hidden className={`h-3 w-3 ${KIND_STYLE[k].bg}`} />
              {kindLabels[k].title}
            </li>
          ))}
        </ul>
        <p className="mb-2 text-[0.95rem] text-ink-2">{t.physical}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{PHYSICAL.map(button)}</div>
        <div className="h-16 lg:h-24" aria-hidden />
        <p className="mb-2 text-[0.95rem] text-ink-2">{t.software}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">{SOFTWARE.map(button)}</div>

        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block">
          {lines.map((l) => (
            <motion.path
              key={l.id}
              d={l.d}
              fill="none"
              stroke={l.color}
              strokeWidth={2}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          ))}
        </svg>
      </div>

      <div className="mt-8 grid gap-6 border-t border-ink pt-6 md:grid-cols-[1.4fr_1fr]" aria-live="polite">
        <div>
          <h3 className="title text-[1.9rem]">{current.name}</h3>
          <p className="mt-1 text-ink-2">{current.via}</p>
          <p className="prose-measure mt-3">{current.text}</p>
        </div>
        <div className="text-[0.95rem]">
          <p className="font-semibold">{t.connectsTo}</p>
          <ul className="mt-1 text-ink-2">
            {[...connected].map((id) => (
              <li key={id}>{nodeText[id].name}</li>
            ))}
          </ul>
          <p className="mt-4 font-semibold">{t.project}</p>
          <ul className="mt-1">
            {slugs.map((slug) => (
              <li key={slug}>
                <Link
                  className={`font-medium underline underline-offset-4 ${KIND_STYLE[asKind(PROJECT_KIND[slug] ?? "professional")].text}`}
                  href={`/${locale}/work/${slug}`}
                >
                  {t.projectNames[slug as keyof typeof t.projectNames]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
