"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { del, get, set } from "idb-keyval";
import type { Comida, Estado, Perfil, Rutina, Sesion } from "./types";
import { POR_ID } from "./catalog";
import { generarRutina } from "./routine";
import { hoyISO, uid } from "./utils";

const CLAVE = "forja:estado";

const INICIAL: Estado = {
  version: 1,
  perfil: null,
  rutina: null,
  sesiones: [],
  comidas: [],
  enCurso: null,
  pesos: [],
};

interface Acciones {
  guardarPerfil: (p: Perfil, regenerar: boolean) => void;
  setRutina: (r: Rutina) => void;
  iniciarSesion: (diaId: string) => void;
  actualizarEnCurso: (s: Sesion) => void;
  terminarSesion: (extra: Pick<Sesion, "sensacion" | "nota">) => Sesion | null;
  descartarSesion: () => void;
  borrarSesion: (id: string) => void;
  agregarComida: (c: Comida, foto?: string) => Promise<void>;
  editarComida: (c: Comida) => void;
  borrarComida: (id: string) => Promise<void>;
  registrarPeso: (kg: number) => void;
  importar: (e: Estado) => void;
  reiniciar: () => Promise<void>;
}

interface Ctx extends Acciones {
  estado: Estado;
  listo: boolean;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [listo, setListo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef(estado);
  ref.current = estado;

  // Hidratar desde IndexedDB
  useEffect(() => {
    get<Estado>(CLAVE)
      .then((e) => e && setEstado({ ...INICIAL, ...e }))
      .catch(() => {})
      .finally(() => setListo(true));
  }, []);

  // Persistir con debounce
  useEffect(() => {
    if (!listo) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => set(CLAVE, estado).catch(() => {}), 250);
  }, [estado, listo]);

  // Pedir almacenamiento persistente (evita que el navegador borre los datos)
  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  const guardarPerfil = useCallback((p: Perfil, regenerar: boolean) => {
    setEstado((e) => {
      const pesos = e.perfil?.pesoKg !== p.pesoKg ? upsertPeso(e.pesos, p.pesoKg) : e.pesos;
      return { ...e, perfil: p, pesos, rutina: regenerar || !e.rutina ? generarRutina(p) : e.rutina };
    });
  }, []);

  const setRutina = useCallback((r: Rutina) => setEstado((e) => ({ ...e, rutina: r })), []);

  const iniciarSesion = useCallback((diaId: string) => {
    setEstado((e) => {
      const dia = e.rutina?.dias.find((d) => d.id === diaId);
      if (!dia) return e;
      const entradas = dia.items.map((it) => {
        const ej = POR_ID[it.ejercicioId];
        const previa = ultimaEntrada(e.sesiones, it.ejercicioId);
        return {
          ejercicioId: it.ejercicioId,
          series: Array.from({ length: it.series }, (_, i) => {
            const p = previa?.series[i] ?? previa?.series.at(-1);
            return { valor: p?.valor ?? ej?.objetivo.min ?? 8, lastreKg: p?.lastreKg, rir: undefined, hecha: false };
          }),
        };
      });
      const s: Sesion = { id: uid(), fecha: hoyISO(), inicio: Date.now(), diaId: dia.id, diaNombre: dia.nombre, entradas };
      return { ...e, enCurso: s };
    });
  }, []);

  const actualizarEnCurso = useCallback((s: Sesion) => setEstado((e) => ({ ...e, enCurso: s })), []);

  const terminarSesion = useCallback((extra: Pick<Sesion, "sensacion" | "nota">) => {
    const actual = ref.current.enCurso;
    if (!actual) return null;
    const final: Sesion = { ...actual, ...extra, fin: Date.now() };
    setEstado((e) => ({ ...e, enCurso: null, sesiones: [...e.sesiones, final] }));
    return final;
  }, []);

  const descartarSesion = useCallback(() => setEstado((e) => ({ ...e, enCurso: null })), []);
  const borrarSesion = useCallback((id: string) => setEstado((e) => ({ ...e, sesiones: e.sesiones.filter((s) => s.id !== id) })), []);

  const agregarComida = useCallback(async (c: Comida, foto?: string) => {
    if (foto) await set(`foto:${c.id}`, foto).catch(() => {});
    setEstado((e) => ({ ...e, comidas: [...e.comidas, { ...c, tieneFoto: !!foto }] }));
  }, []);

  const editarComida = useCallback((c: Comida) => setEstado((e) => ({ ...e, comidas: e.comidas.map((x) => (x.id === c.id ? c : x)) })), []);

  const borrarComida = useCallback(async (id: string) => {
    await del(`foto:${id}`).catch(() => {});
    setEstado((e) => ({ ...e, comidas: e.comidas.filter((c) => c.id !== id) }));
  }, []);

  const registrarPeso = useCallback((kg: number) => {
    setEstado((e) => ({ ...e, pesos: upsertPeso(e.pesos, kg), perfil: e.perfil ? { ...e.perfil, pesoKg: kg } : e.perfil }));
  }, []);

  const importar = useCallback((nuevo: Estado) => setEstado({ ...INICIAL, ...nuevo }), []);

  const reiniciar = useCallback(async () => {
    await del(CLAVE).catch(() => {});
    setEstado(INICIAL);
  }, []);

  const valor = useMemo<Ctx>(
    () => ({
      estado, listo, guardarPerfil, setRutina, iniciarSesion, actualizarEnCurso, terminarSesion, descartarSesion,
      borrarSesion, agregarComida, editarComida, borrarComida, registrarPeso, importar, reiniciar,
    }),
    [estado, listo, guardarPerfil, setRutina, iniciarSesion, actualizarEnCurso, terminarSesion, descartarSesion,
      borrarSesion, agregarComida, editarComida, borrarComida, registrarPeso, importar, reiniciar],
  );

  return <StoreCtx.Provider value={valor}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore fuera de StoreProvider");
  return c;
}

/** Miniatura guardada de una comida */
export function useFoto(id: string, tiene?: boolean): string | null {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!tiene) return;
    let vivo = true;
    get<string>(`foto:${id}`).then((v) => vivo && setSrc(v ?? null)).catch(() => {});
    return () => {
      vivo = false;
    };
  }, [id, tiene]);
  return src;
}

export function ultimaEntrada(sesiones: Sesion[], ejercicioId: string) {
  for (let i = sesiones.length - 1; i >= 0; i--) {
    const en = sesiones[i].entradas.find((x) => x.ejercicioId === ejercicioId && x.series.some((s) => s.hecha));
    if (en) return { ...en, series: en.series.filter((s) => s.hecha), fecha: sesiones[i].fecha };
  }
  return null;
}

function upsertPeso(pesos: Estado["pesos"], kg: number) {
  const f = hoyISO();
  return [...pesos.filter((p) => p.fecha !== f), { fecha: f, kg }].sort((a, b) => a.fecha.localeCompare(b.fecha));
}
