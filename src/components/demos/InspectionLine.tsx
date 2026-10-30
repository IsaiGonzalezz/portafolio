"use client";

import { useEffect, useMemo, useState } from "react";
import { Instrument } from "../Instrument";
import { btnGhost, btnPrimary } from "../ui";
import type { Content } from "@/content/types";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

type Item = { id: number; kind: "fruit" | "bottle"; bad: boolean; score: number; temp: number };

function makeBatch(seed: number, n = 48): Item[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, id) => {
    const bad = r() < 0.3;
    return {
      id,
      kind: r() < 0.5 ? "fruit" : "bottle",
      bad,
      score: clamp((bad ? 68 : 34) + gauss(r) * 17, 0, 100),
      temp: (bad ? 41 : 35) + gauss(r) * 3.5,
    };
  });
}

const MARGIN = 15;

export function InspectionLine({ t }: { t: Content["demos"]["inspection"] }) {
  const [seed, setSeed] = useState(7);
  const [threshold, setThreshold] = useState(50);
  const [useTemp, setUseTemp] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(40);
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);

  const items = useMemo(() => makeBatch(seed), [seed]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setShown((s) => {
        if (s + 1 >= items.length) {
          setRunning(false);
          return items.length;
        }
        return s + 1;
      });
    }, 55);
    return () => clearInterval(id);
  }, [running, items.length]);

  const reject = (i: Item) =>
    i.score >= threshold || (useTemp && i.score >= threshold - MARGIN && i.temp >= tempThreshold);

  const seen = items.slice(0, shown);
  const caught = seen.filter((i) => i.bad && reject(i)).length;
  const missed = seen.filter((i) => i.bad && !reject(i)).length;
  const falseReject = seen.filter((i) => !i.bad && reject(i)).length;
  const okAccept = seen.filter((i) => !i.bad && !reject(i)).length;

  const run = () => {
    setShown(0);
    setRunning(true);
  };

  const slider = "w-full accent-[#f7b928]";
  const stat = (label: string, value: number, tone: string) => (
    <div className="rounded-md border border-panel-line p-3">
      <dt className="text-[0.85rem] text-paper/55">{label}</dt>
      <dd className={`num mt-0.5 text-[1.6rem] font-medium ${tone}`}>{value}</dd>
    </div>
  );

  return (
    <Instrument title={t.title} intro={t.intro}>
      <div
        className="rounded-lg border border-panel-line bg-[#07090a] p-4"
        role="img"
        aria-label={t.belt}
      >
        <div className="flex flex-wrap gap-x-2 gap-y-3">
          {items.map((i) => {
            const revealed = i.id < shown;
            const rej = reject(i);
            return (
              <span
                key={i.id}
                className={`relative flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 ${
                  revealed ? (rej ? "ring-2 ring-[#ff7a6b]" : "ring-2 ring-[#5fd391]") : "opacity-40"
                }`}
              >
                {i.kind === "fruit" ? (
                  <span className="block h-3.5 w-7 -rotate-[24deg] rounded-full bg-yellow" />
                ) : (
                  <span className="block h-7 w-3.5 rounded-t-md rounded-b-[3px] bg-[#7aa6e0]" />
                )}
                {i.bad ? (
                  <span aria-hidden className="absolute h-[2px] w-5 rotate-[35deg] bg-black/80" />
                ) : null}
              </span>
            );
          })}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.82rem] text-paper/60">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm ring-2 ring-[#5fd391]" aria-hidden />
            {t.accepted}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm ring-2 ring-[#ff7a6b]" aria-hidden />
            {t.rejected}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-[2px] w-4 rotate-[35deg] bg-paper/80" aria-hidden />
            {t.defect}
          </li>
        </ul>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-[0.9rem] text-paper/75">
            <span className="flex justify-between">
              <span>{t.threshold}</span>
              <span className="num text-amber">{threshold}</span>
            </span>
            <input type="range" min={20} max={80} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className={slider} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[0.9rem] text-paper/75">
            <input type="checkbox" checked={useTemp} onChange={(e) => setUseTemp(e.target.checked)} className="h-4 w-4 accent-[#f7b928]" />
            {t.useTemp}
          </label>
          <label className={`block text-[0.9rem] ${useTemp ? "text-paper/75" : "text-paper/35"}`}>
            <span className="flex justify-between">
              <span>{t.tempThreshold}</span>
              <span className="num text-amber">{tempThreshold} °C</span>
            </span>
            <input type="range" min={34} max={46} step={0.5} value={tempThreshold} disabled={!useTemp} onChange={(e) => setTempThreshold(Number(e.target.value))} className={slider} />
          </label>
          <p className="text-[0.85rem] text-paper/50">{t.rule.replace("{m}", String(MARGIN))}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={run} disabled={running}>
              {t.run}
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => {
                setSeed((s) => s + 11);
                setShown(0);
                setRunning(false);
              }}
            >
              {t.newBatch}
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 self-start" aria-live="polite">
          {stat(t.caught, caught, "text-[#5fd391]")}
          {stat(t.missed, missed, "text-[#ff7a6b]")}
          {stat(t.falseReject, falseReject, "text-amber")}
          {stat(t.okAccept, okAccept, "text-paper")}
        </dl>
      </div>
      <p className="mt-5 text-[0.85rem] text-paper/50">{t.note}</p>
    </Instrument>
  );
}
