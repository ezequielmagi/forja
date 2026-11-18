"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { comprimir } from "@/lib/image";
import { sumarItems, tipoPorHora } from "@/lib/nutrition";
import { useStore } from "@/lib/store";
import type { Analisis, Comida, ItemComida, TipoComida } from "@/lib/types";
import { hoyISO, uid } from "@/lib/utils";
import { EditorItems, ITEM_VACIO, SelectorTipo } from "./MealEditor";
import { Button, Sheet } from "./ui";
import { IconCamara, IconChispa, IconGaleria, IconLapiz } from "./icons";

type Paso = "elegir" | "preview" | "analizando" | "editar" | "error";

export function MealCapture({
  abierto,
  onCerrar,
  archivoInicial,
  modo,
  fecha,
}: {
  abierto: boolean;
  onCerrar: () => void;
  archivoInicial?: File | null;
  modo: "foto" | "manual";
  fecha?: string;
}) {
  const { estado, agregarComida } = useStore();
  const [paso, setPaso] = useState<Paso>("elegir");
  const [foto, setFoto] = useState<string | null>(null);
  const [miniatura, setMiniatura] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [tipo, setTipo] = useState<TipoComida>(tipoPorHora());
  const [titulo, setTitulo] = useState("");
  const [items, setItems] = useState<ItemComida[]>([]);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [error, setError] = useState("");
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  // Reset al abrir
  useEffect(() => {
    if (!abierto) return;
    setFoto(null);
    setMiniatura(null);
    setNota("");
    setTipo(tipoPorHora());
    setAnalisis(null);
    setError("");
    if (modo === "manual") {
      setTitulo("");
      setItems([{ ...ITEM_VACIO }]);
      setPaso("editar");
    } else {
      setTitulo("");
      setItems([]);
      setPaso("elegir");
      if (archivoInicial) cargarArchivo(archivoInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  const recientes = useMemo(() => {
    const vistos = new Set<string>();
    return [...estado.comidas]
      .reverse()
      .filter((c) => {
        const k = c.titulo.toLowerCase();
        if (!c.titulo || vistos.has(k)) return false;
        vistos.add(k);
        return true;
      })
      .slice(0, 6);
  }, [estado.comidas]);

  async function cargarArchivo(f: File) {
    try {
      const [grande, chica] = await Promise.all([comprimir(f, 1280, 0.82), comprimir(f, 360, 0.7)]);
      setFoto(grande);
      setMiniatura(chica);
      setPaso("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer la imagen");
      setPaso("error");
    }
  }

  async function analizar() {
    if (!foto) return;
    setPaso("analizando");
    setError("");
    try {
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-app-key": estado.perfil?.claveApp ?? "" },
        body: JSON.stringify({ imagen: foto, nota }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      const a = data as Analisis;
      setAnalisis(a);
      setTitulo(a.titulo);
      setItems(a.items.length ? a.items : [{ ...ITEM_VACIO }]);
      setPaso("editar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo analizar");
      setPaso("error");
    }
  }

  async function guardar() {
    const limpios = items.filter((i) => i.nombre.trim() || i.kcal > 0);
    if (!limpios.length) return;
    const c: Comida = {
      id: uid(),
      fecha: fecha ?? hoyISO(),
      hora: Date.now(),
      tipo,
      titulo: titulo.trim() || limpios.map((i) => i.nombre).filter(Boolean).slice(0, 2).join(" + ") || "Comida",
      items: limpios,
      origen: analisis ? "foto" : "manual",
      confianza: analisis?.confianza,
      nota: nota || undefined,
    };
    await agregarComida(c, miniatura ?? undefined);
    onCerrar();
  }

  function repetir(c: Comida) {
    setTitulo(c.titulo);
    setItems(c.items.map((i) => ({ ...i })));
  }

  const total = sumarItems(items);
  const titulos: Record<Paso, string> = {
    elegir: "Foto de tu comida",
    preview: "¿Algo para aclarar?",
    analizando: "Analizando…",
    editar: analisis ? "Revisá la estimación" : "Cargar comida",
    error: "Ups",
  };

  const inputs = (
    <>
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && cargarArchivo(e.target.files[0])} />
      <input ref={galRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && cargarArchivo(e.target.files[0])} />
    </>
  );

  return (
    <Sheet
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulos[paso]}
      pie={
        paso === "preview" ? (
          <Button className="w-full" onClick={analizar}>
            <IconChispa size={18} /> Calcular calorías
          </Button>
        ) : paso === "editar" ? (
          <Button className="w-full" onClick={guardar} disabled={total.kcal <= 0}>
            Guardar · {Math.round(total.kcal)} kcal
          </Button>
        ) : undefined
      }
    >
      {inputs}

      {paso === "elegir" && (
        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted">Sacale una foto al plato antes de comer. La IA identifica cada alimento y estima porciones, calorías y macros. Después podés corregir todo.</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => camRef.current?.click()} className="card flex flex-col items-center gap-2 py-7 hover:border-accent">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-[#160a02]"><IconCamara size={26} /></span>
              <span className="text-sm font-medium">Sacar foto</span>
            </button>
            <button onClick={() => galRef.current?.click()} className="card flex flex-col items-center gap-2 py-7 hover:border-chalk/40">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2"><IconGaleria size={26} /></span>
              <span className="text-sm font-medium">Elegir de galería</span>
            </button>
          </div>
          <p className="text-xs text-dim">Tip: encuadrá el plato entero y algún cubierto: ayuda a calcular el tamaño.</p>
        </div>
      )}

      {paso === "preview" && foto && (
        <div className="space-y-4 pt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="Tu comida" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <div>
            <p className="eyebrow mb-2">Comida</p>
            <SelectorTipo valor={tipo} onChange={setTipo} />
          </div>
          <div>
            <p className="eyebrow mb-2">Aclaración (opcional)</p>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Ej: es media porción, la milanesa es al horno, el pan es integral…"
              className="field resize-none text-sm"
            />
          </div>
          <button onClick={() => camRef.current?.click()} className="text-xs text-muted underline underline-offset-4">Sacar otra foto</button>
        </div>
      )}

      {paso === "analizando" && (
        <div className="flex flex-col items-center gap-4 py-10">
          {miniatura && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={miniatura} alt="" className="h-40 w-40 rounded-3xl object-cover opacity-60" />
              <div className="absolute inset-0 animate-pulse rounded-3xl ring-2 ring-accent" />
            </div>
          )}
          <p className="text-sm text-muted">Identificando alimentos y porciones…</p>
        </div>
      )}

      {paso === "error" && (
        <div className="space-y-4 py-4">
          <p className="rounded-2xl border border-bad/30 bg-bad/10 p-4 text-sm text-bad">{error}</p>
          <div className="flex gap-2">
            {foto && <Button onClick={analizar} className="flex-1">Reintentar</Button>}
            <Button variant="ghost" className="flex-1" onClick={() => { setItems([{ ...ITEM_VACIO }]); setPaso("editar"); }}>
              <IconLapiz size={16} /> Cargar a mano
            </Button>
          </div>
        </div>
      )}

      {paso === "editar" && (
        <div className="space-y-4 pt-1">
          {analisis && (
            <div className="flex gap-3 rounded-2xl border border-line p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {miniatura && <img src={miniatura} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0 text-xs">
                <span className={
                  analisis.confianza === "alta" ? "text-ok" : analisis.confianza === "media" ? "text-warn" : "text-bad"
                }>
                  Confianza {analisis.confianza}
                </span>
                <p className="mt-0.5 text-muted">{analisis.notas}</p>
              </div>
            </div>
          )}

          {!analisis && recientes.length > 0 && (
            <div>
              <p className="eyebrow mb-2">Repetir una reciente</p>
              <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
                {recientes.map((c) => (
                  <button key={c.id} onClick={() => repetir(c)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-chalk">
                    {c.titulo} · {Math.round(sumarItems(c.items).kcal)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="eyebrow mb-2">Comida</p>
            <SelectorTipo valor={tipo} onChange={setTipo} />
          </div>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nombre (ej: Milanesa con puré)" className="field" />
          <EditorItems items={items} onChange={setItems} />
          {analisis && <p className="text-[11px] leading-relaxed text-dim">Es una estimación a partir de la foto. Si cambiás los gramos, kcal y macros se recalculan solos.</p>}
        </div>
      )}
    </Sheet>
  );
}
