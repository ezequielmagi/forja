"use client";

import { useMemo, useState } from "react";
import { useCaptura } from "@/components/AppShell";
import { EditorItems, SelectorTipo } from "@/components/MealEditor";
import { Barra, Button, Card, Ring, Sheet, Vacio } from "@/components/ui";
import { IconAtras, IconBasura, IconCamara, IconFlecha, IconLapiz } from "@/components/icons";
import { TIPO_LABEL, objetivos, sumarItems, totalesDia } from "@/lib/nutrition";
import { useFoto, useStore } from "@/lib/store";
import type { Comida, TipoComida } from "@/lib/types";
import { cx, fechaLarga, hora, hoyISO, sumarDias } from "@/lib/utils";

const ORDEN: TipoComida[] = ["desayuno", "almuerzo", "merienda", "cena", "snack"];

export default function ComidaPage() {
  const { estado, editarComida, borrarComida } = useStore();
  const { abrirCaptura } = useCaptura();
  const hoy = hoyISO();
  const [fecha, setFecha] = useState(hoy);
  const [editando, setEditando] = useState<Comida | null>(null);

  const obj = objetivos(estado.perfil!);
  const tot = totalesDia(estado.comidas, fecha);
  const delDia = estado.comidas.filter((c) => c.fecha === fecha).sort((a, b) => a.hora - b.hora);

  const semana = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const f = sumarDias(fecha, i - 6);
        return { f, kcal: totalesDia(estado.comidas, f).kcal, letra: "DLMMJVS"[new Date(f + "T12:00").getDay()] };
      }),
    [estado.comidas, fecha],
  );
  const conDatos = semana.filter((d) => d.kcal > 0);
  const promedio = conDatos.length ? Math.round(conDatos.reduce((a, d) => a + d.kcal, 0) / conDatos.length) : 0;
  const maxBarra = Math.max(obj.kcal * 1.25, ...semana.map((d) => d.kcal));

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <button onClick={() => setFecha(sumarDias(fecha, -1))} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Día anterior">
          <IconAtras size={18} />
        </button>
        <div className="text-center">
          <p className="eyebrow text-accent">{fecha === hoy ? "Hoy" : fecha === sumarDias(hoy, -1) ? "Ayer" : "Comida"}</p>
          <h1 className="display text-2xl">{fechaLarga(fecha)}</h1>
        </div>
        <button onClick={() => setFecha(sumarDias(fecha, 1))} disabled={fecha >= hoy} className="grid h-10 w-10 place-items-center rounded-full border border-line disabled:opacity-30" aria-label="Día siguiente">
          <IconFlecha size={18} />
        </button>
      </header>

      <Card className="p-5">
        <div className="flex items-center gap-5">
          <Ring valor={tot.kcal} max={obj.kcal} size={120}>
            <div>
              <span className="display num block text-3xl">{Math.round(tot.kcal)}</span>
              <span className="num text-[10px] text-muted">/ {obj.kcal} kcal</span>
            </div>
          </Ring>
          <div className="flex-1 space-y-3">
            <Barra label="Proteína" valor={tot.proteinas} max={obj.proteinas} color="var(--color-prot)" />
            <Barra label="Carbos" valor={tot.carbohidratos} max={obj.carbohidratos} color="var(--color-carb)" />
            <Barra label="Grasas" valor={tot.grasas} max={obj.grasas} color="var(--color-gras)" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Button onClick={() => abrirCaptura("foto", fecha)}><IconCamara size={18} /> Sacar foto</Button>
          <Button variant="ghost" onClick={() => abrirCaptura("manual", fecha)}><IconLapiz size={16} /> A mano</Button>
        </div>
      </Card>

      {delDia.length === 0 ? (
        <Vacio titulo="Nada cargado" texto="Sacale una foto a lo que vas a comer y la IA calcula calorías y macros." />
      ) : (
        <div className="space-y-4">
          {ORDEN.filter((t) => delDia.some((c) => c.tipo === t)).map((t) => {
            const lista = delDia.filter((c) => c.tipo === t);
            const kcal = sumarItems(lista.flatMap((c) => c.items)).kcal;
            return (
              <section key={t}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="display text-xl">{TIPO_LABEL[t]}</h2>
                  <span className="num text-xs text-muted">{Math.round(kcal)} kcal</span>
                </div>
                <div className="space-y-2">
                  {lista.map((c) => <FilaComida key={c.id} c={c} onClick={() => setEditando(c)} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Últimos 7 días</p>
          {promedio > 0 && <p className="num text-xs text-muted">Promedio <b className="text-chalk">{promedio}</b> kcal</p>}
        </div>
        <div className="relative mt-4 flex h-32 items-end gap-2">
          <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-accent/50" style={{ bottom: `${(obj.kcal / maxBarra) * 100}%` }}>
            <span className="num absolute -top-4 right-0 text-[10px] text-accent">{obj.kcal}</span>
          </div>
          {semana.map((d) => (
            <button key={d.f} onClick={() => setFecha(d.f)} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className={cx("w-full rounded-t-md transition-all", d.f === fecha ? "bg-accent" : d.kcal > obj.kcal * 1.05 ? "bg-warn/60" : "bg-chalk/25")}
                style={{ height: `${Math.max(d.kcal ? 4 : 0, (d.kcal / maxBarra) * 100)}%` }}
              />
              <span className={cx("text-[10px]", d.f === fecha ? "text-accent" : "text-dim")}>{d.letra}</span>
            </button>
          ))}
        </div>
      </Card>

      <Sheet
        abierto={!!editando}
        onCerrar={() => setEditando(null)}
        titulo="Editar comida"
        pie={
          editando && (
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <Button variant="danger" onClick={async () => { await borrarComida(editando.id); setEditando(null); }} aria-label="Borrar">
                <IconBasura size={18} />
              </Button>
              <Button onClick={() => { editarComida(editando); setEditando(null); }}>Guardar cambios</Button>
            </div>
          )
        }
      >
        {editando && (
          <div className="space-y-4">
            <FotoGrande c={editando} />
            <SelectorTipo valor={editando.tipo} onChange={(t) => setEditando({ ...editando, tipo: t })} />
            <input value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} className="field" />
            <EditorItems items={editando.items} onChange={(items) => setEditando({ ...editando, items })} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

function FilaComida({ c, onClick }: { c: Comida; onClick: () => void }) {
  const foto = useFoto(c.id, c.tieneFoto);
  const t = sumarItems(c.items);
  return (
    <button onClick={onClick} className="card flex w-full items-center gap-3 p-2.5 text-left">
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-surface-2 text-dim"><IconLapiz size={18} /></span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{c.titulo}</span>
        <span className="num block text-xs text-dim">
          {hora(c.hora)} · <span className="text-prot">P{Math.round(t.proteinas)}</span> <span className="text-carb">C{Math.round(t.carbohidratos)}</span> <span className="text-gras">G{Math.round(t.grasas)}</span>
        </span>
      </span>
      <span className="display num shrink-0 pr-1 text-xl">{Math.round(t.kcal)}</span>
    </button>
  );
}

function FotoGrande({ c }: { c: Comida }) {
  const foto = useFoto(c.id, c.tieneFoto);
  if (!foto) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={foto} alt="" className="aspect-[16/9] w-full rounded-2xl object-cover" />;
}
