import { CADENA_POR_ID, POR_ID, anterior, disponible, siguiente } from "./catalog";
import type { DiaRutina, EntradaSesion, Equipo, Ejercicio, NivelBase, Perfil, Plantilla, Rutina } from "./types";
import { uid } from "./utils";

interface Slot {
  cadenas: string[];
  series: number;
}
interface DiaPlantilla {
  nombre: string;
  foco: string;
  slots: Slot[];
}

const S = (cadenas: string[], series: number): Slot => ({ cadenas, series });

export const PLANTILLAS: Record<Plantilla, { nombre: string; descripcion: string; dias: DiaPlantilla[] }> = {
  full3: {
    nombre: "Full body ×3",
    descripcion: "3 días, todo el cuerpo cada día. Ideal para arrancar o con poco tiempo.",
    dias: [
      { nombre: "Full body A", foco: "Tirón vertical + flexiones + sentadilla", slots: [S(["dominadas", "remo"], 3), S(["flexiones"], 3), S(["sentadilla"], 3), S(["isquios", "puente"], 3), S(["core-colgado", "core-anti"], 3)] },
      { nombre: "Full body B", foco: "Remo + fondos + hombros", slots: [S(["remo"], 3), S(["fondos", "flexiones"], 3), S(["vertical"], 3), S(["zancadas"], 3), S(["puente"], 3), S(["core-anti"], 2)] },
      { nombre: "Full body C", foco: "Dominadas + cuádriceps + skills", slots: [S(["dominadas", "remo"], 3), S(["flexiones"], 3), S(["sissy", "sentadilla"], 3), S(["isquios"], 3), S(["gemelos"], 3), S(["lsit", "core-anti"], 3)] },
    ],
  },
  tp4: {
    nombre: "Torso / Pierna ×4",
    descripcion: "4 días alternando torso y pierna. El equilibrio entre volumen y descanso.",
    dias: [
      { nombre: "Torso A", foco: "Dominadas + flexiones", slots: [S(["dominadas", "remo"], 4), S(["flexiones"], 4), S(["remo"], 3), S(["fondos", "flexiones"], 3), S(["biceps"], 2)] },
      { nombre: "Pierna A", foco: "Cuádriceps", slots: [S(["sentadilla"], 4), S(["zancadas"], 3), S(["sissy"], 3), S(["gemelos"], 3), S(["core-anti"], 3)] },
      { nombre: "Torso B", foco: "Hombros + remo", slots: [S(["vertical"], 4), S(["remo"], 4), S(["dominadas", "remo"], 3), S(["fondos", "flexiones"], 3), S(["triceps"], 2)] },
      { nombre: "Pierna B", foco: "Cadena posterior", slots: [S(["isquios"], 4), S(["puente"], 4), S(["sentadilla"], 3), S(["gemelos"], 3), S(["core-colgado", "core-anti"], 3)] },
    ],
  },
  ppl5: {
    nombre: "Empuje / Tirón / Piernas ×5",
    descripcion: "5 días, más volumen por músculo. Para cuando ya tenés base.",
    dias: [
      { nombre: "Empuje A", foco: "Pecho + tríceps", slots: [S(["flexiones"], 4), S(["vertical"], 4), S(["fondos", "flexiones"], 3), S(["triceps"], 3)] },
      { nombre: "Tirón A", foco: "Dorsales + bíceps", slots: [S(["dominadas", "remo"], 4), S(["remo"], 4), S(["biceps"], 3), S(["core-colgado", "core-anti"], 3)] },
      { nombre: "Piernas", foco: "Pierna completa", slots: [S(["sentadilla"], 4), S(["isquios"], 3), S(["puente"], 3), S(["zancadas"], 3), S(["gemelos"], 3)] },
      { nombre: "Empuje B", foco: "Hombros + fondos", slots: [S(["fondos", "flexiones"], 4), S(["vertical"], 3), S(["flexiones"], 3), S(["lsit", "core-anti"], 3)] },
      { nombre: "Tirón B", foco: "Espalda + skills", slots: [S(["dominadas", "remo"], 4), S(["remo"], 3), S(["front-lever", "core-anti"], 3), S(["biceps"], 3)] },
    ],
  },
};

