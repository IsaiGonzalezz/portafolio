"use client";

import { useEffect, useReducer } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Instrument } from "../Instrument";
import { btnGhost, btnPrimary } from "../ui";
import type { Content } from "@/content/types";

type Who = "A" | "B";
type Status = 1 | 2 | 3;
type Row = { ing: string; cycle: number; pobj: number; preal: number | null };
type Log = { id: number; tone: "ok" | "warn" | "info"; text: string; sql?: string };

type State = {
  status: Status;
  holder: Who | null;
  idle: number; // segundos simulados desde el último latido
  tab: Record<Who, boolean>;
  rows: Row[];
  loaded: boolean;
  log: Log[];
  seq: number;
};

const LIMIT = 300;
const BASE_ROWS: Row[] = [
  { ing: "Dextrosa", cycle: 1, pobj: 25, preal: null },
  { ing: "Sal", cycle: 1, pobj: 1.2, preal: null },
  { ing: "Dextrosa", cycle: 2, pobj: 25, preal: null },
  { ing: "Sal", cycle: 2, pobj: 1.2, preal: null },
];

type Action =
  | { type: "take"; who: Who; msg: Content["demos"]["weigh"] }
  | { type: "race"; winner: Who; msg: Content["demos"]["weigh"] }
  | { type: "tick" }
  | { type: "tab"; who: Who }
  | { type: "refresh"; who: Who; msg: Content["demos"]["weigh"] }
  | { type: "capture"; noise: number; msg: Content["demos"]["weigh"] }
  | { type: "reset" };

const initial: State = {
  status: 1,
  holder: null,
  idle: 0,
  tab: { A: true, B: true },
  rows: BASE_ROWS,
  loaded: false,
  log: [],
  seq: 0,
};

const push = (s: State, tone: Log["tone"], text: string, sql?: string): State => ({
  ...s,
  seq: s.seq + 1,
  log: [{ id: s.seq + 1, tone, text, sql }, ...s.log].slice(0, 6),
});

function lock(s: State, who: Who, m: Content["demos"]["weigh"]): State {
  let n: State = { ...s, status: 2, holder: who, idle: 0 };
  n = push(n, "ok", m.logWin.replace("{who}", who), "UPDATE Produccion SET Estatus = 2 … WHERE OP = @op AND Estatus = 1  -- 1");
  if (!s.loaded) {
    n = { ...n, loaded: true };
    n = push(n, "info", m.logRows, "INSERT INTO Inventario … IF NOT EXISTS  -- ×4");
  } else {
    n = push(n, "info", m.logRowsExist, "IF NOT EXISTS … -- 0");
  }
  return n;
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "take": {
      if (s.status !== 1) {
        return push(s, "warn", a.msg.logLost.replace("{who}", a.who), "UPDATE Produccion … WHERE Estatus = 1  -- 0");
      }
      return lock(s, a.who, a.msg);
    }
    case "race": {
      if (s.status !== 1) return push(s, "warn", a.msg.logBusy);
      const loser: Who = a.winner === "A" ? "B" : "A";
      let n = lock(s, a.winner, a.msg);
      n = push(n, "warn", a.msg.logLost.replace("{who}", loser), "UPDATE Produccion … WHERE Estatus = 1  -- 0 → ROLLBACK, 409");
      return n;
    }
    case "tick": {
      if (s.status !== 2 || !s.holder) return s;
      return { ...s, idle: s.tab[s.holder] ? 0 : Math.min(LIMIT + 60, s.idle + 30) };
    }
    case "tab":
      return { ...s, tab: { ...s.tab, [a.who]: !s.tab[a.who] } };
    case "refresh": {
      if (s.status === 2 && s.idle >= LIMIT) {
        const n: State = { ...s, status: 1, holder: null, idle: 0 };
        return push(n, "ok", a.msg.logRelease.replace("{who}", a.who), "UPDATE Produccion SET Estatus = 1 … WHERE Estatus = 2 AND DATEDIFF(SECOND, UltimaActividad, GETDATE()) >= 300");
      }
      return push(s, "info", a.msg.logNothing.replace("{who}", a.who));
    }
    case "capture": {
      if (s.status !== 2) return s;
      const i = s.rows.findIndex((r) => r.preal === null);
      if (i < 0) return s;
      const rows = s.rows.map((r, k) => (k === i ? { ...r, preal: Math.round((r.pobj + a.noise) * 1000) / 1000 } : r));
      const done = rows.every((r) => r.preal !== null);
      let n: State = { ...s, rows, status: done ? 3 : 2, holder: done ? null : s.holder };
      n = push(n, "ok", a.msg.logCapture.replace("{n}", String(i + 1)));
      if (done) n = push(n, "ok", a.msg.logDone);
      return n;
    }
    case "reset":
      return { ...initial, seq: s.seq };
  }
}

