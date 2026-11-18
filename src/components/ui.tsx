"use client";

import { useEffect } from "react";
import { cx } from "@/lib/utils";
import { IconMas, IconMenos, IconX } from "./icons";

type BtnVariant = "primary" | "ghost" | "subtle" | "danger";

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const v: Record<BtnVariant, string> = {
    primary: "bg-accent text-[#160a02] font-semibold hover:brightness-110 active:brightness-95",
    ghost: "border border-line text-chalk hover:bg-surface-2",
    subtle: "bg-surface-2 text-chalk hover:bg-line",
    danger: "border border-bad/40 text-bad hover:bg-bad/10",
  };
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm transition disabled:opacity-40 disabled:pointer-events-none",
        v[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("card p-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function Chip({
  activo,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { activo?: boolean }) {
  return (
    <button
      className={cx(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition whitespace-nowrap",
        activo ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-chalk",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Stepper({
  valor,
  onChange,
  paso = 1,
  min = 0,
  max = 999,
  sufijo,
  compacto,
}: {
  valor: number;
  onChange: (n: number) => void;
  paso?: number;
  min?: number;
  max?: number;
  sufijo?: string;
  compacto?: boolean;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, Math.round(n * 100) / 100)));
  return (
    <div className={cx("flex items-center rounded-full bg-surface-2 border border-line", compacto ? "h-9" : "h-11")}>
      <button type="button" aria-label="Restar" onClick={() => set(valor - paso)} className="grid h-full w-9 place-items-center text-muted hover:text-chalk">
        <IconMenos size={16} />
      </button>
      <div className="flex min-w-10 items-baseline justify-center gap-0.5">
        <input
          inputMode="decimal"
          value={Number.isFinite(valor) ? valor : 0}
          onChange={(e) => set(Number(e.target.value.replace(",", ".")) || 0)}
          className="num w-10 bg-transparent text-center text-base font-semibold outline-none"
        />
        {sufijo && <span className="text-[10px] text-dim -ml-1">{sufijo}</span>}
      </div>
      <button type="button" aria-label="Sumar" onClick={() => set(valor + paso)} className="grid h-full w-9 place-items-center text-muted hover:text-chalk">
        <IconMas size={16} />
      </button>
    </div>
  );
}

export function Sheet({
  abierto,
  onCerrar,
  titulo,
  children,
  pie,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: React.ReactNode;
  children: React.ReactNode;
  pie?: React.ReactNode;
}) {
  useEffect(() => {
    if (!abierto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="anim-fade absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onCerrar} />
      <div className="anim-sheet relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[1.75rem] border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <div className="min-w-0 flex-1">{typeof titulo === "string" ? <h2 className="display truncate text-2xl">{titulo}</h2> : titulo}</div>
          <button onClick={onCerrar} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-muted hover:text-chalk">
            <IconX size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
        {pie && <div className="border-t border-line px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">{pie}</div>}
      </div>
    </div>
  );
}

export function Ring({ valor, max, size = 132, grosor = 11, children }: { valor: number; max: number; size?: number; grosor?: number; children?: React.ReactNode }) {
  const r = (size - grosor) / 2;
  const c = 2 * Math.PI * r;
  const p = max > 0 ? Math.min(valor / max, 1) : 0;
  const pasado = valor > max * 1.05;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-surface-2)" strokeWidth={grosor} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={pasado ? "var(--color-warn)" : "var(--color-accent)"}
          strokeWidth={grosor}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Barra({ valor, max, color, label }: { valor: number; max: number; color: string; label: string }) {
  const p = max > 0 ? Math.min(valor / max, 1) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="num">
          <b className="font-semibold text-chalk">{Math.round(valor)}</b>
          <span className="text-dim">/{Math.round(max)} g</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p * 100}%`, background: color }} />
      </div>
    </div>
  );
}

export function Vacio({ titulo, texto, accion }: { titulo: string; texto: string; accion?: React.ReactNode }) {
  return (
    <div className="card border-dashed p-6 text-center">
      <p className="display text-xl">{titulo}</p>
      <p className="mt-1 text-sm text-muted">{texto}</p>
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}

export function Segmentado<T extends string>({
  opciones,
  valor,
  onChange,
}: {
  opciones: { valor: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full border border-line bg-surface-2 p-1">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          className={cx(
            "flex-1 rounded-full px-3 py-2 text-xs font-medium transition",
            valor === o.valor ? "bg-chalk text-bg" : "text-muted hover:text-chalk",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
