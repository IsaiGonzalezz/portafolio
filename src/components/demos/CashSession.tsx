"use client";

import { useReducer } from "react";
import { Instrument } from "../Instrument";
import { btnGhost, btnPrimary } from "../ui";
import type { Content } from "@/content/types";

type Entry = { kind: "sale" | "mixed" | "discount" | "abono"; cash: number; card: number };
type State = { step: 0 | 1 | 2 | 3 | 4; float: number; entries: Entry[]; withdrawals: number; counted: number | null };
type Action =
  | { type: "open" }
  | { type: "add"; entry: Entry }
  | { type: "withdraw" }
  | { type: "go"; step: State["step"] }
  | { type: "count"; value: number | null }
  | { type: "reset" };

const FLOAT = 500;
const initial: State = { step: 0, float: 0, entries: [], withdrawals: 0, counted: null };

const money = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "open":
      return { ...s, step: 1, float: FLOAT };
    case "add":
      return { ...s, entries: [...s.entries, a.entry] };
    case "withdraw":
      return { ...s, withdrawals: s.withdrawals + 300 };
    case "go":
      return { ...s, step: a.step, counted: a.step === 3 ? null : s.counted };
    case "count":
      return { ...s, counted: a.value };
    case "reset":
      return initial;
  }
}

export function CashSession({ t }: { t: Content["demos"]["cash"] }) {
  const [s, dispatch] = useReducer(reducer, initial);

  const cashIn = s.entries.reduce((a, e) => a + e.cash, 0);
  const cardIn = s.entries.reduce((a, e) => a + e.card, 0);
  const expected = s.float + cashIn - s.withdrawals;
  const counted = s.counted ?? expected;
  const diff = counted - expected;

  const add = (entry: Entry) => dispatch({ type: "add", entry });
  const line = (label: string, value: string, strong = false) => (
    <p className={`flex justify-between gap-4 ${strong ? "font-medium" : ""}`}>
      <span>{label}</span>
      <span className="num">{value}</span>
    </p>
  );

  return (
    <Instrument title={t.title} intro={t.intro}>
      <ol className="grid grid-cols-5 gap-1.5 text-[0.8rem] md:gap-2 md:text-[0.9rem]" aria-label={t.stepsLabel}>
        {t.steps.map((label, i) => (
          <li
            key={label}
            aria-current={s.step === i ? "step" : undefined}
            className={`rounded-md border px-2 py-2 md:px-3 ${
              s.step === i ? "border-amber text-amber" : i < s.step ? "border-panel-line text-paper/80" : "border-panel-line text-paper/40"
            }`}
          >
            <span className="num block text-[0.75rem] opacity-70">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <p className="min-h-[3rem] text-paper/75" aria-live="polite">
            {t.hints[s.step]}
          </p>

          {s.step === 0 ? (
            <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "open" })}>
              {t.open}
            </button>
          ) : null}

          {s.step === 1 ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnGhost} onClick={() => add({ kind: "sale", cash: 135, card: 0 })}>
                {t.sale}
              </button>
              <button type="button" className={btnGhost} onClick={() => add({ kind: "mixed", cash: 200, card: 280 })}>
                {t.mixed}
              </button>
              <button type="button" className={btnGhost} onClick={() => add({ kind: "discount", cash: 270, card: 0 })}>
                {t.discount}
              </button>
              <button type="button" className={btnGhost} onClick={() => add({ kind: "abono", cash: 250, card: 0 })}>
                {t.abono}
              </button>
              <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "go", step: 2 })}>
                {t.toWithdrawals}
              </button>
            </div>
          ) : null}

          {s.step === 2 ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnGhost} onClick={() => dispatch({ type: "withdraw" })}>
                {t.withdraw}
              </button>
              <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "go", step: 3 })}>
                {t.toCut}
              </button>
            </div>
          ) : null}

          {s.step === 3 ? (
            <div className="space-y-3">
              <label className="block max-w-xs text-[0.9rem] text-paper/65">
                {t.counted}
                <input
                  type="number"
                  inputMode="decimal"
                  className="mt-1 w-full rounded-md border border-panel-line bg-[#07090a] px-3 py-2 text-paper focus:border-amber"
                  value={counted}
                  onChange={(e) => dispatch({ type: "count", value: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </label>
              <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "go", step: 4 })}>
                {t.close}
              </button>
            </div>
          ) : null}

          {s.step === 4 ? (
            <button type="button" className={btnGhost} onClick={() => dispatch({ type: "reset" })}>
              {t.again}
            </button>
          ) : null}

          {s.entries.length > 0 ? (
            <ul className="max-h-36 space-y-1 overflow-auto text-[0.9rem] text-paper/65">
              {s.entries.map((e, i) => (
                <li key={i} className="num flex justify-between gap-3 border-t border-panel-line pt-1">
                  <span>{t.kinds[e.kind]}</span>
                  <span>
                    {e.cash ? `${t.cash} ${money(e.cash)}` : ""} {e.card ? `${t.card} ${money(e.card)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="thermal mx-auto w-[250px] px-4 pb-5 pt-4 text-[11px] leading-[1.5]" aria-label={t.receipt}>
          <p className="text-center text-[12px] font-medium">{t.receiptTitle}</p>
          <p className="text-center text-black/60">{t.branch}</p>
          <hr className="my-2 border-black/70" />
          {line(t.rFloat, money(s.float))}
          {line(t.rCash, money(cashIn))}
          {line(t.rCard, money(cardIn))}
          {line(t.rWithdrawals, `-${money(s.withdrawals)}`)}
          <hr className="my-2 border-black/70" />
          {line(t.rExpected, money(expected), true)}
          {s.step >= 3 ? line(t.rCounted, money(counted)) : null}
          {s.step >= 3 ? line(t.rDiff, `${diff >= 0 ? "+" : ""}${money(diff)}`, true) : null}
        </div>
      </div>
      <p className="mt-4 text-[0.85rem] text-paper/50">{t.footnote}</p>
    </Instrument>
  );
}
