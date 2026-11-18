"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/utils";
import { MealCapture } from "./MealCapture";
import { Onboarding } from "./Onboarding";
import { IconBarra, IconCamara, IconHoy, IconLista, IconPlato } from "./icons";

interface CapturaCtx {
  abrirCaptura: (modo: "foto" | "manual", fecha?: string) => void;
}
const Ctx = createContext<CapturaCtx>({ abrirCaptura: () => {} });
export const useCaptura = () => useContext(Ctx);

const TABS = [
  { href: "/", label: "Hoy", Icon: IconHoy },
  { href: "/entreno", label: "Entreno", Icon: IconBarra },
  { href: "/comida", label: "Comida", Icon: IconPlato },
  { href: "/ejercicios", label: "Ejercicios", Icon: IconLista },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { estado, listo } = useStore();
  const path = usePathname();
  const [cap, setCap] = useState<{ abierto: boolean; modo: "foto" | "manual"; fecha?: string }>({ abierto: false, modo: "foto" });

  const abrirCaptura = useCallback((modo: "foto" | "manual", fecha?: string) => setCap({ abierto: true, modo, fecha }), []);
  const cerrar = useCallback(() => setCap((c) => ({ ...c, abierto: false })), []);

  if (!listo) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <span className="display animate-pulse text-4xl text-accent">Forja</span>
      </div>
    );
  }

  if (!estado.perfil) return <Onboarding />;

  const enSesion = path.startsWith("/entreno/sesion");

  return (
    <Ctx.Provider value={{ abrirCaptura }}>
      <main className={cx("mx-auto w-full max-w-lg px-4 pt-[calc(env(safe-area-inset-top)+1rem)]", enSesion ? "pb-32" : "safe-bottom")}>{children}</main>

      {!enSesion && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
          <div className="mx-auto grid max-w-lg grid-cols-5 items-center px-2">
            {TABS.slice(0, 2).map((t) => <Tab key={t.href} {...t} activo={activo(path, t.href)} />)}
            <div className="flex justify-center">
              <button
                onClick={() => abrirCaptura("foto")}
                aria-label="Foto de comida"
                className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-accent text-[#160a02] shadow-[0_8px_30px_-6px_#ff6a1a99] transition active:scale-95"
              >
                <IconCamara size={26} />
              </button>
            </div>
            {TABS.slice(2).map((t) => <Tab key={t.href} {...t} activo={activo(path, t.href)} />)}
          </div>
        </nav>
      )}

      <MealCapture abierto={cap.abierto} onCerrar={cerrar} modo={cap.modo} fecha={cap.fecha} />
    </Ctx.Provider>
  );
}

function activo(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

function Tab({ href, label, Icon, activo }: { href: string; label: string; Icon: typeof IconHoy; activo: boolean }) {
  return (
    <Link href={href} className={cx("flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition", activo ? "text-accent" : "text-dim hover:text-muted")}>
      <Icon size={22} />
      {label}
    </Link>
  );
}
