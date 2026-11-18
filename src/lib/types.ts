// ───────────────────────── Ejercicios ─────────────────────────

/** Equipamiento opcional. Piso y pared se asumen siempre disponibles. */
export type Equipo =
  | "barra"
  | "paralelas"
  | "barra-baja"
  | "anillas"
  | "banco"
  | "banda"
  | "lastre";

export type Patron =
  | "empuje-horizontal"
  | "empuje-vertical"
  | "traccion-vertical"
  | "traccion-horizontal"
  | "rodilla"
  | "cadera"
  | "gemelos"
  | "core"
  | "brazos"
  | "skill";

export type Musculo =
  | "Pecho"
  | "Espalda"
  | "Hombros"
  | "Bíceps"
  | "Tríceps"
  | "Antebrazos"
  | "Cuádriceps"
  | "Isquios"
  | "Glúteos"
  | "Gemelos"
  | "Core";

export interface Objetivo {
  tipo: "reps" | "seg";
  min: number;
  max: number;
}

export interface Ejercicio {
  id: string;
  nombre: string;
  cadena: string;
  /** Dificultad global 1 (arranque) a 5 (muy avanzado) */
  nivel: 1 | 2 | 3 | 4 | 5;
  patron: Patron;
  musculos: Musculo[];
  secundarios?: Musculo[];
  /** Cada elemento es obligatorio; si es un array, alcanza con uno de ellos. */
  equipo: (Equipo | Equipo[])[];
  objetivo: Objetivo;
  pasos: string[];
  errores: string[];
  unilateral?: boolean;
}

export interface Cadena {
  id: string;
  nombre: string;
  patron: Patron;
  descripcion: string;
  ejercicios: Ejercicio[];
}

// ───────────────────────── Perfil ─────────────────────────

export type Sexo = "m" | "f";
export type Actividad = "sedentario" | "ligero" | "moderado" | "alto";
export type Meta = "bajar" | "recomp" | "mantener" | "subir";
export type NivelBase = "principiante" | "intermedio" | "avanzado";
export type Plantilla = "full3" | "tp4" | "ppl5";

export interface Perfil {
  nombre: string;
  sexo: Sexo;
  edad: number;
  alturaCm: number;
  pesoKg: number;
  actividad: Actividad;
  meta: Meta;
  nivel: NivelBase;
  plantilla: Plantilla;
  equipo: Equipo[];
  /** Si está definido, pisa el objetivo calculado */
  kcalManual?: number;
  /** Clave para el endpoint /api/analizar (APP_PASSWORD) */
  claveApp?: string;
}

// ───────────────────────── Rutina ─────────────────────────

export interface ItemRutina {
  uid: string;
  ejercicioId: string;
  series: number;
}

export interface DiaRutina {
  id: string;
  nombre: string;
  foco: string;
  items: ItemRutina[];
}

export interface Rutina {
  plantilla: Plantilla;
  dias: DiaRutina[];
  creada: string;
}

// ───────────────────────── Sesiones ─────────────────────────

export interface SerieLog {
  valor: number; // reps o segundos
  lastreKg?: number;
  rir?: number;
  hecha: boolean;
}

export interface EntradaSesion {
  ejercicioId: string;
  series: SerieLog[];
}

export interface Sesion {
  id: string;
  fecha: string; // YYYY-MM-DD
  inicio: number;
  fin?: number;
  diaId: string;
  diaNombre: string;
  entradas: EntradaSesion[];
  sensacion?: 1 | 2 | 3 | 4 | 5;
  nota?: string;
}

// ───────────────────────── Comida ─────────────────────────

export type TipoComida = "desayuno" | "almuerzo" | "merienda" | "cena" | "snack";

export interface ItemComida {
  nombre: string;
  gramos: number;
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export interface Comida {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: number; // timestamp
  tipo: TipoComida;
  titulo: string;
  items: ItemComida[];
  origen: "foto" | "manual";
  confianza?: "alta" | "media" | "baja";
  nota?: string;
  tieneFoto?: boolean;
}

export interface Analisis {
  titulo: string;
  items: ItemComida[];
  confianza: "alta" | "media" | "baja";
  notas: string;
}

// ───────────────────────── Estado global ─────────────────────────

export interface Estado {
  version: 1;
  perfil: Perfil | null;
  rutina: Rutina | null;
  sesiones: Sesion[];
  comidas: Comida[];
  /** Sesión en curso (se guarda para no perderla si se cierra la app) */
  enCurso: Sesion | null;
  /** Registro de peso corporal */
  pesos: { fecha: string; kg: number }[];
}
