"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { Button, Card, Sheet, Stepper } from "@/components/ui";
import { IconAtras, IconBajar, IconCheck, IconMas, IconMenos, IconReloj, IconSubir, IconX } from "@/components/icons";
import { POR_ID, objetivoTexto } from "@/lib/catalog";
import { evaluar, reemplazarEnRutina, type Veredicto } from "@/lib/routine";
import { ultimaEntrada, useStore } from "@/lib/store";
import type { EntradaSesion, Sesion } from "@/lib/types";
import { cx, fechaCorta } from "@/lib/utils";

const DESCANSOS = [60, 90, 120, 180];
const SENSACIONES = [
  { v: 1, e: "😵", t: "Muerto" },
  { v: 2, e: "😮‍💨", t: "Pesado" },
  { v: 3, e: "🙂", t: "Normal" },
  { v: 4, e: "💪", t: "Bien" },
  { v: 5, e: "🔥", t: "Volando" },
] as const;

export default function SesionPage() {
  const { estado, actualizarEnCurso, terminarSesion, descartarSesion, setRutina } = useStore();
  const router = useRouter();
  const s = estado.enCurso;
  const [detalle, setDetalle] = useState<string | null>(null);
  const [descanso, setDescanso] = useState(90);
  const [finDescanso, setFinDescanso] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const [cerrando, setCerrando] = useState(false);
  const [sensacion, setSensacion] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [nota, setNota] = useState("");
  const [resultado, setResultado] = useState<{ sesion: Sesion; veredictos: { ejercicioId: string; v: Veredicto }[] } | null>(null);
  const [aplicados, setAplicados] = useState<string[]>([]);
  const [descartar, setDescartar] = useState(false);
  const vibro = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (finDescanso && ahora >= finDescanso && !vibro.current) {
      vibro.current = true;
      navigator.vibrate?.([200, 100, 200]);
    }
  }, [ahora, finDescanso]);

  // Sin sesión: volver
  useEffect(() => {
    if (!s && !resultado) router.replace("/entreno");
  }, [s, resultado, router]);

  if (resultado) return <Resultado {...{ resultado, aplicados, router }} onAplicar={(deId, aId) => {
    if (estado.rutina) setRutina(reemplazarEnRutina(estado.rutina, deId, aId));
    setAplicados((a) => [...a, deId]);
  }} />;
  if (!s) return null;

  const updEntrada = (i: number, en: EntradaSesion) => actualizarEnCurso({ ...s, entradas: s.entradas.map((x, j) => (j === i ? en : x)) });

  const totalSeries = s.entradas.reduce((a, e) => a + e.series.length, 0);
  const hechas = s.entradas.reduce((a, e) => a + e.series.filter((x) => x.hecha).length, 0);
  const transcurrido = Math.floor((ahora - s.inicio) / 1000);
  const restante = finDescanso ? Math.max(0, Math.ceil((finDescanso - ahora) / 1000)) : 0;

  function marcar(i: number, k: number) {
    const en = s!.entradas[i];
    const yaHecha = en.series[k].hecha;
    updEntrada(i, { ...en, series: en.series.map((x, j) => (j === k ? { ...x, hecha: !yaHecha } : x)) });
    if (!yaHecha) {
      vibro.current = false;
      setFinDescanso(Date.now() + descanso * 1000);
    }
  }

  function terminar() {
    const final = terminarSesion({ sensacion, nota: nota.trim() || undefined });
    if (!final) return;
    const veredictos = final.entradas
      .map((en) => ({ ejercicioId: en.ejercicioId, v: evaluar(en, estado.perfil?.equipo ?? []) }))
      .filter((x): x is { ejercicioId: string; v: Veredicto } => !!x.v);
    setCerrando(false);
    setResultado({ sesion: final, veredictos });
  }

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-30 -mx-4 flex items-center gap-3 bg-bg/95 px-4 py-3 backdrop-blur">
        <button onClick={() => router.push("/entreno")} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Volver">
          <IconAtras size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="display truncate text-2xl">{s.diaNombre}</p>
          <p className="num text-xs text-muted">{reloj(transcurrido)} · {hechas}/{totalSeries} series</p>
        </div>
        <button onClick={() => setDescartar(true)} className="text-xs text-dim hover:text-bad">Descartar</button>
      </header>

      <div className="h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-accent transition-all" style={{ width: `${totalSeries ? (hechas / totalSeries) * 100 : 0}%` }} />
      </div>

      {s.entradas.map((en, i) => {
        const e = POR_ID[en.ejercicioId];
        if (!e) return null;
        const previa = ultimaEntrada(estado.sesiones, e.id);
        const conLastre = e.equipo.includes("lastre") || en.series.some((x) => x.lastreKg);
        const completo = en.series.every((x) => x.hecha);
        return (
          <Card key={en.ejercicioId + i} className={cx("p-4", completo && "border-ok/30")}>
            <button onClick={() => setDetalle(e.id)} className="w-full text-left">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-semibold leading-snug">{e.nombre}</h3>
                {completo && <IconCheck size={18} className="shrink-0 text-ok" />}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Objetivo {objetivoTexto(e.objetivo)}{e.unilateral ? " por lado" : ""}
                {previa && <> · Última ({fechaCorta(previa.fecha)}): <span className="num text-chalk/80">{previa.series.map((x) => x.valor).join("·")}</span></>}
              </p>
            </button>

            <div className="mt-3 space-y-2">
              {en.series.map((st, k) => (
                <div key={k} className={cx("flex items-center gap-2 rounded-2xl p-1.5 pl-3 transition", st.hecha ? "bg-ok/10" : "bg-surface-2/50")}>
                  <span className="num w-4 text-xs font-semibold text-dim">{k + 1}</span>
                  <Stepper compacto valor={st.valor} min={0} max={600} paso={e.objetivo.tipo === "seg" ? 5 : 1} sufijo={e.objetivo.tipo === "seg" ? "s" : ""}
                    onChange={(n) => updEntrada(i, { ...en, series: en.series.map((x, j) => (j === k ? { ...x, valor: n } : x)) })} />
                  {conLastre && (
                    <Stepper compacto valor={st.lastreKg ?? 0} min={0} max={100} paso={2.5} sufijo="kg"
                      onChange={(n) => updEntrada(i, { ...en, series: en.series.map((x, j) => (j === k ? { ...x, lastreKg: n || undefined } : x)) })} />
                  )}
                  <select
                    value={st.rir ?? ""}
                    onChange={(ev) => updEntrada(i, { ...en, series: en.series.map((x, j) => (j === k ? { ...x, rir: ev.target.value === "" ? undefined : Number(ev.target.value) } : x)) })}
                    className="h-9 rounded-full border border-line bg-surface-2 px-2 text-xs text-muted outline-none"
                    aria-label="Repeticiones en reserva"
                  >
                    <option value="">RIR</option>
                    <option value="0">Fallo</option>
                    <option value="1">1 más</option>
                    <option value="2">2 más</option>
                    <option value="3">3+ más</option>
                  </select>
                  <button
                    onClick={() => marcar(i, k)}
                    aria-label="Serie hecha"
                    className={cx("ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border transition", st.hecha ? "border-ok bg-ok text-bg" : "border-line text-dim hover:text-chalk")}
                  >
                    <IconCheck size={18} strokeWidth={2.6} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-3 text-xs text-dim">
              <button className="flex items-center gap-1 hover:text-chalk" onClick={() => updEntrada(i, { ...en, series: [...en.series, { ...en.series.at(-1)!, hecha: false }] })}>
                <IconMas size={14} /> Serie
              </button>
              {en.series.length > 1 && (
                <button className="flex items-center gap-1 hover:text-chalk" onClick={() => updEntrada(i, { ...en, series: en.series.slice(0, -1) })}>
                  <IconMenos size={14} /> Serie
                </button>
              )}
            </div>
          </Card>
        );
      })}

      {/* Barra inferior: descanso + terminar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4">
          <button
            onClick={() => setDescanso(DESCANSOS[(DESCANSOS.indexOf(descanso) + 1) % DESCANSOS.length])}
            className={cx("flex h-12 flex-1 items-center gap-2 rounded-full border px-4 transition", restante > 0 ? "border-accent bg-accent-soft text-accent" : "border-line text-muted")}
          >
            <IconReloj size={18} />
            {restante > 0 ? (
              <span className="num text-lg font-semibold">{reloj(restante)}</span>
            ) : (
              <span className="text-xs">Descanso {descanso}s <span className="text-dim">· tocá para cambiar</span></span>
            )}
            {restante > 0 && (
              <span role="button" onClick={(ev) => { ev.stopPropagation(); setFinDescanso(null); }} className="ml-auto text-xs text-muted">Saltar</span>
            )}
          </button>
          <Button onClick={() => setCerrando(true)} className="h-12">Terminar</Button>
        </div>
      </div>

      <ExerciseDetail ejercicioId={detalle} onCerrar={() => setDetalle(null)} />

      <Sheet abierto={cerrando} onCerrar={() => setCerrando(false)} titulo="¿Cómo te sentiste?" pie={<Button className="w-full" onClick={terminar}>Guardar sesión</Button>}>
        <div className="grid grid-cols-5 gap-2">
          {SENSACIONES.map((x) => (
            <button key={x.v} onClick={() => setSensacion(x.v)} className={cx("flex flex-col items-center gap-1 rounded-2xl border py-3 transition", sensacion === x.v ? "border-accent bg-accent-soft" : "border-line")}>
              <span className="text-2xl">{x.e}</span>
              <span className="text-[10px] text-muted">{x.t}</span>
            </button>
          ))}
        </div>
        <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} placeholder="Nota (opcional): dolor de hombro, mucho calor…" className="field mt-4 resize-none text-sm" />
        {hechas < totalSeries && <p className="mt-3 text-xs text-warn">Te quedaron {totalSeries - hechas} series sin marcar. Se guardan solo las hechas.</p>}
      </Sheet>

      <Sheet abierto={descartar} onCerrar={() => setDescartar(false)} titulo="¿Descartar la sesión?">
        <p className="text-sm text-muted">No se guarda nada de lo que cargaste hoy.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => setDescartar(false)}>Seguir</Button>
          <Button variant="danger" onClick={() => { descartarSesion(); router.replace("/entreno"); }}><IconX size={16} /> Descartar</Button>
        </div>
      </Sheet>
    </div>
  );
}

function Resultado({
  resultado,
  aplicados,
  onAplicar,
  router,
}: {
  resultado: { sesion: Sesion; veredictos: { ejercicioId: string; v: Veredicto }[] };
  aplicados: string[];
  onAplicar: (deId: string, aId: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { sesion, veredictos } = resultado;
  const series = sesion.entradas.reduce((a, e) => a + e.series.filter((x) => x.hecha).length, 0);
  const reps = sesion.entradas.reduce((a, e) => a + (POR_ID[e.ejercicioId]?.objetivo.tipo === "reps" ? e.series.filter((x) => x.hecha).reduce((b, x) => b + x.valor, 0) : 0), 0);
  const min = sesion.fin ? Math.round((sesion.fin - sesion.inicio) / 60000) : 0;
  const cambios = veredictos.filter((x) => x.v.tipo !== "mantener");

  return (
    <div className="space-y-5 pt-6">
      <div className="text-center">
        <p className="eyebrow text-accent">Sesión guardada</p>
        <h1 className="display mt-2 text-5xl">{sesion.diaNombre}</h1>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[{ n: series, t: "series" }, { n: reps, t: "reps" }, { n: min, t: "min" }].map((x) => (
          <Card key={x.t} className="py-4">
            <p className="display num text-3xl">{x.n}</p>
            <p className="text-xs text-muted">{x.t}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="display mb-2 text-2xl">Progresión</h2>
        {cambios.length === 0 ? (
          <p className="text-sm text-muted">Seguí con los mismos ejercicios. Cuando completes todas las series en el tope del rango, te sugiero el siguiente paso.</p>
        ) : (
          <div className="space-y-2">
            {cambios.map(({ ejercicioId, v }) => {
              const e = POR_ID[ejercicioId];
              const hecho = aplicados.includes(ejercicioId);
              return (
                <Card key={ejercicioId} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full", v.tipo === "bajar" ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok")}>
                      {v.tipo === "bajar" ? <IconBajar size={18} /> : <IconSubir size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{e?.nombre}</p>
                      {v.tipo === "subir" && <p className="text-xs text-muted">Completaste todo en el tope. Siguiente paso: <b className="text-chalk">{v.a.nombre}</b></p>}
                      {v.tipo === "lastre" && <p className="text-xs text-muted">Llegaste al tope: sumá 2,5 kg de lastre o hacé la bajada más lenta (4 s).</p>}
                      {v.tipo === "bajar" && <p className="text-xs text-muted">Te costó bastante. Probá unas semanas con <b className="text-chalk">{v.a.nombre}</b> para sumar volumen.</p>}
                    </div>
                  </div>
                  {(v.tipo === "subir" || v.tipo === "bajar") && (
                    <Button variant={hecho ? "subtle" : "ghost"} className="mt-3 w-full" disabled={hecho} onClick={() => onAplicar(ejercicioId, v.a.id)}>
                      {hecho ? "✓ Actualizado en tu rutina" : `Cambiar por ${v.a.nombre}`}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Button className="w-full" onClick={() => router.push("/")}>Listo</Button>
    </div>
  );
}

function reloj(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
