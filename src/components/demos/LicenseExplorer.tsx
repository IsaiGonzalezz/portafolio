"use client";

import { useReducer } from "react";
import { Instrument } from "../Instrument";
import { btnGhost, btnPrimary } from "../ui";
import type { Content } from "@/content/types";

type Status = "none" | "active" | "expired" | "tamper" | "inactive";
type NoteKey =
  | "activated"
  | "alreadyActive"
  | "advanced"
  | "rolled"
  | "pending"
  | "synced"
  | "nothingToSync"
  | "seatTaken"
  | "seatFull"
  | "seatFree"
  | "stored"
  | "storageFull"
  | "needActive";

type State = {
  activated: boolean;
  start: number;
  today: number;
  last: number;
  pending: boolean;
  remote: boolean;
  status: Status;
  sessions: number;
  storage: number;
  note: NoteKey | null;
};

type Action =
  | { type: "activate" }
  | { type: "days"; n: number }
  | { type: "remote" }
  | { type: "sync" }
  | { type: "open" }
  | { type: "login" }
  | { type: "logout" }
  | { type: "fill" }
  | { type: "reset" };

const VALID_DAYS = 90;
const SEATS = 3;
const STORAGE_MB = 512;

const initial: State = {
  activated: false,
  start: 0,
  today: 10,
  last: 0,
  pending: false,
  remote: true,
  status: "none",
  sessions: 1,
  storage: 120,
  note: null,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "activate":
      if (s.activated) return { ...s, note: "alreadyActive" };
      return { ...s, activated: true, start: s.today, last: s.today, status: "active", note: "activated" };
    case "days":
      return { ...s, today: s.today + a.n, note: a.n > 0 ? "advanced" : "rolled" };
    case "remote":
      return { ...s, pending: true, note: "pending" };
    case "sync":
      if (!s.pending) return { ...s, note: "nothingToSync" };
      return { ...s, pending: false, remote: false, note: "synced" };
    case "open": {
      if (!s.activated) return { ...s, status: "none", note: null };
      if (!s.remote) return { ...s, status: "inactive", note: null };
      if (s.today > s.start + VALID_DAYS) return { ...s, status: "expired", note: null };
      if (s.today < s.last) return { ...s, status: "tamper", note: null };
      return { ...s, status: "active", last: s.today, note: null };
    }
    case "login":
      if (s.status !== "active") return { ...s, note: "needActive" };
      if (s.sessions >= SEATS) return { ...s, note: "seatFull" };
      return { ...s, sessions: s.sessions + 1, note: "seatTaken" };
    case "logout":
      return { ...s, sessions: Math.max(0, s.sessions - 1), note: "seatFree" };
    case "fill":
      if (s.storage + 100 > STORAGE_MB) return { ...s, note: "storageFull" };
      return { ...s, storage: s.storage + 100, note: "stored" };
    case "reset":
      return initial;
  }
}

const ORDER: Status[] = ["none", "active", "expired", "tamper", "inactive"];

export function LicenseExplorer({ t }: { t: Content["demos"]["license"] }) {
  const [s, dispatch] = useReducer(reducer, initial);
  const notes = t.notes as Record<NoteKey, string>;
  const msgs = t.msg as Record<Status, string>;
  const states = t.states as Record<Status, string>;
  const ok = s.status === "active";

  return (
    <Instrument title={t.title} intro={t.intro}>
      <ol className="grid grid-cols-2 gap-2 md:grid-cols-5" aria-label={t.statesLabel}>
        {ORDER.map((k) => (
          <li
            key={k}
            aria-current={s.status === k ? "step" : undefined}
            className={`rounded-md border px-3 py-2 text-[0.9rem] transition-colors ${
              s.status === k
                ? k === "active"
                  ? "border-[#5fd391] bg-[#5fd391]/10 text-[#5fd391]"
                  : k === "none"
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-[#ff7a6b] bg-[#ff7a6b]/10 text-[#ff7a6b]"
                : "border-panel-line text-paper/45"
            }`}
          >
            {states[k]}
          </li>
        ))}
      </ol>

      <div className="mt-4 min-h-[3.5rem] rounded-lg border border-panel-line p-4" aria-live="polite">
        <p className={ok ? "text-[#5fd391]" : "text-paper"}>{msgs[s.status]}</p>
        {s.note ? <p className="mt-1 text-[0.9rem] text-paper/60">{notes[s.note]}</p> : null}
      </div>

      <dl className="num mt-4 grid grid-cols-2 gap-3 text-[0.9rem] md:grid-cols-4">
        <div className="rounded-md border border-panel-line p-3">
          <dt className="text-paper/55">{t.clock}</dt>
          <dd className="mt-0.5 text-[1.15rem]">
            {t.day} {s.today}
          </dd>
        </div>
        <div className="rounded-md border border-panel-line p-3">
          <dt className="text-paper/55">{t.expires}</dt>
          <dd className="mt-0.5 text-[1.15rem]">{s.activated ? `${t.day} ${s.start + VALID_DAYS}` : "-"}</dd>
        </div>
        <div className="rounded-md border border-panel-line p-3">
          <dt className="text-paper/55">{t.sessions}</dt>
          <dd className="mt-0.5 text-[1.15rem]">
            {s.sessions} / {SEATS}
          </dd>
        </div>
        <div className="rounded-md border border-panel-line p-3">
          <dt className="text-paper/55">{t.storage}</dt>
          <dd className="mt-0.5 text-[1.15rem]">
            {s.storage} / {STORAGE_MB} MB
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <p className="text-[0.85rem] text-paper/55">{t.groupInstall}</p>
          <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "activate" })}>
            {t.activate}
          </button>
          <button type="button" className={`${btnGhost} block`} onClick={() => dispatch({ type: "open" })}>
            {t.open}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-[0.85rem] text-paper/55">{t.groupTime}</p>
          <button type="button" className={btnGhost} onClick={() => dispatch({ type: "days", n: 30 })}>
            {t.forward}
          </button>
          <button type="button" className={`${btnGhost} block`} onClick={() => dispatch({ type: "days", n: -5 })}>
            {t.back}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-[0.85rem] text-paper/55">{t.groupCentral}</p>
          <button type="button" className={btnGhost} onClick={() => dispatch({ type: "remote" })}>
            {t.deactivate}
          </button>
          <button type="button" className={`${btnGhost} block`} onClick={() => dispatch({ type: "sync" })}>
            {t.sync}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-[0.85rem] text-paper/55">{t.groupUse}</p>
          <button type="button" className={btnGhost} onClick={() => dispatch({ type: "login" })}>
            {t.login}
          </button>
          <button type="button" className={`${btnGhost} block`} onClick={() => dispatch({ type: "logout" })}>
            {t.logout}
          </button>
          <button type="button" className={`${btnGhost} block`} onClick={() => dispatch({ type: "fill" })}>
            {t.fill}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-panel-line pt-4 text-[0.85rem] text-paper/50">
        <p className="max-w-[60ch]">{t.footnote}</p>
        <button type="button" className={btnGhost} onClick={() => dispatch({ type: "reset" })}>
          {t.reset}
        </button>
      </div>
    </Instrument>
  );
}