export function WeighingSimulator({ t }: { t: Content["demos"]["weigh"] }) {
  const reduce = useReducedMotion();
  const [s, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    if (s.status !== 2) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [s.status]);

  const stale = s.status === 2 && s.idle >= LIMIT;
  const statusText = s.status === 1 ? t.s1 : s.status === 2 ? t.s2.replace("{who}", s.holder ?? "") : t.s3;
  const next = s.rows.findIndex((r) => r.preal === null);

  const operator = (who: Who) => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-panel-line p-3">
      <p className="min-w-[8.5rem] font-semibold">
        {t.operator} {who}
        {s.holder === who ? <span className="block text-[0.82rem] font-normal text-amber">{t.holding}</span> : null}
      </p>
      <button type="button" className={btnGhost} onClick={() => dispatch({ type: "take", who, msg: t })} disabled={s.status === 3}>
        {t.take}
      </button>
      <button type="button" className={btnGhost} onClick={() => dispatch({ type: "refresh", who, msg: t })}>
        {t.refresh}
      </button>
      <label className="flex basis-full cursor-pointer items-center gap-2 text-[0.9rem] text-paper/75">
        <input
          type="checkbox"
          checked={s.tab[who]}
          onChange={() => dispatch({ type: "tab", who })}
          className="h-4 w-4 accent-[#ffb224]"
        />
        {t.tabOpen}
      </label>
    </div>
  );

  return (
    <Instrument title={t.title} intro={t.intro}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-panel-line p-4" aria-live="polite">
            <p className="text-[0.85rem] text-paper/55">{t.order} OP-0421</p>
            <p className="title mt-1 text-[1.6rem] text-amber">{statusText}</p>
            <div className="mt-3 h-2 rounded-full bg-panel-2" aria-hidden>
              <div
                className={`h-full rounded-full ${stale ? "bg-[#ff7a6b]" : "bg-amber"}`}
                style={{ width: `${s.status === 2 ? Math.min(100, (s.idle / LIMIT) * 100) : 0}%`, transition: "width 0.9s linear" }}
              />
            </div>
            <p className="num mt-2 text-[0.85rem] text-paper/60">
              {t.idle}: {s.status === 2 ? s.idle : 0} / {LIMIT} s{" "}
              {stale ? <span className="text-[#ff7a6b]">{t.stale}</span> : null}
            </p>
            <p className="mt-1 text-[0.8rem] text-paper/40">{t.speed}</p>
          </div>

          <div className="space-y-3">
            {operator("A")}
            {operator("B")}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "race", winner: Math.random() < 0.5 ? "A" : "B", msg: t })} disabled={s.status !== 1}>
              {t.race}
            </button>
            <button type="button" className={btnGhost} onClick={() => dispatch({ type: "capture", noise: (Math.random() - 0.5) * 0.06, msg: t })} disabled={s.status !== 2 || next < 0}>
              {t.capture}
            </button>
            <button type="button" className={btnGhost} onClick={() => dispatch({ type: "reset" })}>
              {t.reset}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-panel-line">
            <table className="w-full min-w-[420px] text-left text-[0.9rem]">
              <caption className="px-3 pb-1 pt-3 text-left text-[0.85rem] text-paper/55">{t.table}</caption>
              <thead className="text-paper/55">
                <tr>
                  <th className="px-3 py-1.5 font-normal">{t.cols.ing}</th>
                  <th className="px-3 py-1.5 font-normal">{t.cols.cycle}</th>
                  <th className="px-3 py-1.5 text-right font-normal">{t.cols.target}</th>
                  <th className="px-3 py-1.5 text-right font-normal">{t.cols.actual}</th>
                  <th className="px-3 py-1.5 text-right font-normal">{t.cols.diff}</th>
                </tr>
              </thead>
              <tbody className="num">
                {s.loaded ? (
                  s.rows.map((r, i) => (
                    <tr key={i} className={`border-t border-panel-line ${i === next && s.status === 2 ? "bg-panel-2" : ""}`}>
                      <td className="px-3 py-1.5">{r.ing}</td>
                      <td className="px-3 py-1.5">{r.cycle}</td>
                      <td className="px-3 py-1.5 text-right">{r.pobj.toFixed(3)}</td>
                      <td className="px-3 py-1.5 text-right">{r.preal === null ? "NULL" : r.preal.toFixed(3)}</td>
                      <td className="px-3 py-1.5 text-right">
                        {r.preal === null ? "NULL" : (r.preal - r.pobj >= 0 ? "+" : "") + (r.preal - r.pobj).toFixed(3)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-panel-line">
                    <td colSpan={5} className="px-3 py-4 text-paper/45">
                      {t.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="min-h-[188px] rounded-lg border border-panel-line p-3" aria-live="polite">
            <p className="text-[0.85rem] text-paper/55">{t.logTitle}</p>
            <ul className="mt-2 space-y-2">
              <AnimatePresence initial={false}>
                {s.log.map((l) => (
                  <motion.li
                    key={l.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[0.9rem]"
                  >
                    <span className={l.tone === "ok" ? "text-[#5fd391]" : l.tone === "warn" ? "text-[#ff7a6b]" : "text-paper/70"}>{l.text}</span>
                    {l.sql ? <code className="mt-0.5 block overflow-x-auto whitespace-nowrap font-mono text-[0.72rem] text-paper/40">{l.sql}</code> : null}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>
    </Instrument>
  );
}
