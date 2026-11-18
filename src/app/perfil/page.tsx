"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { Button, Card, Sheet } from "@/components/ui";
import { IconAtras } from "@/components/icons";
import { useStore } from "@/lib/store";
import type { Estado, Perfil } from "@/lib/types";
import { fechaCorta, hoyISO } from "@/lib/utils";

export default function PerfilPage() {
  const { estado, guardarPerfil, importar, reiniciar } = useStore();
  const [p, setP] = useState<Perfil>(estado.perfil!);
  const [preguntar, setPreguntar] = useState(false);
  const [borrar, setBorrar] = useState(false);
  const [aviso, setAviso] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const original = estado.perfil!;
  const cambioEntreno =
    p.nivel !== original.nivel || p.plantilla !== original.plantilla || [...p.equipo].sort().join() !== [...original.equipo].sort().join();
  const cambio = JSON.stringify(p) !== JSON.stringify(original);

  function guardar(regenerar: boolean) {
    guardarPerfil(p, regenerar);
    setPreguntar(false);
    flash(regenerar ? "Perfil guardado y rutina regenerada" : "Perfil guardado");
  }

  function flash(t: string) {
    setAviso(t);
    setTimeout(() => setAviso(""), 2500);
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `forja-backup-${hoyISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function onImportar(f: File) {
    try {
      const data = JSON.parse(await f.text()) as Estado;
      if (!data || data.version !== 1 || !Array.isArray(data.sesiones)) throw new Error();
      importar(data);
      if (data.perfil) setP(data.perfil);
      flash("Backup restaurado");
    } catch {
      flash("Ese archivo no es un backup válido");
    }
  }

  const pesos = [...estado.pesos].reverse().slice(0, 8);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Volver"><IconAtras size={18} /></Link>
        <h1 className="display text-4xl">Perfil</h1>
      </header>

      <ProfileForm valor={p} onChange={setP} />

      <section className="space-y-3">
        <h3 className="display text-2xl">Clave de la app</h3>
        <p className="text-xs text-dim">Si definiste <code className="text-muted">APP_PASSWORD</code> en Vercel, escribila acá para poder analizar fotos.</p>
        <input type="password" value={p.claveApp ?? ""} onChange={(e) => setP({ ...p, claveApp: e.target.value || undefined })} placeholder="Clave" className="field" autoComplete="off" />
      </section>

      {pesos.length > 0 && (
        <section className="space-y-3">
          <h3 className="display text-2xl">Peso</h3>
          <Card className="divide-y divide-line p-0">
            {pesos.map((x) => (
              <div key={x.fecha} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="capitalize text-muted">{fechaCorta(x.fecha)}</span>
                <span className="num font-semibold">{x.kg} kg</span>
              </div>
            ))}
          </Card>
          <p className="text-xs text-dim">Se registra cada vez que actualizás tu peso arriba.</p>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="display text-2xl">Tus datos</h3>
        <p className="text-xs text-dim">Todo se guarda en este dispositivo. Bajate un backup de vez en cuando o para pasarlo a otro teléfono.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={exportar}>Exportar backup</Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>Importar backup</Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && onImportar(e.target.files[0])} />
        <button onClick={() => setBorrar(true)} className="text-xs text-bad/80 underline underline-offset-4">Borrar todo y empezar de cero</button>
      </section>

      <div className="sticky bottom-24 z-10">
        <Button className="w-full shadow-lg" disabled={!cambio} onClick={() => (cambioEntreno ? setPreguntar(true) : guardar(false))}>
          Guardar cambios
        </Button>
      </div>

      {aviso && (
        <div className="anim-fade fixed inset-x-0 top-4 z-50 mx-auto w-fit rounded-full bg-chalk px-4 py-2 text-sm font-medium text-bg">{aviso}</div>
      )}

      <Sheet abierto={preguntar} onCerrar={() => setPreguntar(false)} titulo="¿Regenerar la rutina?">
        <p className="text-sm text-muted">Cambiaste tu nivel, días o equipo. ¿Querés que arme la rutina de nuevo con eso? Perdés los cambios manuales de la rutina (el historial queda).</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => guardar(false)}>Solo guardar</Button>
          <Button onClick={() => guardar(true)}>Regenerar</Button>
        </div>
      </Sheet>

      <Sheet abierto={borrar} onCerrar={() => setBorrar(false)} titulo="¿Borrar todo?">
        <p className="text-sm text-muted">Se eliminan perfil, rutina, sesiones y comidas de este dispositivo. No se puede deshacer.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => setBorrar(false)}>Cancelar</Button>
          <Button variant="danger" onClick={() => reiniciar()}>Borrar todo</Button>
        </div>
      </Sheet>
    </div>
  );
}
