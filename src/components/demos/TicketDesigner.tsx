"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Instrument } from "../Instrument";
import { Code128 } from "../Code128";
import { btnGhost } from "../ui";
import type { Content } from "@/content/types";

type Tipo = "texto" | "caja" | "imagen" | "codigoBarra";
type El = {
  id: string;
  tipo: Tipo;
  contenido: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  negritas?: boolean;
  grosorBorde?: number;
  zIndex: number;
};

type Mode = "ticket" | "etiqueta";

const txt = (id: string, contenido: string, x: number, y: number, ancho: number, alto: number, fontSize: number, textAlign: El["textAlign"], negritas = false): El => ({
  id, tipo: "texto", contenido, x, y, ancho, alto, fontSize, textAlign, negritas, grosorBorde: 0, zIndex: 10,
});
const box = (id: string, x: number, y: number, ancho: number, alto: number, grosorBorde: number): El => ({
  id, tipo: "caja", contenido: "", x, y, ancho, alto, grosorBorde, zIndex: 5,
});

const TICKET: El[] = [
  { id: "logo", tipo: "imagen", contenido: "{{logo}}", x: 76, y: 15, ancho: 150, alto: 60, zIndex: 10 },
  txt("empresa", "{{nom_emp}}", 10, 85, 282, 30, 20, "center", true),
  txt("rfc", "RFC: {{rfc}}", 10, 120, 282, 20, 12, "center"),
  box("linea1", 15, 150, 272, 2, 2),
  txt("op", "OP: {{op}} | Form: {{formula}}", 10, 165, 282, 20, 14, "center", true),
  txt("ing-label", "INGREDIENTE:", 10, 205, 282, 20, 14, "center"),
  txt("ing", "{{ingrediente}}", 10, 230, 282, 40, 28, "center", true),
  box("linea2", 15, 285, 272, 2, 2),
  txt("bruto", "Peso Bruto: {{p_bruto}} kg", 20, 310, 262, 20, 14, "left"),
  txt("tara", "Peso Tara: {{p_tara}} kg", 20, 340, 262, 20, 14, "left"),
  txt("neto", "Peso Neto: {{p_neto}} kg", 20, 380, 262, 30, 22, "left", true),
  { id: "barras", tipo: "codigoBarra", contenido: "{{op}}", x: 51, y: 440, ancho: 200, alto: 60, zIndex: 10 },
  txt("fecha", "{{fecha_hora}}", 10, 520, 282, 20, 12, "center"),
];

const ETIQUETA: El[] = [
  box("marco", 15, 15, 348, 253, 3),
  { id: "logo", tipo: "imagen", contenido: "{{logo}}", x: 30, y: 30, ancho: 80, alto: 50, zIndex: 10 },
  txt("empresa", "{{nom_emp}}", 120, 30, 220, 25, 18, "right", true),
  txt("rfc", "RFC: {{rfc}}", 120, 60, 220, 20, 12, "right"),
  txt("ing", "{{ingrediente}}", 30, 100, 318, 35, 28, "center", true),
  txt("op", "OP: {{op}} | Form: {{formula}}", 30, 145, 318, 20, 14, "center", true),
  txt("pesos", "B: {{p_bruto}}kg  |  T: {{p_tara}}kg  |  N: {{p_neto}}kg", 30, 175, 318, 25, 15, "center", true),
  { id: "barras", tipo: "codigoBarra", contenido: "{{op}}", x: 89, y: 210, ancho: 200, alto: 40, zIndex: 10 },
  txt("fecha", "{{fecha_hora}}", 30, 255, 318, 15, 10, "center"),
];

const PAPER: Record<Mode, { w: number; h: number; mm: string }> = {
  ticket: { w: 302, h: 567, mm: "80 × 150 mm" },
  etiqueta: { w: 378, h: 283, mm: "100 × 75 mm" },
};

const VARS_INIT: Record<string, string> = {
  op: "OP-0421",
  formula: "F-118",
  ingrediente: "DEXTROSA",
  p_bruto: "26.232",
  p_tara: "1.250",
  p_neto: "24.982",
  nom_emp: "Empresa Demo S.A. de C.V.",
  rfc: "XAXX010101000",
  fecha_hora: "29/10/26 21:20",
  logo: "LOGO",
};

const resolve = (s: string, vars: Record<string, string>) =>
  s.replace(/\{\{([^}]+)\}\}/g, (_, k: string) => vars[k.trim()] ?? "");

const ZOOM = 0.78;