const BASE: Record<NivelBase, number> = { principiante: 2, intermedio: 3, avanzado: 4 };

/** Elige el ejercicio de una cadena que mejor encaja con tu nivel y equipo */
export function elegirEnCadena(cadenaId: string, nivel: NivelBase, equipo: Equipo[], excluir: string[] = []): Ejercicio | null {
  const c = CADENA_POR_ID[cadenaId];
  if (!c) return null;
  const base = BASE[nivel];
  const ok = c.ejercicios.filter((e) => disponible(e, equipo) && !excluir.includes(e.id));
  if (!ok.length) return null;
  return ok.find((e) => e.nivel === base) ?? [...ok].reverse().find((e) => e.nivel < base) ?? ok[0];
}

export function generarRutina(perfil: Perfil): Rutina {
  const plantilla = PLANTILLAS[perfil.plantilla];
  const dias: DiaRutina[] = plantilla.dias.map((d) => {
    const usados: string[] = [];
    const items = d.slots.flatMap((slot) => {
      for (const cid of slot.cadenas) {
        const e = elegirEnCadena(cid, perfil.nivel, perfil.equipo, usados);
        if (e) {
          usados.push(e.id);
          return [{ uid: uid(), ejercicioId: e.id, series: slot.series }];
        }
      }
      return [];
    });
    return { id: uid(), nombre: d.nombre, foco: d.foco, items };
  });
  return { plantilla: perfil.plantilla, dias, creada: new Date().toISOString() };
}

export function minutosDia(d: DiaRutina): number {
  const series = d.items.reduce((a, i) => a + i.series, 0);
  return Math.round(series * 2.3 + 5);
}

// ───────────── Progresión ─────────────

export type Veredicto =
  | { tipo: "subir"; a: Ejercicio }
  | { tipo: "lastre" }
  | { tipo: "mantener" }
  | { tipo: "bajar"; a: Ejercicio };

/**
 * Doble progresión: si completaste todas las series en el tope del rango,
 * pasás al siguiente ejercicio de la cadena (o sumás lastre).
 */
export function evaluar(entrada: EntradaSesion, equipo: Equipo[]): Veredicto | null {
  const e = POR_ID[entrada.ejercicioId];
  if (!e) return null;
  const hechas = entrada.series.filter((s) => s.hecha);
  if (!hechas.length) return null;

  const todasAlTope = hechas.length === entrada.series.length && hechas.every((s) => s.valor >= e.objetivo.max);
  if (todasAlTope) {
    if (e.equipo.includes("lastre")) return { tipo: "lastre" };
    const sig = siguiente(e, equipo);
    return sig ? { tipo: "subir", a: sig } : { tipo: "lastre" };
  }

  const promedio = hechas.reduce((a, s) => a + s.valor, 0) / hechas.length;
  if (promedio < e.objetivo.min * 0.7) {
    const ant = anterior(e, equipo);
    if (ant) return { tipo: "bajar", a: ant };
  }
  return { tipo: "mantener" };
}

/** Reemplaza un ejercicio por otro en todos los días de la rutina */
export function reemplazarEnRutina(r: Rutina, deId: string, aId: string): Rutina {
  return {
    ...r,
    dias: r.dias.map((d) => ({ ...d, items: d.items.map((i) => (i.ejercicioId === deId ? { ...i, ejercicioId: aId } : i)) })),
  };
}

/** Próximo día a entrenar: el siguiente al último registrado */
export function proximoDia(r: Rutina, ultimaDiaId: string | undefined): DiaRutina {
  if (!ultimaDiaId) return r.dias[0];
  const i = r.dias.findIndex((d) => d.id === ultimaDiaId);
  return r.dias[(i + 1) % r.dias.length] ?? r.dias[0];
}
