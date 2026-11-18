"use client";

import { useMemo, useState } from "react";
import { CADENA_POR_ID, EJERCICIOS, NIVEL_LABEL, PATRON_LABEL, POR_ID, disponible, faltante, objetivoTexto } from "@/lib/catalog";
import { ultimaEntrada, useStore } from "@/lib/store";
import type { Ejercicio, Patron } from "@/lib/types";
import { cx, fechaCorta } from "@/lib/utils";
import { Button, Chip, Sheet } from "./ui";
import { IconBuscar, IconCheck } from "./icons";

export function Nivel({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={NIVEL_LABEL[n]}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cx("h-2.5 w-1 rounded-full", i <= n ? "bg-accent" : "bg-line")} />
      ))}
    </span>
  );
}

export function ExerciseDetail({
  ejercicioId,
  onCerrar,
  onElegir,
  accion,
}: {
  ejercicioId: string | null;
  onCerrar: () => void;
  onElegir?: (id: string) => void;
  accion?: React.ReactNode;
}) {
  const { estado } = useStore();
  const [verId, setVerId] = useState<string | null>(null);
  const id = verId ?? ejercicioId;
  const e = id ? POR_ID[id] : null;
  const equipo = estado.perfil?.equipo ?? [];

  const cerrar = () => {
    setVerId(null);
    onCerrar();
  };

  if (!e) return <Sheet abierto={false} onCerrar={cerrar}>{null}</Sheet>;
  const cadena = CADENA_POR_ID[e.cadena];
  const falta = faltante(e, equipo);
  const previa = ultimaEntrada(estado.sesiones, e.id);

  return (
    <Sheet
      abierto={!!ejercicioId}
      onCerrar={cerrar}
      titulo={
        <div>
          <p className="eyebrow text-accent">{PATRON_LABEL[e.patron]}</p>
          <h2 className="display mt-1 text-[1.7rem]">{e.nombre}</h2>
        </div>
      }
      pie={accion ?? (onElegir ? <Button className="w-full" onClick={() => { onElegir(e.id); cerrar(); }}>Usar este ejercicio</Button> : undefined)}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <Tag><Nivel n={e.nivel} /> {NIVEL_LABEL[e.nivel]}</Tag>
          <Tag>{objetivoTexto(e.objetivo)}{e.unilateral ? " por lado" : ""}</Tag>
          {e.musculos.map((m) => <Tag key={m} fuerte>{m}</Tag>)}
          {e.secundarios?.map((m) => <Tag key={m}>{m}</Tag>)}
        </div>

        {falta.length > 0 ? (
          <p className="rounded-xl border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">Te falta: {falta.join(", ")}</p>
        ) : (
          <p className="text-xs text-ok">✓ Lo podés hacer con lo que tenés</p>
        )}

        {previa && (
          <div className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">
            Última vez ({fechaCorta(previa.fecha)}):{" "}
            <b className="num text-chalk">{previa.series.map((s) => s.valor + (s.lastreKg ? `+${s.lastreKg}kg` : "")).join(" · ")}</b>
          </div>
        )}

        <div>
          <p className="eyebrow mb-2">Cómo se hace</p>
          <ol className="space-y-2">
            {e.pasos.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-accent">{i + 1}</span>
                <span className="text-chalk/90">{p}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="eyebrow mb-2">Errores comunes</p>
          <ul className="space-y-1.5">
            {e.errores.map((x, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted"><span className="text-bad">✕</span>{x}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-2">Progresión · {cadena.nombre}</p>
          <div className="space-y-1">
            {cadena.ejercicios.map((x) => {
              const ok = disponible(x, equipo);
              return (
                <button
                  key={x.id}
                  onClick={() => setVerId(x.id)}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                    x.id === e.id ? "bg-accent-soft text-accent" : "hover:bg-surface-2",
                    !ok && "opacity-45",
                  )}
                >
                  <Nivel n={x.nivel} />
                  <span className="flex-1">{x.nombre}</span>
                  {x.id === e.id && <IconCheck size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function Tag({ children, fuerte }: { children: React.ReactNode; fuerte?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1", fuerte ? "border-chalk/25 text-chalk" : "border-line text-muted")}>
      {children}
    </span>
  );
}

/** Selector de ejercicios (para cambiar o agregar a la rutina) */
export function ExercisePicker({
  abierto,
  onCerrar,
  onElegir,
  patron,
  titulo = "Elegí un ejercicio",
}: {
  abierto: boolean;
  onCerrar: () => void;
  onElegir: (id: string) => void;
  patron?: Patron;
  titulo?: string;
}) {
  const { estado } = useStore();
  const equipo = estado.perfil?.equipo ?? [];
  const [q, setQ] = useState("");
  const [p, setP] = useState<Patron | "todos">(patron ?? "todos");
  const [detalle, setDetalle] = useState<string | null>(null);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return EJERCICIOS.filter((e) => (p === "todos" || e.patron === p) && (!t || e.nombre.toLowerCase().includes(t)))
      .sort((a, b) => Number(disponible(b, equipo)) - Number(disponible(a, equipo)));
  }, [q, p, equipo]);

  return (
    <>
      <Sheet abierto={abierto && !detalle} onCerrar={onCerrar} titulo={titulo}>
        <div className="sticky top-0 z-10 -mx-5 space-y-2 bg-surface px-5 pb-3">
          <label className="field flex items-center gap-2">
            <IconBuscar size={16} className="text-dim" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full bg-transparent outline-none" />
          </label>
          <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5">
            <Chip activo={p === "todos"} onClick={() => setP("todos")}>Todos</Chip>
            {(Object.keys(PATRON_LABEL) as Patron[]).map((k) => (
              <Chip key={k} activo={p === k} onClick={() => setP(k)}>{PATRON_LABEL[k]}</Chip>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {lista.map((e) => <FilaEjercicio key={e.id} e={e} ok={disponible(e, equipo)} onClick={() => setDetalle(e.id)} />)}
        </div>
      </Sheet>
      <ExerciseDetail
        ejercicioId={detalle}
        onCerrar={() => setDetalle(null)}
        onElegir={(id) => {
          onElegir(id);
          setDetalle(null);
          onCerrar();
        }}
      />
    </>
  );
}

export function FilaEjercicio({ e, ok, onClick, extra }: { e: Ejercicio; ok: boolean; onClick: () => void; extra?: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cx("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-surface-2", !ok && "opacity-50")}>
      <Nivel n={e.nivel} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{e.nombre}</span>
        <span className="block truncate text-xs text-dim">{e.musculos.join(", ")} · {objetivoTexto(e.objetivo)}</span>
      </span>
      {extra}
    </button>
  );
}
