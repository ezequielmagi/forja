"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExerciseDetail, ExercisePicker, Nivel } from "@/components/ExerciseDetail";
import { Button, Card, Sheet, Stepper, Vacio } from "@/components/ui";
import { IconBasura, IconCambiar, IconFlecha, IconMas, IconPlay } from "@/components/icons";
import { POR_ID, disponible, objetivoTexto } from "@/lib/catalog";
import { PLANTILLAS, generarRutina, minutosDia, proximoDia } from "@/lib/routine";
import { useStore } from "@/lib/store";
import type { DiaRutina, Sesion } from "@/lib/types";
import { cx, fechaCorta, uid } from "@/lib/utils";

export default function Entreno() {
  const { estado, setRutina, iniciarSesion, borrarSesion } = useStore();
  const router = useRouter();
  const rutina = estado.rutina;
  const [abierto, setAbierto] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<string | null>(null);
  const [picker, setPicker] = useState<{ diaId: string; uid?: string } | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [verSesion, setVerSesion] = useState<Sesion | null>(null);

  if (!rutina || !estado.perfil) return <Vacio titulo="Sin rutina" texto="Completá tu perfil para generar una." />;
  const proximo = proximoDia(rutina, estado.sesiones.at(-1)?.diaId);
  const equipo = estado.perfil.equipo;

  const updDia = (diaId: string, f: (d: DiaRutina) => DiaRutina) =>
    setRutina({ ...rutina, dias: rutina.dias.map((d) => (d.id === diaId ? f(d) : d)) });

  function elegir(id: string) {
    if (!picker) return;
    updDia(picker.diaId, (d) => ({
      ...d,
      items: picker.uid
        ? d.items.map((i) => (i.uid === picker.uid ? { ...i, ejercicioId: id } : i))
        : [...d.items, { uid: uid(), ejercicioId: id, series: 3 }],
    }));
  }

  function mover(diaId: string, idx: number, dir: -1 | 1) {
    updDia(diaId, (d) => {
      const items = [...d.items];
      const j = idx + dir;
      if (j < 0 || j >= items.length) return d;
      [items[idx], items[j]] = [items[j], items[idx]];
      return { ...d, items };
    });
  }

  function empezar(diaId: string) {
    if (!estado.enCurso) iniciarSesion(diaId);
    router.push("/entreno/sesion");
  }

  const pickerPatron = picker?.uid
    ? POR_ID[rutina.dias.find((d) => d.id === picker.diaId)?.items.find((i) => i.uid === picker.uid)?.ejercicioId ?? ""]?.patron
    : undefined;

  const historial = [...estado.sesiones].reverse();

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-accent">{PLANTILLAS[rutina.plantilla].nombre}</p>
          <h1 className="display mt-1 text-4xl">Mi rutina</h1>
        </div>
        <button onClick={() => setConfirmar(true)} className="text-xs text-muted underline underline-offset-4">Regenerar</button>
      </header>

      {estado.enCurso && (
        <Card className="flex items-center justify-between border-accent/50 bg-accent-soft">
          <div>
            <p className="eyebrow text-accent">En curso</p>
            <p className="display text-xl">{estado.enCurso.diaNombre}</p>
          </div>
          <Button onClick={() => router.push("/entreno/sesion")}>Continuar</Button>
        </Card>
      )}

      <div className="space-y-3">
        {rutina.dias.map((d, i) => {
          const open = abierto === d.id;
          return (
            <Card key={d.id} className={cx("p-0 overflow-hidden", d.id === proximo.id && "border-accent/40")}>
              <button onClick={() => setAbierto(open ? null : d.id)} className="flex w-full items-center gap-4 p-4 text-left">
                <span className="display num grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-2xl text-accent">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="display truncate text-2xl">{d.nombre}</span>
                    {d.id === proximo.id && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-[#160a02]">PRÓXIMO</span>}
                  </span>
                  <span className="num block text-xs text-muted">{d.items.length} ejerc. · {d.items.reduce((a, x) => a + x.series, 0)} series · ~{minutosDia(d)} min</span>
                </span>
                <IconFlecha size={18} className={cx("text-dim transition", open && "rotate-90")} />
              </button>

              {open && (
                <div className="border-t border-line px-3 pb-4 pt-2">
                  {d.items.map((it, idx) => {
                    const e = POR_ID[it.ejercicioId];
                    if (!e) return null;
                    return (
                      <div key={it.uid} className="flex items-center gap-2 border-b border-line/60 py-3 last:border-0">
                        <div className="flex flex-col">
                          <button onClick={() => mover(d.id, idx, -1)} className="px-1 text-dim hover:text-chalk" aria-label="Subir">▴</button>
                          <button onClick={() => mover(d.id, idx, 1)} className="px-1 text-dim hover:text-chalk" aria-label="Bajar">▾</button>
                        </div>
                        <button onClick={() => setDetalle(e.id)} className="min-w-0 flex-1 text-left">
                          <span className={cx("block truncate text-sm font-medium", !disponible(e, equipo) && "text-warn")}>{e.nombre}</span>
                          <span className="flex items-center gap-2 text-xs text-dim">
                            <Nivel n={e.nivel} /> {objetivoTexto(e.objetivo)}
                          </span>
                        </button>
                        <Stepper compacto valor={it.series} min={1} max={10} sufijo="×" onChange={(n) => updDia(d.id, (x) => ({ ...x, items: x.items.map((y) => (y.uid === it.uid ? { ...y, series: n } : y)) }))} />
                        <button onClick={() => setPicker({ diaId: d.id, uid: it.uid })} className="p-1.5 text-muted hover:text-accent" aria-label="Cambiar">
                          <IconCambiar size={18} />
                        </button>
                        <button onClick={() => updDia(d.id, (x) => ({ ...x, items: x.items.filter((y) => y.uid !== it.uid) }))} className="p-1.5 text-dim hover:text-bad" aria-label="Quitar">
                          <IconBasura size={17} />
                        </button>
                      </div>
                    );
                  })}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="ghost" onClick={() => setPicker({ diaId: d.id })}><IconMas size={16} /> Ejercicio</Button>
                    <Button onClick={() => empezar(d.id)} disabled={!!estado.enCurso && estado.enCurso.diaId !== d.id}>
                      <IconPlay size={14} /> Entrenar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <section className="pt-4">
        <h2 className="display mb-3 text-2xl">Historial</h2>
        {historial.length === 0 ? (
          <Vacio titulo="Todavía nada" texto="Cuando termines tu primera sesión aparece acá." />
        ) : (
          <div className="space-y-2">
            {historial.slice(0, 30).map((s) => {
              const series = s.entradas.reduce((a, e) => a + e.series.filter((x) => x.hecha).length, 0);
              const min = s.fin ? Math.round((s.fin - s.inicio) / 60000) : null;
              return (
                <button key={s.id} onClick={() => setVerSesion(s)} className="card flex w-full items-center gap-3 p-3 text-left">
                  <span className="num w-14 shrink-0 text-xs capitalize text-muted">{fechaCorta(s.fecha)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.diaNombre}</span>
                    <span className="num text-xs text-dim">{series} series{min ? ` · ${min} min` : ""}</span>
                  </span>
                  {s.sensacion && <span className="text-sm">{["", "😵", "😮‍💨", "🙂", "💪", "🔥"][s.sensacion]}</span>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <ExerciseDetail ejercicioId={detalle} onCerrar={() => setDetalle(null)} />
      <ExercisePicker abierto={!!picker} onCerrar={() => setPicker(null)} onElegir={elegir} patron={pickerPatron} titulo={picker?.uid ? "Cambiar ejercicio" : "Agregar ejercicio"} />

      <Sheet abierto={confirmar} onCerrar={() => setConfirmar(false)} titulo="¿Regenerar la rutina?">
        <p className="text-sm text-muted">Se arma de nuevo según tu perfil, nivel y equipo. Perdés los cambios manuales (el historial queda).</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => setConfirmar(false)}>Cancelar</Button>
          <Button onClick={() => { setRutina(generarRutina(estado.perfil!)); setConfirmar(false); }}>Regenerar</Button>
        </div>
      </Sheet>

      <Sheet abierto={!!verSesion} onCerrar={() => setVerSesion(null)} titulo={verSesion?.diaNombre}>
        {verSesion && (
          <div className="space-y-3">
            <p className="text-sm capitalize text-muted">{fechaCorta(verSesion.fecha)}{verSesion.nota ? ` · ${verSesion.nota}` : ""}</p>
            {verSesion.entradas.map((en) => {
              const e = POR_ID[en.ejercicioId];
              const hechas = en.series.filter((x) => x.hecha);
              if (!hechas.length) return null;
              return (
                <div key={en.ejercicioId} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-sm font-medium">{e?.nombre}</p>
                  <p className="num mt-1 text-xs text-muted">
                    {hechas.map((x) => `${x.valor}${e?.objetivo.tipo === "seg" ? "s" : ""}${x.lastreKg ? `+${x.lastreKg}kg` : ""}${x.rir != null ? ` @${x.rir}` : ""}`).join(" · ")}
                  </p>
                </div>
              );
            })}
            <Button variant="danger" className="w-full" onClick={() => { borrarSesion(verSesion.id); setVerSesion(null); }}>
              <IconBasura size={16} /> Borrar sesión
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
