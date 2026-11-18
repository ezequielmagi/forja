"use client";

import { useState } from "react";
import { EQUIPO_LABEL } from "@/lib/catalog";
import { ACTIVIDAD_LABEL, META_LABEL, objetivos } from "@/lib/nutrition";
import { PLANTILLAS } from "@/lib/routine";
import type { Actividad, Equipo, Meta, NivelBase, Perfil, Plantilla } from "@/lib/types";
import { cx } from "@/lib/utils";
import { Segmentado } from "./ui";
import { IconCheck } from "./icons";

export const PERFIL_DEFAULT: Perfil = {
  nombre: "",
  sexo: "m",
  edad: 30,
  alturaCm: 175,
  pesoKg: 75,
  actividad: "moderado",
  meta: "recomp",
  nivel: "principiante",
  plantilla: "tp4",
  equipo: ["barra", "paralelas", "banco"],
};

export function ProfileForm({ valor, onChange }: { valor: Perfil; onChange: (p: Perfil) => void }) {
  const set = <K extends keyof Perfil>(k: K, v: Perfil[K]) => onChange({ ...valor, [k]: v });
  const obj = objetivos(valor);
  const [verKcal, setVerKcal] = useState(valor.kcalManual != null);

  const toggleEquipo = (e: Equipo) =>
    set("equipo", valor.equipo.includes(e) ? valor.equipo.filter((x) => x !== e) : [...valor.equipo, e]);

  return (
    <div className="space-y-7">
      <Seccion titulo="Vos">
        <input value={valor.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Tu nombre" className="field" />
        <Segmentado opciones={[{ valor: "m", label: "Hombre" }, { valor: "f", label: "Mujer" }]} valor={valor.sexo} onChange={(v) => set("sexo", v)} />
        <div className="grid grid-cols-3 gap-2">
          <Numero label="Edad" valor={valor.edad} onChange={(n) => set("edad", n)} />
          <Numero label="Altura (cm)" valor={valor.alturaCm} onChange={(n) => set("alturaCm", n)} />
          <Numero label="Peso (kg)" valor={valor.pesoKg} onChange={(n) => set("pesoKg", n)} decimal />
        </div>
      </Seccion>

      <Seccion titulo="Objetivo">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(META_LABEL) as Meta[]).map((m) => (
            <Opcion key={m} activo={valor.meta === m} onClick={() => set("meta", m)} titulo={META_LABEL[m]} />
          ))}
        </div>
        <select value={valor.actividad} onChange={(e) => set("actividad", e.target.value as Actividad)} className="field text-sm">
          {(Object.keys(ACTIVIDAD_LABEL) as Actividad[]).map((a) => (
            <option key={a} value={a}>{ACTIVIDAD_LABEL[a]}</option>
          ))}
        </select>
        <div className="rounded-2xl bg-surface-2 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">Objetivo diario</span>
            <span className="display text-3xl text-accent num">{obj.kcal} kcal</span>
          </div>
          <p className="mt-1 text-xs text-dim num">
            Mantenimiento ≈ {obj.mantenimiento} kcal · Proteína {obj.proteinas} g · Grasas {obj.grasas} g · Carbos {obj.carbohidratos} g
          </p>
          <button type="button" onClick={() => { setVerKcal(!verKcal); if (verKcal) set("kcalManual", undefined); }} className="mt-2 text-xs text-muted underline underline-offset-4">
            {verKcal ? "Usar el cálculo automático" : "Poner mi propio objetivo"}
          </button>
          {verKcal && (
            <input
              inputMode="numeric"
              value={valor.kcalManual ?? obj.kcal}
              onChange={(e) => set("kcalManual", Number(e.target.value) || undefined)}
              className="field mt-2 num"
            />
          )}
        </div>
      </Seccion>

      <Seccion titulo="Entreno">
        <p className="eyebrow">Nivel en calistenia</p>
        <Segmentado
          opciones={[
            { valor: "principiante", label: "Arrancando" },
            { valor: "intermedio", label: "Intermedio" },
            { valor: "avanzado", label: "Avanzado" },
          ]}
          valor={valor.nivel}
          onChange={(v) => set("nivel", v as NivelBase)}
        />
        <p className="text-xs text-dim">
          {valor.nivel === "principiante" && "Todavía no hacés dominadas o fondos completos."}
          {valor.nivel === "intermedio" && "Hacés 5–10 dominadas y 10+ fondos."}
          {valor.nivel === "avanzado" && "Más de 12 dominadas, fondos con peso, trabajás skills."}
        </p>
        <p className="eyebrow pt-2">Días por semana</p>
        <div className="space-y-2">
          {(Object.keys(PLANTILLAS) as Plantilla[]).map((k) => (
            <Opcion key={k} activo={valor.plantilla === k} onClick={() => set("plantilla", k)} titulo={PLANTILLAS[k].nombre} texto={PLANTILLAS[k].descripcion} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="¿Qué tenés para entrenar?">
        <p className="-mt-1 text-xs text-dim">Piso y pared siempre cuentan. Marcá lo que hay en tu plaza o en casa.</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(EQUIPO_LABEL) as Equipo[]).map((e) => (
            <Opcion key={e} activo={valor.equipo.includes(e)} onClick={() => toggleEquipo(e)} titulo={EQUIPO_LABEL[e]} check />
          ))}
        </div>
      </Seccion>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="display text-2xl">{titulo}</h3>
      {children}
    </section>
  );
}

function Numero({ label, valor, onChange, decimal }: { label: string; valor: number; onChange: (n: number) => void; decimal?: boolean }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      <input
        inputMode={decimal ? "decimal" : "numeric"}
        value={valor || ""}
        onChange={(e) => onChange(Number(e.target.value.replace(",", ".")) || 0)}
        className="field num text-lg font-semibold"
      />
    </label>
  );
}

function Opcion({ activo, onClick, titulo, texto, check }: { activo: boolean; onClick: () => void; titulo: string; texto?: string; check?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
        activo ? "border-accent bg-accent-soft" : "border-line hover:border-chalk/30",
      )}
    >
      {check && (
        <span className={cx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border", activo ? "border-accent bg-accent text-[#160a02]" : "border-line")}>
          {activo && <IconCheck size={14} strokeWidth={3} />}
        </span>
      )}
      <span className="min-w-0">
        <span className={cx("block text-sm font-medium", activo && "text-accent")}>{titulo}</span>
        {texto && <span className="mt-0.5 block text-xs text-muted">{texto}</span>}
      </span>
    </button>
  );
}