export function TicketDesigner({ t }: { t: Content["demos"]["ticket"] }) {
  const [mode, setMode] = useState<Mode>("ticket");
  const [els, setEls] = useState<Record<Mode, El[]>>({ ticket: TICKET, etiqueta: ETIQUETA });
  const [vars, setVars] = useState(VARS_INIT);
  const [sel, setSel] = useState<string>("ing");

  const list = els[mode];
  const paper = PAPER[mode];
  const selected = list.find((e) => e.id === sel) ?? list[0];

  const patch = (changes: Partial<El>) =>
    setEls((p) => ({ ...p, [mode]: p[mode].map((e) => (e.id === selected.id ? { ...e, ...changes } : e)) }));

  const json = useMemo(() => JSON.stringify(selected, null, 2), [selected]);
  const varKeys = ["op", "formula", "ingrediente", "p_bruto", "p_tara", "p_neto", "nom_emp", "rfc"];

  const input = "w-full rounded-md border border-panel-line bg-[#07090a] px-2.5 py-1.5 text-[0.9rem] text-paper focus:border-amber";

  return (
    <Instrument title={t.title} intro={t.intro}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["ticket", "etiqueta"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => {
              setMode(m);
              setSel("ing");
            }}
            className={`rounded-md border px-3 py-1.5 text-[0.9rem] ${mode === m ? "border-amber text-amber" : "border-panel-line text-paper/70 hover:border-paper/40"}`}
          >
            {t.modes[m]}
          </button>
        ))}
        <span className="num ml-1 text-[0.85rem] text-paper/50">{paper.mm}</span>
        <button
          type="button"
          className={`${btnGhost} ml-auto`}
          onClick={() => {
            setEls({ ticket: TICKET, etiqueta: ETIQUETA });
            setVars(VARS_INIT);
          }}
        >
          {t.reset}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="self-start overflow-auto rounded-lg bg-paper-2 p-4">
          <div style={{ width: paper.w * ZOOM, height: paper.h * ZOOM }} className="relative mx-auto bg-[#fbfbf8] shadow-[0_1px_0_rgb(0_0_0/0.1)]">
            <div style={{ width: paper.w, height: paper.h, transform: `scale(${ZOOM})`, transformOrigin: "top left" }} className="absolute left-0 top-0 text-black">
              {list.map((e) => {
                const on = e.id === selected.id;
                const style: CSSProperties = {
                  position: "absolute",
                  left: e.x,
                  top: e.y,
                  width: e.ancho,
                  height: e.alto,
                  zIndex: e.zIndex,
                  boxSizing: "border-box",
                };
                return (
                  <div
                    key={e.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${e.tipo}: ${e.id}`}
                    onClick={() => setSel(e.id)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        setSel(e.id);
                      }
                    }}
                    style={{ ...style, outline: on ? "2px solid #2340c8" : "none", outlineOffset: 1, cursor: "pointer" }}
                  >
                    {e.tipo === "texto" ? (
                      <div
                        style={{
                          fontSize: e.fontSize,
                          fontWeight: e.negritas ? 700 : 400,
                          textAlign: e.textAlign,
                          justifyContent: e.textAlign === "center" ? "center" : e.textAlign === "right" ? "flex-end" : "flex-start",
                          lineHeight: 1,
                        }}
                        className="flex h-full w-full items-center overflow-hidden whitespace-nowrap"
                      >
                        {resolve(e.contenido, vars)}
                      </div>
                    ) : null}
                    {e.tipo === "caja" ? <div className="h-full w-full bg-transparent" style={{ border: `${e.grosorBorde ?? 1}px solid #000` }} /> : null}
                    {e.tipo === "imagen" ? (
                      <div className="flex h-full w-full items-center justify-center border border-dashed border-black/30 text-[11px] text-black/45">
                        {resolve(e.contenido, vars)}
                      </div>
                    ) : null}
                    {e.tipo === "codigoBarra" ? <Code128 value={resolve(e.contenido, vars) || "-"} className="h-full w-full" /> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <div>
            <p className="text-[0.85rem] text-paper/55">{t.variables}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {varKeys.map((k) => (
                <label key={k} className="block text-[0.8rem] text-paper/55">
                  <span className="font-mono">{`{{${k}}}`}</span>
                  <input className={`${input} mt-0.5`} value={vars[k]} onChange={(e) => setVars({ ...vars, [k]: e.target.value })} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.85rem] text-paper/55">
              {t.element}: <span className="font-mono text-paper/80">{selected.id}</span> ({selected.tipo})
            </p>
            <div className="mt-2 grid grid-cols-[1fr_auto_auto] items-end gap-2">
              <label className="block text-[0.8rem] text-paper/55">
                {t.content}
                <input
                  className={`${input} mt-0.5 font-mono`}
                  value={selected.contenido}
                  disabled={selected.tipo === "caja"}
                  onChange={(e) => patch({ contenido: e.target.value })}
                />
              </label>
              <label className="block text-[0.8rem] text-paper/55">
                {t.size}
                <input
                  type="number"
                  min={8}
                  max={48}
                  className={`${input} mt-0.5 w-20`}
                  value={selected.fontSize ?? 0}
                  disabled={selected.tipo !== "texto"}
                  onChange={(e) => patch({ fontSize: Math.max(8, Math.min(48, Number(e.target.value) || 8)) })}
                />
              </label>
              <label className="flex items-center gap-2 pb-2 text-[0.9rem] text-paper/75">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#ffb224]"
                  checked={Boolean(selected.negritas)}
                  disabled={selected.tipo !== "texto"}
                  onChange={(e) => patch({ negritas: e.target.checked })}
                />
                {t.bold}
              </label>
            </div>
          </div>

          <pre aria-label="JSON" className="max-h-64 overflow-auto rounded-lg bg-[#07090a] p-3 font-mono text-[0.75rem] leading-5 text-paper/80">
            {json}
          </pre>
          <p className="text-[0.85rem] text-paper/50">{t.footnote}</p>
        </div>
      </div>
    </Instrument>
  );
}
