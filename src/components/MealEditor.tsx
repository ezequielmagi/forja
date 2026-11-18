"use client";

import { escalarItem, sumarItems, TIPO_LABEL } from "@/lib/nutrition";
import type { ItemComida, TipoComida } from "@/lib/types";
import { cx } from "@/lib/utils";
import { IconBasura, IconMas } from "./icons";

export const ITEM_VACIO: ItemComida = { nombre: "", gramos: 100, kcal: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

export function SelectorTipo({ valor, onChange }: { valor: TipoComida; onChange: (t: TipoComida) => void }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
      {(Object.keys(TIPO_LABEL) as TipoComida[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cx(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
            valor === t ? "border-chalk bg-chalk text-bg" : "border-line text-muted",
          )}
        >
          {TIPO_LABEL[t]}
        </button>
      ))}
    </div>
  );
}

/** Lista editable de alimentos con totales. Cambiar gramos re-escala kcal y macros. */
export function EditorItems({ items, onChange }: { items: ItemComida[]; onChange: (i: ItemComida[]) => void }) {
  const tot = sumarItems(items);
  const upd = (i: number, it: ItemComida) => onChange(items.map((x, j) => (j === i ? it : x)));
  const num = (v: string) => Math.max(0, Number(v.replace(",", ".")) || 0);

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface-2/60 p-3">
          <div className="flex items-center gap-2">
            <input
              value={it.nombre}
              onChange={(e) => upd(i, { ...it, nombre: e.target.value })}
              placeholder="Alimento"
              className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-dim"
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Quitar" className="text-dim hover:text-bad">
              <IconBasura size={18} />
            </button>
          </div>
          <div className="mt-2.5 grid grid-cols-5 gap-1.5 text-center">
            <Campo label="g" valor={it.gramos} onChange={(v) => upd(i, it.kcal ? escalarItem(it, num(v)) : { ...it, gramos: num(v) })} destacado />
            <Campo label="kcal" valor={it.kcal} onChange={(v) => upd(i, { ...it, kcal: num(v) })} />
            <Campo label="P" valor={it.proteinas} onChange={(v) => upd(i, { ...it, proteinas: num(v) })} color="text-prot" />
            <Campo label="C" valor={it.carbohidratos} onChange={(v) => upd(i, { ...it, carbohidratos: num(v) })} color="text-carb" />
            <Campo label="G" valor={it.grasas} onChange={(v) => upd(i, { ...it, grasas: num(v) })} color="text-gras" />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, { ...ITEM_VACIO }])}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-3 text-sm text-muted hover:text-chalk"
      >
        <IconMas size={16} /> Agregar alimento
      </button>

      <div className="flex items-center justify-between rounded-2xl bg-accent-soft px-4 py-3">
        <span className="display text-xl text-accent">{Math.round(tot.kcal)} kcal</span>
        <span className="num text-xs text-muted">
          <b className="text-prot">P {Math.round(tot.proteinas)}</b> · <b className="text-carb">C {Math.round(tot.carbohidratos)}</b> ·{" "}
          <b className="text-gras">G {Math.round(tot.grasas)}</b>
        </span>
      </div>
    </div>
  );
}

function Campo({ label, valor, onChange, color, destacado }: { label: string; valor: number; onChange: (v: string) => void; color?: string; destacado?: boolean }) {
  return (
    <label className={cx("rounded-xl px-1 py-1.5", destacado ? "bg-chalk/10" : "bg-bg/40")}>
      <input
        inputMode="decimal"
        value={Number.isFinite(valor) ? Math.round(valor * 10) / 10 : 0}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="num w-full bg-transparent text-center text-sm font-semibold outline-none"
      />
      <span className={cx("block text-[10px] uppercase tracking-wider", color ?? "text-dim")}>{label}</span>
    </label>
  );
}
