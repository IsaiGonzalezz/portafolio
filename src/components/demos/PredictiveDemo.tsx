"use client";

import { useEffect, useRef, useState } from "react";
import { Instrument } from "../Instrument";
import { btnGhost } from "../ui";
import type { Content } from "@/content/types";

const N = 90;
const LEARN = 40;
const Y_MIN = 0.6;
const Y_MAX = 3.4;

const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const y = (v: number, h: number) => h - ((Math.min(Math.max(v, Y_MIN), Y_MAX) - Y_MIN) / (Y_MAX - Y_MIN)) * h;

export function PredictiveDemo({ t }: { t: Content["demos"]["predictive"] }) {
  const [vib, setVib] = useState<number[]>([]);
  const [temp, setTemp] = useState(40);
  const [wear, setWear] = useState(0);
  const [base, setBase] = useState<{ mean: number; std: number } | null>(null);
  const wearRef = useRef(0);
  const learn = useRef<number[]>([]);
  const baseRef = useRef<{ mean: number; std: number } | null>(null);
  wearRef.current = wear;

  useEffect(() => {
    const id = setInterval(() => {
      const w = baseRef.current ? wearRef.current : 0;
      const v = 1 + w * 0.014 + gauss() * 0.06 * (1 + w * 0.012);
      setTemp(40 + w * 0.2 + gauss() * 0.4);
      setVib((p) => [...p.slice(-(N - 1)), v]);
      if (!baseRef.current) {
        learn.current.push(v);
        if (learn.current.length >= LEARN) {
          const mean = learn.current.reduce((a, b) => a + b, 0) / learn.current.length;
          const std = Math.sqrt(learn.current.reduce((a, b) => a + (b - mean) ** 2, 0) / learn.current.length);
          baseRef.current = { mean, std };
          setBase({ mean, std });
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, []);

  const reset = () => {
    learn.current = [];
    baseRef.current = null;
    setBase(null);
    setVib([]);
    setWear(0);
  };

  const upper = base ? base.mean + 3 * base.std : 0;
  const last3 = vib.slice(-3);
  const alert = Boolean(base) && last3.length === 3 && last3.every((v) => v > upper);
  const progress = Math.min(100, Math.round((learn.current.length / LEARN) * 100));

  const W = 300;
  const H = 110;
  const line = vib.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (N - 1)) * W} ${y(v, H)}`).join(" ");

  return (
    <Instrument title={t.title} intro={t.intro}>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-lg border border-panel-line p-4">
          <div className="flex items-baseline justify-between text-[0.85rem] text-paper/55">
            <span>{t.vibration}</span>
            <span className="num font-mono text-paper/80">
              {t.temperature}: {temp.toFixed(1)} °C
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-2 h-36 w-full" role="img" aria-label={t.vibration}>
            {base ? (
              <rect x="0" width={W} y={y(upper, H)} height={y(base.mean - 3 * base.std, H) - y(upper, H)} fill="#2f5fd0" opacity="0.22" />
            ) : null}
            <path d={line} fill="none" stroke={alert ? "#ff7a6b" : "#f7b928"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="mt-2 text-[0.82rem] text-paper/50">{t.band}</p>
        </div>

        <div className="space-y-4">
          <div
            role="status"
            className={`rounded-lg border p-4 ${!base ? "border-panel-line" : alert ? "border-[#ff7a6b] bg-[#ff7a6b]/10" : "border-[#5fd391]/60 bg-[#5fd391]/5"}`}
          >
            {!base ? (
              <>
                <p className="font-semibold">{t.learning}</p>
                <div className="mt-2 h-2 rounded-full bg-panel-2" aria-hidden>
                  <div className="h-full rounded-full bg-amber" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : alert ? (
              <>
                <p className="font-semibold text-[#ff7a6b]">{t.alertTitle}</p>
                <p className="mt-1 text-[0.9rem] text-paper/75">{t.alertText}</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-[#5fd391]">{t.okTitle}</p>
                <p className="mt-1 text-[0.9rem] text-paper/75">{t.okText}</p>
              </>
            )}
          </div>

          <label className={`block text-[0.9rem] ${base ? "text-paper/75" : "text-paper/35"}`}>
            <span className="flex justify-between">
              <span>{t.wear}</span>
              <span className="num text-amber">{wear}</span>
            </span>
            <input type="range" min={0} max={100} value={wear} disabled={!base} onChange={(e) => setWear(Number(e.target.value))} className="w-full accent-[#f7b928]" />
          </label>
          <button type="button" className={btnGhost} onClick={reset}>
            {t.reset}
          </button>
        </div>
      </div>
      <p className="mt-5 text-[0.85rem] text-paper/50">{t.note}</p>
    </Instrument>
  );
}
