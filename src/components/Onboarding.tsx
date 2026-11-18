"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Perfil } from "@/lib/types";
import { PERFIL_DEFAULT, ProfileForm } from "./ProfileForm";
import { Button } from "./ui";

export function Onboarding() {
  const { guardarPerfil } = useStore();
  const [p, setP] = useState<Perfil>(PERFIL_DEFAULT);
  const valido = p.nombre.trim() && p.edad > 10 && p.alturaCm > 100 && p.pesoKg > 30;

  return (
    <main className="mx-auto max-w-lg px-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-36">
      <p className="eyebrow text-accent">Calistenia + comida</p>
      <h1 className="display mt-2 text-6xl">Forja</h1>
      <p className="mt-3 max-w-sm text-muted">
        Contame un poco de vos y te armo la rutina con lo que tengas en la plaza, más tu objetivo de calorías para sacarle foto a cada comida.
      </p>
      <div className="mt-8">
        <ProfileForm valor={p} onChange={setP} />
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" disabled={!valido} onClick={() => guardarPerfil({ ...p, nombre: p.nombre.trim() }, true)}>
            Armar mi rutina
          </Button>
        </div>
      </div>
    </main>
  );
}
