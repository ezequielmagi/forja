"use client";

import { useMemo, useState } from "react";
import { ExerciseDetail, FilaEjercicio } from "@/components/ExerciseDetail";
import { Button, Chip, Sheet } from "@/components/ui";
import { IconBuscar } from "@/components/icons";
import { CADENAS, EJERCICIOS, MUSCULOS, PATRON_LABEL, disponible } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Musculo, Patron } from "@/lib/types";
import { uid } from "@/lib/utils";

export default function Ejercicios() {
  const { estado, setRutina } = useStore();
  const equipo = estado.perfil?.equipo ?? [];
  const [q, setQ] = useState("");
  const [patron, setPatron] = useState<Patron | "todos">("todos");
  const [musculo, setMusculo] = useState<Musculo | "todos">("todos");
  const [soloMio, setSoloMio] = useState(false);
  const [detalle, setDetalle] = useState<string | null>(null);
  const [agregar, setAgregar] = useState<string | null>(null);

  const cadenas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return CADENAS.map((c) => ({
      ...c,
      ejercicios: c.ejercicios.filter(
        (e) =>
          (patron === "todos" || e.patron === patron) &&
          (musculo === "todos" || e.musculos.includes(musculo) || e.secundarios?.includes(musculo)) &&
          (!soloMio || disponible(e, equipo)) &&
          (!t || e.nombre.toLowerCase().includes(t) || c.nombre.toLowerCase().includes(t)),
      ),
    })).filter((c) => c.ejercicios.length);
  }, [q, patron, musculo, soloMio, equipo]);

  const total = cadenas.reduce((a, c) => a + c.ejercicios.length, 0);
  const enRutina = new Set(estado.rutina?.dias.flatMap((d) => d.items.map((i) => i.ejercicioId)));

  function agregarADia(diaId: string) {
    if (!estado.rutina || !agregar) return;
    setRutina({
      ...estado.rutina,
      dias: estado.rutina.dias.map((d) => (d.id === diaId ? { ...d, items: [...d.items, { uid: uid(), ejercicioId: agregar, series: 3 }] } : d)),
    });
    setAgregar(null);
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow text-accent">Catálogo</p>
        <h1 className="display mt-1 text-4xl">Ejercicios</h1>
        <p className="mt-1 text-sm text-muted">{EJERCICIOS.length} ejercicios de calistenia en {CADENAS.length} progresiones, de lo más fácil a lo más difícil.</p>
      </header>

      <div className="sticky top-0 z-20 -mx-4 space-y-2 bg-bg/95 px-4 py-2 backdrop-blur">
        <label className="field flex items-center gap-2">
          <IconBuscar size={16} className="text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: dominadas, pistol, L-sit…" className="w-full bg-transparent outline-none" />
        </label>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
          <Chip activo={soloMio} onClick={() => setSoloMio(!soloMio)}>✓ Con mi equipo</Chip>
          <Chip activo={patron === "todos"} onClick={() => setPatron("todos")}>Todos</Chip>
          {(Object.keys(PATRON_LABEL) as Patron[]).map((k) => (
            <Chip key={k} activo={patron === k} onClick={() => setPatron(patron === k ? "todos" : k)}>{PATRON_LABEL[k]}</Chip>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
          {MUSCULOS.map((m) => (
            <Chip key={m} activo={musculo === m} onClick={() => setMusculo(musculo === m ? "todos" : m)}>{m}</Chip>
          ))}
        </div>
      </div>

      <p className="text-xs text-dim">{total} resultados</p>

      <div className="space-y-4">
        {cadenas.map((c) => (
          <section key={c.id} className="card p-2">
            <div className="px-3 pt-2 pb-1">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="display text-xl">{c.nombre}</h2>
                <span className="eyebrow shrink-0">{PATRON_LABEL[c.patron]}</span>
              </div>
              <p className="text-xs text-muted">{c.descripcion}</p>
            </div>
            <div className="relative mt-1">
              {c.ejercicios.map((e) => (
                <FilaEjercicio
                  key={e.id}
                  e={e}
                  ok={disponible(e, equipo)}
                  onClick={() => setDetalle(e.id)}
                  extra={enRutina.has(e.id) ? <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">EN RUTINA</span> : undefined}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ExerciseDetail
        ejercicioId={detalle}
        onCerrar={() => setDetalle(null)}
        accion={
          estado.rutina && detalle ? (
            <Button className="w-full" onClick={() => { setAgregar(detalle); setDetalle(null); }}>Agregar a un día de mi rutina</Button>
          ) : undefined
        }
      />

      <Sheet abierto={!!agregar} onCerrar={() => setAgregar(null)} titulo="¿A qué día?">
        <div className="space-y-2">
          {estado.rutina?.dias.map((d) => (
            <button key={d.id} onClick={() => agregarADia(d.id)} className="card flex w-full items-center justify-between p-4 text-left hover:border-accent">
              <span>
                <span className="display block text-xl">{d.nombre}</span>
                <span className="text-xs text-muted">{d.foco}</span>
              </span>
              <span className="text-xs text-dim">{d.items.length} ejerc.</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
