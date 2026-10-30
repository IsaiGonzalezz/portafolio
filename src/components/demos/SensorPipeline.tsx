"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Instrument } from "../Instrument";
import { btnGhost, btnPrimary } from "../ui";
import type { Content } from "@/content/types";

const BASE = 420;
const LEAK = 1750;
const N = 48;
const MAX = 2000;

function path(values: number[], w: number, h: number) {
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (N - 1)) * w} ${h - (Math.min(v, MAX) / MAX) * h}`)
    .join(" ");
}

function Chart({ values, className }: { values: number[]; className?: string }) {
  return (
    <svg viewBox="0 0 300 110" preserveAspectRatio="none" className={className} aria-hidden>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2="300" y1={110 * g} y2={110 * g} stroke="#2a3036" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={path(values, 300, 110)} fill="none" stroke="#ffb224" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function SensorPipeline({ t }: { t: Content["demos"]["sensors"] }) {
  const reduce = useReducedMotion();
  const [values, setValues] = useState<number[]>(() => Array.from({ length: N }, (_, i) => BASE + Math.sin(i / 3) * 12));
  const [leak, setLeak] = useState(false);
  const [flame, setFlame] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const leakRef = useRef(false);
  const lastRef = useRef(BASE);
  leakRef.current = leak;

  useEffect(() => {
    const id = setInterval(() => {
      const target = leakRef.current ? LEAK : BASE;
      const next = Math.max(0, lastRef.current + (target - lastRef.current) * 0.16 + (Math.random() - 0.5) * 14);
      lastRef.current = next;
      setValues((prev) => [...prev.slice(1), next]);
      setLog((l) => [`sensor/metano ${Math.round(next)}`, ...l].slice(0, 5));
      setTick((x) => x + 1);
    }, 800);
    return () => clearInterval(id);
  }, []);

  const toggleFlame = () => {
    const n = !flame;
    setFlame(n);
    setLog((l) => [`sensor/fuego ${n ? 1 : 0}`, ...l].slice(0, 5));
  };

  const current = Math.round(values[values.length - 1]);
  const chip = "relative rounded-md border border-panel-line px-3 py-2 text-[0.9rem]";

  return (
    <Instrument title={t.title} intro={t.intro}>
      <div className="flex flex-wrap items-stretch gap-2 text-paper/85" aria-label={t.flow}>
        <div className={chip}>{t.sensors}</div>
        <span aria-hidden className="self-center text-paper/40">/</span>
        <div className={chip}>{t.board}</div>
        <span aria-hidden className="self-center text-paper/40">/</span>
        <div className={chip}>
          {t.mqtt}
          <motion.span key={`m${tick}`} aria-hidden initial={reduce ? false : { opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} className="pointer-events-none absolute inset-0 rounded-md border border-amber" />
        </div>
        <div className={chip}>
          {t.firestore}
          <motion.span key={`f${tick}`} aria-hidden initial={reduce ? false : { opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} className="pointer-events-none absolute inset-0 rounded-md border border-amber" />
        </div>
        <span aria-hidden className="self-center text-paper/40">/</span>
        <div className={chip}>{t.web}</div>
        <div className={chip}>{t.mobile}</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_auto]">
        <div className="space-y-4">
          <div className="rounded-lg border border-panel-line p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[0.85rem] text-paper/55">{t.webTitle}</p>
              <p className="num font-mono text-[1.4rem] text-amber">
                {current} <span className="text-[0.8rem] text-paper/50">{t.unit}</span>
              </p>
            </div>
            <Chart values={values} className="mt-2 h-32 w-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} aria-pressed={leak} onClick={() => setLeak((l) => !l)}>
              {leak ? t.stopLeak : t.leak}
            </button>
            <button type="button" className={btnGhost} aria-pressed={flame} onClick={toggleFlame}>
              {flame ? t.stopFlame : t.flame}
            </button>
          </div>

          <div className="min-h-[7.5rem] rounded-lg border border-panel-line p-3">
            <p className="text-[0.85rem] text-paper/55">{t.logTitle}</p>
            <ul className="mt-1.5 font-mono text-[0.78rem] leading-5 text-paper/70">
              {log.map((l, i) => (
                <li key={`${l}-${i}`} className={i === 0 ? "text-paper" : ""}>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto w-[228px]" aria-label={t.phone}>
          <div className="relative overflow-hidden rounded-[26px] border-[5px] border-[#272d33] bg-black p-3 pb-4">
            <AnimatePresence>
              {flame ? (
                <motion.div
                  role="alert"
                  initial={reduce ? false : { y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  className="absolute inset-x-2 top-2 z-10 rounded-xl bg-paper px-3 py-2 text-ink shadow-lg"
                >
                  <p className="text-[0.75rem] font-semibold">{t.alertTitle}</p>
                  <p className="text-[0.8rem] leading-tight">{t.alertBody}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <p className="mt-6 text-center text-[0.8rem] text-paper/85">{t.appTitle}</p>
            <Chart values={values} className="mt-3 h-24 w-full" />
            <p className="num mt-2 text-center font-mono text-[1.1rem] text-amber">{current}</p>
            <p className="mt-2 text-center text-[0.72rem] text-paper/45">{t.biometric}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-[0.85rem] text-paper/50">{t.footnote}</p>
    </Instrument>
  );
}
