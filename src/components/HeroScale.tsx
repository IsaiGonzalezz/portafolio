"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { ThermalTicket } from "./ThermalTicket";
import { btnGhost, btnLight, btnPrimary } from "./ui";
import type { Content } from "@/content/types";

const TARGET = 25;
const TOL = 0.05;
const TARE = 1.25;
const SCALE_MAX = TARGET * 1.1;

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const fmt = (n: number) => n.toFixed(3);

type Mode = "idle" | "pour" | "drip";
type Printed = { id: number; net: number; gross: number; at: string };

export function HeroScale({ t, locale }: { t: Content["hero"]["scale"]; locale: string }) {
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const [mode, setMode] = useState<Mode>("idle");
  const [stable, setStable] = useState(true);
  const [printed, setPrinted] = useState<Printed | null>(null);
  const script = useRef<{ stop: () => void } | null>(null);

  const stopScript = useCallback(() => {
    script.current?.stop();
    script.current = null;
  }, []);

  // Secuencia de entrada: la báscula recibe material y se estabiliza.
  useEffect(() => {
    if (reduce) {
      setW(24.917);
      return;
    }
    const controls = animate(0, 24.917, {
      duration: 2.8,
      delay: 0.5,
      ease: [0.22, 0.8, 0.25, 1],
      onUpdate: (v) => setW(r3(v)),
    });
    script.current = controls;
    return () => controls.stop();
  }, [reduce]);

  useEffect(() => {
    if (mode === "idle") return;
    const id = setInterval(() => {
      const rate = mode === "pour" ? 0.2 + Math.random() * 0.08 : 0.004 + Math.random() * 0.003;
      setW((p) => r3(Math.min(60, p + rate)));
    }, 50);
    return () => clearInterval(id);
  }, [mode]);

  useEffect(() => {
    setStable(false);
    const id = setTimeout(() => setStable(true), 650);
    return () => clearTimeout(id);
  }, [w]);

  // Un toque suelta una porción inmediata; mantener presionado sigue vertiendo.
  const pulse = (m: Mode) => setW((p) => r3(Math.min(60, p + (m === "pour" ? 0.25 : 0.01))));

  const hold = (m: Mode) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      stopScript();
      pulse(m);
      setMode(m);
    },
    onPointerUp: () => setMode("idle"),
    onPointerCancel: () => setMode("idle"),
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        stopScript();
        pulse(m);
        setMode(m);
      }
    },
    onKeyUp: () => setMode("idle"),
    onBlur: () => setMode("idle"),
  });

  const capture = () => {
    stopScript();
    setMode("idle");
    setPrinted({
      id: Date.now(),
      net: w,
      gross: r3(w + TARE),
      at: new Date().toLocaleString(locale === "es" ? "es-MX" : "en-US", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    });
  };

  const diff = r3(w - TARGET);
  const within = Math.abs(diff) <= TOL;
  const over = diff > TOL;
  const tone = w === 0 ? "text-amber" : within ? "text-[#5fd391]" : over ? "text-[#ff7a6b]" : "text-amber";
  const fillPct = Math.min(100, (w / SCALE_MAX) * 100);
  const targetPct = (TARGET / SCALE_MAX) * 100;
  const bandPct = Math.max(1.4, ((TOL * 2) / SCALE_MAX) * 100);

  return (
    <div className="on-dark">
      <div className="rounded-[14px] border border-panel-line bg-panel p-5 text-paper shadow-[0_30px_60px_-30px_rgb(15_17_19/0.55)] md:p-6">
        <div className="flex items-center justify-between text-[0.85rem] text-paper/60">
          <span>{t.label}</span>
          <span className="flex items-center gap-2" aria-live="polite">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${stable ? "bg-[#5fd391]" : "animate-pulse bg-amber"}`}
            />
            {stable ? t.stable : t.unstable}
          </span>
        </div>

        <div
          className="mt-4 rounded-lg border border-panel-line bg-[#07090a] px-4 py-5"
          role="group"
          aria-label={t.label}
        >
          <p
            className={`num text-right font-mono text-[clamp(3.2rem,9vw,5.2rem)] font-medium leading-none tracking-tight ${tone}`}
            style={{ textShadow: "0 0 22px rgb(255 178 36 / 0.28)" }}
            aria-label={`${fmt(w)} kg`}
          >
            {fmt(w).split(".")[0]}
            <span className="mx-[-0.14em]">.</span>
            {fmt(w).split(".")[1]}
            <span className="ml-2 text-[1.1rem] text-paper/50">{t.unit}</span>
          </p>

          <div className="relative mt-5 h-2 rounded-full bg-panel-2" aria-hidden>
            <div
              className={`h-full rounded-full ${within ? "bg-[#5fd391]" : over ? "bg-[#ff7a6b]" : "bg-amber"}`}
              style={{ width: `${fillPct}%` }}
            />
            <div
              className="absolute top-[-5px] h-[18px] rounded-sm bg-paper/80"
              style={{ left: `calc(${targetPct}% - ${bandPct / 2}%)`, width: `${bandPct}%` }}
            />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.9rem]">
          <div>
            <dt className="text-paper/50">{t.order}</dt>
            <dd className="font-medium">{t.ingredient}</dd>
          </div>
          <div>
            <dt className="text-paper/50">{t.target}</dt>
            <dd className="num font-medium">{fmt(TARGET)} kg</dd>
          </div>
          <div>
            <dt className="text-paper/50">{t.diff}</dt>
            <dd className="num font-medium">
              {diff > 0 ? "+" : ""}
              {fmt(diff)} kg
            </dd>
          </div>
          <div>
            <dt className="text-paper/50">{t.tolerance}</dt>
            <dd className={`font-medium ${within ? "text-[#5fd391]" : "text-paper"}`}>
              {w === 0 ? "±" + TOL.toFixed(3) + " kg" : within ? t.within : t.outside}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className={`${btnPrimary} touch-none`} {...hold("pour")}>
            {t.pour}
          </button>
          <button type="button" className={`${btnGhost} touch-none`} {...hold("drip")}>
            {t.drip}
          </button>
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              stopScript();
              setW(0);
            }}
          >
            {t.reset}
          </button>
          <button type="button" className={`${btnLight} ml-auto`} onClick={capture} disabled={w <= 0}>
            {t.capture}
          </button>
        </div>
        <p className="mt-3 text-[0.85rem] text-paper/55">{t.hint}</p>
      </div>

      <motion.div
        initial={false}
        animate={{ height: printed ? 332 : 84 }}
        transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
        className="mt-3 flex justify-center overflow-hidden rounded-[10px] border border-dashed border-ink/25 md:justify-start md:pl-6"
      >
        <AnimatePresence mode="wait">
          {printed ? (
            <motion.div
              key={printed.id}
              initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", y: -14 }}
              animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
              transition={{ duration: reduce ? 0 : 1.2, ease: "linear" }}
            >
              <ThermalTicket
                labels={{
                  ingredient: t.ticket.ingredient,
                  gross: t.ticket.gross,
                  tare: t.ticket.tare,
                  net: t.ticket.net,
                }}
                data={{
                  company: t.ticket.company,
                  rfc: "XAXX010101000",
                  order: "OP-0421",
                  formula: "F-118",
                  ingredient: t.ingredient.toUpperCase(),
                  gross: fmt(printed.gross),
                  tare: fmt(TARE),
                  net: fmt(printed.net),
                  at: printed.at,
                }}
              />
            </motion.div>
          ) : (
            <p className="self-center px-6 text-center text-[0.9rem] text-ink-2 md:text-left">
              {t.tray}
            </p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
