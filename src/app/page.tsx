"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCaptura } from "@/components/AppShell";
import { Barra, Button, Card, Ring } from "@/components/ui";
import { IconCamara, IconFlecha, IconFuego, IconLapiz, IconPerfil, IconPlay } from "@/components/icons";
import { POR_ID } from "@/lib/catalog";
import { objetivos, totalesDia } from "@/lib/nutrition";
import { minutosDia, proximoDia } from "@/lib/routine";
import { useStore } from "@/lib/store";
import { cx, fechaLarga, hoyISO, saludo, sumarDias } from "@/lib/utils";

export default function Hoy() {
  const { estado, iniciarSesion } = useStore();
  const { abrirCaptura } = useCaptura();
  const router = useRouter();
  const perfil = estado.perfil!;
  const hoy = hoyISO();
  const obj = objetivos(perfil);
  const tot = totalesDia(estado.comidas, hoy);
  const restan = obj.kcal - tot.kcal;

  const ultima = estado.sesiones.at(-1);
  const dia = estado.rutina ? proximoDia(estado.rutina, ultima?.diaId) : null;
  const entrenoHoy = estado.sesiones.some((s) => s.fecha === hoy);

  // Semana actual (lunes a domingo)
  const semana = useMemo(() => {
    const d = new Date();
    const lunes = sumarDias(hoy, -((d.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const f = sumarDias(lunes, i);
      return {
        f,
        letra: "LMMJVSD"[i],
        num: Number(f.slice(8)),
        entreno: estado.sesiones.some((s) => s.fecha === f),
        comida: estado.comidas.some((c) => c.fecha === f),
      };
    });
  }, [estado.sesiones, estado.comidas, hoy]);

  const sesionesSemana = semana.filter((d) => d.entreno).length;
  const metaSemana = estado.rutina?.dias.length ?? 0;

  function empezar() {
    if (!estado.enCurso && dia) iniciarSesion(dia.id);
    router.push("/entreno/sesion");
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <p className="eyebrow text-accent">{fechaLarga(hoy)}</p>
          <p className="mt-1 text-muted">{saludo()},</p>
          <h1 className="display text-4xl">{perfil.nombre}</h1>
        </div>
        <Link href="/perfil" aria-label="Perfil" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-muted hover:text-chalk">
          <IconPerfil size={20} />
        </Link>
      </header>

      {/* Semana */}
      <div className="grid grid-cols-7 gap-1.5">
        {semana.map((d) => (
          <div key={d.f} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold text-dim">{d.letra}</span>
            <span
              className={cx(
                "num grid h-9 w-9 place-items-center rounded-full text-xs font-semibold",
                d.f === hoy ? "ring-2 ring-accent text-chalk" : "text-muted",
                d.entreno && "bg-accent text-[#160a02] ring-0",
              )}
            >
              {d.num}
            </span>
            <span className={cx("h-1 w-1 rounded-full", d.comida ? "bg-carb" : "bg-transparent")} />
          </div>
        ))}
      </div>

      {/* Comida */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Comida de hoy</p>
          <Link href="/comida" className="flex items-center text-xs text-muted hover:text-chalk">Ver todo <IconFlecha size={14} /></Link>
        </div>
        <div className="mt-3 flex items-center gap-5">
          <Ring valor={tot.kcal} max={obj.kcal}>
            <div>
              <span className="display num block text-3xl">{Math.round(Math.abs(restan))}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted">{restan >= 0 ? "kcal restan" : "kcal de más"}</span>
            </div>
          </Ring>
          <div className="flex-1 space-y-3">
            <Barra label="Proteína" valor={tot.proteinas} max={obj.proteinas} color="var(--color-prot)" />
            <Barra label="Carbos" valor={tot.carbohidratos} max={obj.carbohidratos} color="var(--color-carb)" />
            <Barra label="Grasas" valor={tot.grasas} max={obj.grasas} color="var(--color-gras)" />
          </div>
        </div>
        <p className="num mt-3 text-xs text-dim">
          {Math.round(tot.kcal)} de {obj.kcal} kcal
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Button onClick={() => abrirCaptura("foto")}>
            <IconCamara size={18} /> Sacar foto
          </Button>
          <Button variant="ghost" onClick={() => abrirCaptura("manual")} aria-label="Cargar a mano">
            <IconLapiz size={18} />
          </Button>
        </div>
      </Card>

      {/* Entreno */}
      {dia && (
        <Card className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
          <p className="eyebrow">
            {estado.enCurso ? "Sesión en curso" : entrenoHoy ? "Ya entrenaste hoy · próximo" : "Próximo entreno"}
          </p>
          <h2 className="display mt-2 text-4xl">{estado.enCurso?.diaNombre ?? dia.nombre}</h2>
          <p className="mt-1 text-sm text-muted">{dia.foco}</p>
          <p className="num mt-1 text-xs text-dim">
            {dia.items.length} ejercicios · {dia.items.reduce((a, i) => a + i.series, 0)} series · ~{minutosDia(dia)} min
          </p>
          <ul className="mt-3 space-y-1">
            {dia.items.slice(0, 5).map((it) => (
              <li key={it.uid} className="flex justify-between text-sm">
                <span className="truncate text-chalk/85">{POR_ID[it.ejercicioId]?.nombre}</span>
                <span className="num shrink-0 pl-3 text-dim">{it.series}×</span>
              </li>
            ))}
          </ul>
          <Button className="mt-4 w-full" onClick={empezar}>
            <IconPlay size={16} /> {estado.enCurso ? "Continuar sesión" : "Empezar"}
          </Button>
        </Card>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="eyebrow">Esta semana</p>
          <p className="display num mt-2 text-3xl">
            {sesionesSemana}<span className="text-dim">/{metaSemana}</span>
          </p>
          <p className="text-xs text-muted">sesiones</p>
        </Card>
        <Card>
          <p className="eyebrow flex items-center gap-1"><IconFuego size={12} /> Racha</p>
          <p className="display num mt-2 text-3xl">{racha(estado.comidas.map((c) => c.fecha), hoy)}</p>
          <p className="text-xs text-muted">días registrando comida</p>
        </Card>
      </div>
    </div>
  );
}

function racha(fechas: string[], hoy: string): number {
  const set = new Set(fechas);
  let n = 0;
  let f = set.has(hoy) ? hoy : sumarDias(hoy, -1);
  while (set.has(f)) {
    n++;
    f = sumarDias(f, -1);
  }
  return n;
}
