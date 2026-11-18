import type { Actividad, Comida, ItemComida, Meta, Perfil, TipoComida } from "./types";

const FACTOR: Record<Actividad, number> = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, alto: 1.725 };
const AJUSTE: Record<Meta, number> = { bajar: -0.2, recomp: -0.1, mantener: 0, subir: 0.1 };
const PROTEINA_G_KG: Record<Meta, number> = { bajar: 2.2, recomp: 2.0, mantener: 1.8, subir: 1.8 };

export const ACTIVIDAD_LABEL: Record<Actividad, string> = {
  sedentario: "Sedentario (trabajo sentado, pocos pasos)",
  ligero: "Ligero (5–7 mil pasos o entreno 2–3×)",
  moderado: "Moderado (7–10 mil pasos y entreno 3–5×)",
  alto: "Alto (trabajo físico o entreno diario intenso)",
};

export const META_LABEL: Record<Meta, string> = {
  bajar: "Bajar grasa",
  recomp: "Recomposición",
  mantener: "Mantener",
  subir: "Ganar músculo",
};

export const TIPO_LABEL: Record<TipoComida, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
  snack: "Snack",
};

/** Metabolismo basal (Mifflin-St Jeor) */
export function basal(p: Perfil): number {
  const base = 10 * p.pesoKg + 6.25 * p.alturaCm - 5 * p.edad;
  return base + (p.sexo === "m" ? 5 : -161);
}

export function mantenimiento(p: Perfil): number {
  return basal(p) * FACTOR[p.actividad];
}

export interface Objetivos {
  kcal: number;
  proteinas: number;
  grasas: number;
  carbohidratos: number;
  mantenimiento: number;
}

export function objetivos(p: Perfil): Objetivos {
  const mant = mantenimiento(p);
  const kcal = Math.round(p.kcalManual ?? mant * (1 + AJUSTE[p.meta]));
  const proteinas = Math.round(p.pesoKg * PROTEINA_G_KG[p.meta]);
  const grasas = Math.round(p.pesoKg * 0.8);
  const carbohidratos = Math.max(0, Math.round((kcal - proteinas * 4 - grasas * 9) / 4));
  return { kcal, proteinas, grasas, carbohidratos, mantenimiento: Math.round(mant) };
}

export interface Totales {
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export const CERO: Totales = { kcal: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

export function sumarItems(items: ItemComida[]): Totales {
  return items.reduce(
    (a, i) => ({
      kcal: a.kcal + (i.kcal || 0),
      proteinas: a.proteinas + (i.proteinas || 0),
      carbohidratos: a.carbohidratos + (i.carbohidratos || 0),
      grasas: a.grasas + (i.grasas || 0),
    }),
    CERO,
  );
}

export function totalesDia(comidas: Comida[], fecha: string): Totales {
  return sumarItems(comidas.filter((c) => c.fecha === fecha).flatMap((c) => c.items));
}

/** Sugerencia de tipo de comida según la hora */
export function tipoPorHora(d = new Date()): TipoComida {
  const h = d.getHours();
  if (h < 11) return "desayuno";
  if (h < 15) return "almuerzo";
  if (h < 19) return "merienda";
  if (h < 23) return "cena";
  return "snack";
}

/** Escala un item al cambiar los gramos */
export function escalarItem(item: ItemComida, gramos: number): ItemComida {
  if (!item.gramos) return { ...item, gramos };
  const f = gramos / item.gramos;
  return {
    ...item,
    gramos,
    kcal: Math.round(item.kcal * f),
    proteinas: Math.round(item.proteinas * f * 10) / 10,
    carbohidratos: Math.round(item.carbohidratos * f * 10) / 10,
    grasas: Math.round(item.grasas * f * 10) / 10,
  };
}
