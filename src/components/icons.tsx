import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 22, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      {children}
    </svg>
  );
}

export const IconHoy = (p: P) => (
  <Base {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></Base>
);
export const IconBarra = (p: P) => (
  <Base {...p}><path d="M3 5h18" /><path d="M7 5v4a5 5 0 0 0 10 0V5" /><path d="M12 14v7" /><path d="M9 21h6" /></Base>
);
export const IconCamara = (p: P) => (
  <Base {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></Base>
);
export const IconPlato = (p: P) => (
  <Base {...p}><path d="M3 12h18a9 9 0 0 1-18 0Z" /><path d="M8 8c0-2 2-2 2-4M12 8c0-2 2-2 2-4" /></Base>
);
export const IconLista = (p: P) => (
  <Base {...p}><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></Base>
);
export const IconPerfil = (p: P) => (
  <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Base>
);
export const IconMas = (p: P) => <Base {...p}><path d="M12 5v14M5 12h14" /></Base>;
export const IconMenos = (p: P) => <Base {...p}><path d="M5 12h14" /></Base>;
export const IconCheck = (p: P) => <Base {...p}><path d="m5 12.5 4.5 4.5L19 7" /></Base>;
export const IconX = (p: P) => <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>;
export const IconFlecha = (p: P) => <Base {...p}><path d="m9 6 6 6-6 6" /></Base>;
export const IconAtras = (p: P) => <Base {...p}><path d="m15 6-6 6 6 6" /></Base>;
export const IconFuego = (p: P) => (
  <Base {...p}><path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.5 1.5 2 2.5 2 0-3-1-4.5.5-7Z" /></Base>
);
export const IconBasura = (p: P) => (
  <Base {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Base>
);
export const IconCambiar = (p: P) => (
  <Base {...p}><path d="M7 4 3 8l4 4" /><path d="M3 8h13a4 4 0 0 1 4 4" /><path d="m17 20 4-4-4-4" /><path d="M21 16H8a4 4 0 0 1-4-4" /></Base>
);
export const IconSubir = (p: P) => <Base {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Base>;
export const IconBajar = (p: P) => <Base {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Base>;
export const IconPlay = (p: P) => <Base {...p}><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></Base>;
export const IconGaleria = (p: P) => (
  <Base {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></Base>
);
export const IconLapiz = (p: P) => <Base {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></Base>;
export const IconReloj = (p: P) => <Base {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></Base>;
export const IconBuscar = (p: P) => <Base {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Base>;
export const IconChispa = (p: P) => (
  <Base {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></Base>
);
