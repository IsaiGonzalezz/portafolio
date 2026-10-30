"use client";

import { useEffect, useRef, useState } from "react";
import { Instrument } from "../Instrument";
import { btnGhost, btnPrimary } from "../ui";
import type { Content } from "@/content/types";

const TARGET = 10;
const FLOW = 1.5; // kg por segundo con la válvula abierta
const TICK = 50;

type Mode = "auto" | "manual";
type Run = { id: number; mode: Mode; final: number };

export function DosingDemo({ t }: { t: Content["demos"]["dosing"] }) {
  const [weight, setWeight] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [valve, setValve] = useState(false);
  const [latency, setLatency] = useState(250);
  const [runs, setRuns] = useState<Run[]>([]);

  const w = useRef(0);
  const closeAt = useRef<number | null>(null);
  const modeRef = useRef<Mode | null>(null);
  const latRef = useRef(latency);
  latRef.current = latency;

  const finish = () => {
    const m = modeRef.current;
    if (m) setRuns((r) => [{ id: Date.now(), mode: m, final: w.current }, ...r].slice(0, 6));
    modeRef.current = null;
    closeAt.current = null;
    setMode(null);
    setValve(false);
  };

  useEffect(() => {
    if (!mode) return;
    const id = setInterval(() => {
      const now = performance.now();
      const open = closeAt.current === null || now < closeAt.current;
      if (open) w.current += FLOW * (TICK / 1000);
      setWeight(Math.round(w.current * 1000) / 1000);
      if (modeRef.current === "auto" && closeAt.current === null) {
        // El sensor lee el peso y anticipa lo que caerá mientras el relevador responde.
        if (w.current >= TARGET - FLOW * (latRef.current / 1000)) closeAt.current = now + latRef.current;
      }
      if (modeRef.current === "manual" && closeAt.current === null && w.current >= TARGET * 2) closeAt.current = now;
      if (closeAt.current !== null && now >= closeAt.current) finish();
    }, TICK);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const start = (m: Mode) => {
    w.current = 0;
    closeAt.current = null;
    modeRef.current = m;
    setWeight(0);
    setValve(true);
    setMode(m);
  };

  // En manual, la persona decide cuándo parar y el relevador tarda en responder, igual que en automático.
  const stopManual = () => {
    if (modeRef.current === "manual" && closeAt.current === null) closeAt.current = performance.now() + latRef.current;
  };

  const err = (n: number) => `${n - TARGET >= 0 ? "+" : ""}${(n - TARGET).toFixed(3)} kg`;

  return (
    <Instrument title={t.title} intro={t.intro}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-panel-line bg-[#07090a] p-4">
            <div className="flex items-center justify-between text-[0.85rem] text-paper/55">
              <span>
                {t.target}: {TARGET.toFixed(3)} kg
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden className={`h-2 w-2 rounded-full ${valve ? "bg-[#5fd391]" : "bg-[#ff7a6b]"}`} />
                {valve ? t.valveOpen : t.valveClosed}
              </span>
            </div>
            <p className="num mt-2 text-right font-mono text-[3rem] font-medium leading-none text-amber">
              {weight.toFixed(3)}
              <span className="ml-2 text-[1rem] text-paper/50">kg</span>
            </p>
            <div className="relative mt-4 h-2 rounded-full bg-panel-2" aria-hidden>
              <div className="h-full rounded-full bg-amber" style={{ width: `${Math.min(100, (weight / (TARGET * 1.15)) * 100)}%` }} />
              <div className="absolute top-[-5px] h-[18px] w-[3px] rounded-sm bg-paper/80" style={{ left: `${(TARGET / (TARGET * 1.15)) * 100}%` }} />
            </div>
          </div>

          <label className="block text-[0.9rem] text-paper/75">
            <span className="flex justify-between">
              <span>{t.latency}</span>
              <span className="num text-amber">{latency} ms</span>
            </span>
            <input type="range" min={50} max={600} step={10} value={latency} disabled={mode !== null} onChange={(e) => setLatency(Number(e.target.value))} className="w-full accent-[#f7b928]" />
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={() => start("auto")} disabled={mode !== null}>
              {t.auto}
            </button>
            <button type="button" className={btnGhost} onClick={() => start("manual")} disabled={mode !== null}>
              {t.manual}
            </button>
            <button type="button" className={btnGhost} onClick={stopManual} disabled={mode !== "manual"}>
              {t.stop}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-panel-line p-4">
          <p className="text-[0.85rem] text-paper/55">{t.history}</p>
          {runs.length === 0 ? (
            <p className="mt-3 text-paper/45">{t.empty}</p>
          ) : (
            <ul className="mt-2">
              {runs.map((r) => (
                <li key={r.id} className="num flex justify-between gap-3 border-t border-panel-line py-2 text-[0.95rem]">
                  <span>{r.mode === "auto" ? t.autoLabel : t.manualLabel}</span>
                  <span className={Math.abs(r.final - TARGET) <= 0.05 ? "text-[#5fd391]" : "text-[#ff7a6b]"}>
                    {r.final.toFixed(3)} kg ({err(r.final)})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="mt-5 text-[0.85rem] text-paper/50">{t.note}</p>
    </Instrument>
  );
}
