import type { Cadena, Ejercicio, Equipo, Musculo, Objetivo, Patron } from "./types";

// Helpers para que el catálogo se lea fácil
const r = (min: number, max: number): Objetivo => ({ tipo: "reps", min, max });
const s = (min: number, max: number): Objetivo => ({ tipo: "seg", min, max });

type Def = Omit<Ejercicio, "cadena" | "patron">;

function cadena(id: string, nombre: string, patron: Patron, descripcion: string, ejercicios: Def[]): Cadena {
  return {
    id,
    nombre,
    patron,
    descripcion,
    ejercicios: ejercicios.map((e) => ({ ...e, cadena: id, patron })),
  };
}

const PECHO: Musculo[] = ["Pecho", "Tríceps"];
const ESPALDA: Musculo[] = ["Espalda", "Bíceps"];

/**
 * Cada cadena va de lo más fácil a lo más difícil.
 * La app usa ese orden para sugerirte cuándo "subir de nivel".
 */
export const CADENAS: Cadena[] = [
  // ═══════════════════════ EMPUJE HORIZONTAL ═══════════════════════
  cadena("flexiones", "Flexiones", "empuje-horizontal", "La base del empuje: de la pared a la flexión a un brazo.", [
    {
      id: "flex-pared", nombre: "Flexiones contra la pared", nivel: 1, musculos: PECHO, secundarios: ["Hombros"], equipo: [], objetivo: r(12, 20),
      pasos: ["Parado a un paso largo de la pared, manos a la altura del pecho.", "Cuerpo recto de talones a cabeza.", "Bajá hasta que la nariz casi toque la pared y empujá."],
      errores: ["Doblar la cadera.", "Codos abiertos a 90° del cuerpo."],
    },
    {
      id: "flex-inclinadas", nombre: "Flexiones inclinadas (manos en banco)", nivel: 1, musculos: PECHO, secundarios: ["Hombros"], equipo: [["banco", "barra-baja"]], objetivo: r(10, 20),
      pasos: ["Manos en un banco, baranda o barra baja, un poco más abiertas que los hombros.", "Glúteos y abdomen apretados.", "Pecho al borde, codos a ~45°."],
      errores: ["Cabeza adelantada buscando el banco.", "Rango corto."],
    },
    {
      id: "flex-rodillas", nombre: "Flexiones de rodillas", nivel: 1, musculos: PECHO, secundarios: ["Hombros"], equipo: [], objetivo: r(10, 20),
      pasos: ["Rodillas apoyadas, línea recta de rodilla a cabeza.", "Bajá el pecho entre las manos.", "Empujá el piso lejos al subir."],
      errores: ["Cadera atrás (queda una 'V').", "No llegar abajo."],
    },
    {
      id: "flex-clasicas", nombre: "Flexiones", nivel: 2, musculos: PECHO, secundarios: ["Hombros", "Core"], equipo: [], objetivo: r(8, 20),
      pasos: ["Manos debajo de los hombros, dedos hacia adelante.", "Cuerpo como tabla: glúteos y abdomen firmes.", "Pecho a un puño del piso, codos a ~45°.", "Al subir, separá un poco los omóplatos."],
      errores: ["Cadera hundida.", "Codos en 'T'.", "Medias repeticiones."],
    },
    {
      id: "flex-diamante", nombre: "Flexiones diamante", nivel: 2, musculos: ["Tríceps", "Pecho"], equipo: [], objetivo: r(8, 15),
      pasos: ["Índices y pulgares formando un rombo debajo del esternón.", "Codos pegados al cuerpo.", "Bajá controlado hasta tocar las manos con el pecho."],
      errores: ["Abrir los codos.", "Muñecas doloridas: abrí un poco las manos."],
    },
    {
      id: "flex-pies-alto", nombre: "Flexiones con pies en alto", nivel: 3, musculos: PECHO, secundarios: ["Hombros"], equipo: ["banco"], objetivo: r(8, 15),
      pasos: ["Pies en un banco o escalón, manos en el piso.", "Mismo cuerpo recto que en la flexión.", "Cuanto más alto el pie, más hombro trabaja."],
      errores: ["Cadera hundida.", "Cabeza colgando."],
    },
    {
      id: "flex-anillas", nombre: "Flexiones en anillas", nivel: 3, musculos: PECHO, secundarios: ["Hombros", "Core"], equipo: ["anillas"], objetivo: r(8, 15),
      pasos: ["Anillas a 10–20 cm del piso.", "Controlá que no se abran.", "Arriba, girá las palmas hacia afuera (rotación)."],
      errores: ["Dejar que las anillas se separen.", "Perder la línea del cuerpo."],
    },
    {
      id: "flex-arquero", nombre: "Flexiones arquero", nivel: 3, musculos: PECHO, secundarios: ["Hombros"], equipo: [], objetivo: r(5, 10), unilateral: true,
      pasos: ["Manos muy abiertas.", "Bajá hacia un lado: ese brazo flexiona, el otro queda casi recto.", "Alterná lados o hacé todas de un lado."],
      errores: ["Doblar el brazo de apoyo.", "Rotar la cadera."],
    },
    {
      id: "flex-pseudo-planche", nombre: "Flexiones pseudo planche", nivel: 4, musculos: ["Pecho", "Hombros"], secundarios: ["Tríceps", "Core"], equipo: [], objetivo: r(5, 12),
      pasos: ["Manos a la altura de la cintura, dedos hacia afuera o atrás.", "Inclinate hacia adelante hasta que los hombros pasen las manos.", "Mantené esa inclinación en toda la repetición."],
      errores: ["Perder la inclinación al bajar.", "Escápulas sueltas."],
    },
    {
      id: "flex-un-brazo", nombre: "Flexiones a un brazo", nivel: 5, musculos: PECHO, secundarios: ["Core", "Hombros"], equipo: [], objetivo: r(3, 8), unilateral: true,
      pasos: ["Piernas abiertas para estabilizar.", "Mano debajo del pecho, la otra en la espalda.", "Bajá sin rotar el torso."],
      errores: ["Rotar el cuerpo para hacer trampa.", "Empezar sin dominar las arquero."],
    },
  ]),

  cadena("fondos", "Fondos", "empuje-horizontal", "Pecho bajo y tríceps. El 'press de banca' de la plaza.", [
    {
      id: "fondos-banco", nombre: "Fondos en banco", nivel: 1, musculos: ["Tríceps"], secundarios: ["Pecho", "Hombros"], equipo: ["banco"], objetivo: r(10, 20),
      pasos: ["Manos en el borde del banco, dedos hacia adelante.", "Piernas flexionadas (más fácil) o estiradas (más difícil).", "Bajá hasta ~90° de codo."],
      errores: ["Bajar demasiado y forzar el hombro.", "Alejarse del banco."],
    },
    {
      id: "fondos-negativos", nombre: "Fondos negativos en paralelas", nivel: 2, musculos: ["Pecho", "Tríceps"], equipo: ["paralelas"], objetivo: r(4, 8),
      pasos: ["Subí de un salto a brazos estirados.", "Bajá en 4–5 segundos hasta abajo.", "Volvé a subir con las piernas."],
      errores: ["Caerse en la última parte.", "Hombros pegados a las orejas."],
    },
    {
      id: "fondos-banda", nombre: "Fondos con banda", nivel: 2, musculos: ["Pecho", "Tríceps"], equipo: ["paralelas", "banda"], objetivo: r(6, 12),
      pasos: ["Banda atada entre las dos barras, rodillas apoyadas encima.", "Torso un poco inclinado hacia adelante.", "Bajá hasta que el hombro quede a la altura del codo."],
      errores: ["Rebotar con la banda abajo."],
    },
    {
      id: "fondos-paralelas", nombre: "Fondos en paralelas", nivel: 3, musculos: ["Pecho", "Tríceps"], secundarios: ["Hombros"], equipo: ["paralelas"], objetivo: r(6, 15),
      pasos: ["Brazos estirados, hombros lejos de las orejas.", "Inclinate un poco adelante para más pecho.", "Bajá hasta hombro por debajo del codo y empujá."],
      errores: ["Encoger los hombros.", "Rango corto.", "Balancear las piernas."],
    },
    {
      id: "fondos-anillas", nombre: "Fondos en anillas", nivel: 4, musculos: ["Pecho", "Tríceps"], secundarios: ["Hombros", "Core"], equipo: ["anillas"], objetivo: r(5, 10),
      pasos: ["Primero dominá el soporte arriba (30 s estable).", "Anillas pegadas al cuerpo todo el recorrido.", "Arriba, palmas hacia afuera."],
      errores: ["Anillas que se abren.", "Saltear el soporte."],
    },
    {
      id: "fondos-lastre", nombre: "Fondos con lastre", nivel: 4, musculos: ["Pecho", "Tríceps"], secundarios: ["Hombros"], equipo: ["paralelas", "lastre"], objetivo: r(5, 10),
      pasos: ["Mochila con peso o cinturón.", "Misma técnica que el fondo normal.", "Subí 2,5 kg cuando pases el máximo del rango."],
      errores: ["Sacrificar rango por meter peso."],
    },
  ]),

  // ═══════════════════════ EMPUJE VERTICAL ═══════════════════════
  cadena("vertical", "Empuje vertical", "empuje-vertical", "Hombros fuertes rumbo a la vertical (handstand push-up).", [
    {
      id: "pike", nombre: "Flexiones pike", nivel: 2, musculos: ["Hombros"], secundarios: ["Tríceps"], equipo: [], objetivo: r(8, 15),
      pasos: ["Cadera arriba formando una 'V' invertida.", "Bajá la cabeza hacia adelante de las manos (forma un triángulo).", "Empujá hacia arriba y atrás."],
      errores: ["Bajar la cabeza entre las manos.", "Rodillas muy dobladas."],
    },
    {
      id: "pike-elevado", nombre: "Flexiones pike con pies en alto", nivel: 3, musculos: ["Hombros"], secundarios: ["Tríceps"], equipo: ["banco"], objetivo: r(6, 12),
      pasos: ["Pies en un banco, cadera bien arriba.", "Torso lo más vertical posible.", "Cabeza hacia adelante de las manos."],
      errores: ["Torso inclinado (se vuelve una flexión).", "Codos abiertos."],
    },
    {
      id: "vertical-pared", nombre: "Vertical contra la pared (pecho a la pared)", nivel: 3, musculos: ["Hombros"], secundarios: ["Core", "Tríceps"], equipo: [], objetivo: s(20, 60),
      pasos: ["Caminá con los pies por la pared hasta quedar casi vertical.", "Manos a un palmo de la pared.", "Empujá el piso, cuerpo en línea, mirada entre las manos."],
      errores: ["Espalda arqueada (banana).", "Hombros cerrados."],
    },
    {
      id: "hspu-negativa", nombre: "Flexión en vertical negativa", nivel: 4, musculos: ["Hombros", "Tríceps"], equipo: [], objetivo: r(3, 6),
      pasos: ["Vertical de espaldas a la pared.", "Bajá en 4–5 s hasta tocar con la cabeza un almohadón.", "Bajá de la vertical y repetí."],
      errores: ["Caer de golpe al final.", "Codos abiertos hacia los costados."],
    },
    {
      id: "hspu-pared", nombre: "Flexiones en vertical contra la pared", nivel: 4, musculos: ["Hombros", "Tríceps"], secundarios: ["Core"], equipo: [], objetivo: r(4, 10),
      pasos: ["Vertical contra la pared.", "Bajá formando un trípode cabeza-manos.", "Empujá hasta brazos estirados."],
      errores: ["Patear la pared para subir.", "Bajar sin control."],
    },
    {
      id: "hspu-libre", nombre: "Flexiones en vertical libres", nivel: 5, musculos: ["Hombros", "Tríceps"], secundarios: ["Core"], equipo: [], objetivo: r(2, 6),
      pasos: ["Requiere vertical libre estable de 20+ s.", "Bajá controlando el equilibrio con los dedos.", "Subí manteniendo la línea."],
      errores: ["Intentarla sin vertical libre sólida."],
    },
  ]),

  // ═══════════════════════ TRACCIÓN VERTICAL ═══════════════════════
  cadena("dominadas", "Dominadas", "traccion-vertical", "De colgarte a dominadas con peso. La reina de la espalda.", [
    {
      id: "colgado-activo", nombre: "Colgado activo", nivel: 1, musculos: ["Espalda", "Antebrazos"], equipo: ["barra"], objetivo: s(20, 45),
      pasos: ["Colgate con agarre prono, brazos estirados.", "Bajá los hombros lejos de las orejas sin doblar codos.", "Mantené la posición."],
      errores: ["Quedar colgado pasivo de los hombros."],
    },
    {
      id: "retraccion-escapular", nombre: "Retracciones escapulares colgado", nivel: 1, musculos: ["Espalda"], equipo: ["barra"], objetivo: r(8, 15),
      pasos: ["Colgado con brazos estirados.", "Subí el cuerpo unos centímetros solo bajando y juntando los omóplatos.", "Volvé lento."],
      errores: ["Doblar los codos."],
    },
    {
      id: "dominada-negativa", nombre: "Dominadas negativas", nivel: 2, musculos: ESPALDA, equipo: ["barra"], objetivo: r(4, 8),
      pasos: ["Subí con un salto o un banco hasta el mentón sobre la barra.", "Bajá en 4–6 segundos.", "Controlá también el final."],
      errores: ["Soltarse en la mitad.", "Rangos cortos."],
    },
    {
      id: "dominada-banda", nombre: "Dominadas con banda", nivel: 2, musculos: ESPALDA, equipo: ["barra", "banda"], objetivo: r(6, 12),
      pasos: ["Banda en la barra, pie o rodilla adentro.", "Pecho hacia la barra, codos hacia las costillas.", "Bajá hasta brazos estirados."],
      errores: ["Rebotar abajo con la banda."],
    },
    {
      id: "dominada-supina", nombre: "Dominadas supinas (chin-ups)", nivel: 3, musculos: ["Espalda", "Bíceps"], equipo: ["barra"], objetivo: r(5, 12),
      pasos: ["Palmas hacia vos, ancho de hombros.", "Empezá bajando los hombros.", "Mentón sobre la barra, bajada completa."],
      errores: ["Patear para subir.", "No estirar abajo."],
    },
    {
      id: "dominada", nombre: "Dominadas", nivel: 3, musculos: ESPALDA, secundarios: ["Antebrazos"], equipo: ["barra"], objetivo: r(5, 12),
      pasos: ["Agarre prono un poco más ancho que los hombros.", "Pecho arriba, piernas juntas y quietas.", "Tirá hasta el mentón sobre la barra.", "Bajá hasta brazos estirados."],
      errores: ["Kipping (balanceo).", "Medias repeticiones.", "Cuello estirado hacia la barra."],
    },
    {
      id: "dominada-lsit", nombre: "Dominadas en L", nivel: 4, musculos: ESPALDA, secundarios: ["Core"], equipo: ["barra"], objetivo: r(4, 10),
      pasos: ["Piernas estiradas al frente, a 90°.", "Mantené la L toda la serie.", "Tirá sin perder la altura de piernas."],
      errores: ["Dejar caer las piernas al cansarte."],
    },
    {
      id: "dominada-arquero", nombre: "Dominadas arquero", nivel: 4, musculos: ESPALDA, equipo: ["barra"], objetivo: r(3, 8), unilateral: true,
      pasos: ["Agarre muy ancho.", "Subí hacia una mano; el otro brazo queda casi recto.", "Alterná lados."],
      errores: ["Doblar el brazo 'de ayuda'."],
    },
    {
      id: "dominada-lastre", nombre: "Dominadas con lastre", nivel: 4, musculos: ESPALDA, equipo: ["barra", "lastre"], objetivo: r(4, 10),
      pasos: ["Mochila o cinturón con peso.", "Técnica estricta.", "Sumá 2,5 kg cuando pases el máximo del rango."],
      errores: ["Meter peso con técnica floja."],
    },
    {
      id: "dominada-un-brazo-asistida", nombre: "Dominada a un brazo asistida", nivel: 5, musculos: ESPALDA, equipo: ["barra", "banda"], objetivo: r(3, 6), unilateral: true,
      pasos: ["Una mano en la barra, la otra en una banda o toalla colgada.", "La mano de asistencia ayuda lo mínimo.", "Bajá controlado."],
      errores: ["Tirar mucho con el brazo de ayuda.", "Rotar el cuerpo."],
    },
  ]),

  cadena("muscle-up", "Muscle-up", "skill", "Tirón explosivo + transición + fondo. Requiere 10 dominadas limpias.", [
    {
      id: "dominada-explosiva", nombre: "Dominadas explosivas al pecho", nivel: 3, musculos: ESPALDA, equipo: ["barra"], objetivo: r(3, 6),
      pasos: ["Desde colgado, tirá lo más rápido posible.", "Objetivo: que la barra llegue al pecho o al ombligo.", "Bajá controlado."],
      errores: ["Tirar hacia el mentón (falta altura)."],
    },
    {
      id: "transicion-baja", nombre: "Transición en barra baja", nivel: 3, musculos: ["Espalda", "Pecho", "Tríceps"], equipo: [["barra-baja", "anillas"]], objetivo: r(4, 8),
      pasos: ["Barra a la altura del pecho, pies en el piso.", "Practicá pasar las muñecas por encima de la barra con ayuda de piernas.", "Terminá en soporte con brazos estirados."],
      errores: ["Agarre sin 'muñeca falsa'.", "Codos que se abren."],
    },
    {
      id: "muscle-up-banda", nombre: "Muscle-up con banda", nivel: 4, musculos: ["Espalda", "Pecho", "Tríceps"], equipo: ["barra", "banda"], objetivo: r(3, 6),
      pasos: ["Banda en la barra, pies adentro.", "Tirón explosivo hacia la cadera.", "Pecho por encima de la barra y empujá."],
      errores: ["Un brazo antes que el otro (chicken wing)."],
    },
    {
      id: "muscle-up-negativo", nombre: "Muscle-up negativo", nivel: 4, musculos: ["Espalda", "Pecho", "Tríceps"], equipo: ["barra"], objetivo: r(3, 5),
      pasos: ["Subí a soporte sobre la barra con un salto.", "Bajá lento pasando por la transición.", "Terminá en dominada negativa."],
      errores: ["Caer rápido en la transición."],
    },
    {
      id: "muscle-up", nombre: "Muscle-up", nivel: 5, musculos: ["Espalda", "Pecho", "Tríceps"], secundarios: ["Core"], equipo: ["barra"], objetivo: r(2, 6),
      pasos: ["Leve balanceo hacia atrás.", "Tirón explosivo a la cadera, codos rápidos por encima.", "Empujá hasta soporte."],
      errores: ["Chicken wing.", "Usar un kipping descontrolado."],
    },
  ]),

  // ═══════════════════════ TRACCIÓN HORIZONTAL ═══════════════════════
  cadena("remo", "Remo", "traccion-horizontal", "Espalda media y grosor. Fundamental para hombros sanos.", [
    {
      id: "remo-toalla", nombre: "Remo con toalla en puerta", nivel: 1, musculos: ESPALDA, equipo: [], objetivo: r(10, 20),
      pasos: ["Toalla atada a un picaporte (puerta cerrada hacia vos).", "Pies cerca de la puerta, cuerpo inclinado atrás.", "Tirá hasta el pecho juntando omóplatos."],
      errores: ["Usar una puerta que se abra hacia vos."],
    },
    {
      id: "remo-australiano-rodillas", nombre: "Remo australiano con rodillas flexionadas", nivel: 1, musculos: ESPALDA, equipo: [["barra-baja", "anillas"]], objetivo: r(10, 15),
      pasos: ["Debajo de una barra baja, pies apoyados y rodillas a 90°.", "Cuerpo recto de rodillas a cabeza.", "Pecho a la barra."],
      errores: ["Cadera que cae.", "Tirar con el cuello."],
    },
    {
      id: "remo-australiano", nombre: "Remo australiano", nivel: 2, musculos: ESPALDA, secundarios: ["Hombros"], equipo: [["barra-baja", "anillas"]], objetivo: r(8, 15),
      pasos: ["Piernas estiradas, talones en el piso.", "Cuerpo como tabla.", "Tirá hasta tocar la barra con el pecho, pausa 1 s."],
      errores: ["Cadera hundida.", "Codos muy abiertos."],
    },
    {
      id: "remo-pies-alto", nombre: "Remo australiano con pies en alto", nivel: 3, musculos: ESPALDA, secundarios: ["Hombros"], equipo: [["barra-baja", "anillas"], "banco"], objetivo: r(8, 12),
      pasos: ["Pies en un banco: cuerpo paralelo al piso.", "Tirá hasta el pecho.", "Bajá controlado hasta brazos estirados."],
      errores: ["Perder la línea del cuerpo."],
    },
    {
      id: "remo-anillas-arquero", nombre: "Remo arquero", nivel: 4, musculos: ESPALDA, equipo: [["barra-baja", "anillas"]], objetivo: r(5, 10), unilateral: true,
      pasos: ["Tirá hacia una mano mientras el otro brazo queda estirado.", "Alterná o hacé todas de un lado.", "Cuerpo sin rotar."],
      errores: ["Doblar el brazo de apoyo."],
    },
    {
      id: "remo-tuck-front", nombre: "Remo en tuck front lever", nivel: 5, musculos: ["Espalda"], secundarios: ["Core", "Bíceps"], equipo: [["barra", "anillas"]], objetivo: r(3, 8),
      pasos: ["Colgado, llevá las rodillas al pecho y el cuerpo horizontal.", "Desde ahí tirá la barra hacia el abdomen.", "Mantené la cadera alta."],
      errores: ["Dejar caer la cadera."],
    },
  ]),

  cadena("front-lever", "Front lever", "skill", "Isometría de espalda y core. Progresá de a una posición.", [
    {
      id: "fl-tuck", nombre: "Tuck front lever", nivel: 3, musculos: ["Espalda", "Core"], equipo: [["barra", "anillas"]], objetivo: s(8, 20),
      pasos: ["Colgado, brazos estirados.", "Rodillas al pecho y espalda horizontal.", "Bajá los hombros y apretá la barra hacia la cadera."],
      errores: ["Doblar los codos.", "Espalda redonda con cadera baja."],
    },
    {
      id: "fl-tuck-avanzado", nombre: "Tuck front lever avanzado", nivel: 4, musculos: ["Espalda", "Core"], equipo: [["barra", "anillas"]], objetivo: s(8, 15),
      pasos: ["Como el tuck, pero con la espalda plana.", "Rodillas a 90° de la cadera.", "Cuerpo paralelo al piso."],
      errores: ["Volver a redondear la espalda."],
    },
    {
      id: "fl-una-pierna", nombre: "Front lever a una pierna", nivel: 4, musculos: ["Espalda", "Core"], equipo: [["barra", "anillas"]], objetivo: s(6, 12),
      pasos: ["Una pierna estirada, la otra en tuck avanzado.", "Alterná la pierna en cada serie."],
      errores: ["Bajar la cadera."],
    },
    {
      id: "fl-straddle", nombre: "Front lever straddle", nivel: 5, musculos: ["Espalda", "Core"], equipo: [["barra", "anillas"]], objetivo: s(5, 10),
      pasos: ["Piernas estiradas y abiertas.", "Cuanto más abiertas, más fácil.", "Glúteos apretados."],
      errores: ["Flexionar la cadera."],
    },
    {
      id: "fl-completo", nombre: "Front lever completo", nivel: 5, musculos: ["Espalda", "Core"], equipo: [["barra", "anillas"]], objetivo: s(3, 10),
      pasos: ["Cuerpo recto y horizontal, piernas juntas.", "Brazos estirados empujando la barra hacia la cadera."],
      errores: ["Codos doblados.", "Cadera quebrada."],
    },
  ]),

  // ═══════════════════════ BRAZOS ═══════════════════════
  cadena("biceps", "Bíceps", "brazos", "Aislamiento de bíceps con tu peso.", [
    {
      id: "curl-toalla", nombre: "Curl isométrico con toalla", nivel: 1, musculos: ["Bíceps"], equipo: [], objetivo: s(20, 40),
      pasos: ["Pisá el centro de una toalla y agarrá las puntas.", "Codos a 90°, tirá fuerte hacia arriba.", "Mantené la tensión."],
      errores: ["Tirar con la espalda."],
    },
    {
      id: "curl-barra-baja", nombre: "Curl de bíceps en barra baja", nivel: 2, musculos: ["Bíceps"], secundarios: ["Antebrazos"], equipo: [["barra-baja", "anillas"]], objetivo: r(8, 15),
      pasos: ["Debajo de la barra, agarre supino estrecho.", "Codos fijos apuntando a la barra.", "Llevá la frente a las manos doblando solo el codo."],
      errores: ["Convertirlo en remo moviendo los codos."],
    },
    {
      id: "curl-anillas", nombre: "Curl en anillas", nivel: 3, musculos: ["Bíceps"], equipo: ["anillas"], objetivo: r(8, 12),
      pasos: ["Anillas a la altura del pecho, cuerpo inclinado atrás.", "Codos altos y quietos.", "Palmas hacia la cara al subir."],
      errores: ["Bajar los codos."],
    },
    {
      id: "chin-isometrica", nombre: "Isometría de chin-up (90°)", nivel: 3, musculos: ["Bíceps", "Espalda"], equipo: ["barra"], objetivo: s(15, 30),
      pasos: ["Agarre supino, subí a codos a 90°.", "Mantené sin moverte."],
      errores: ["Encoger los hombros."],
    },
  ]),

  cadena("triceps", "Tríceps", "brazos", "Tríceps aislado sin máquinas.", [
    {
      id: "ext-triceps-banco", nombre: "Extensión de tríceps en banco", nivel: 2, musculos: ["Tríceps"], equipo: [["banco", "barra-baja"]], objetivo: r(8, 15),
      pasos: ["Manos en el borde del banco, cuerpo recto como en flexión.", "Doblá solo los codos llevando la frente bajo el banco.", "Extendé los codos para volver."],
      errores: ["Mover el hombro en lugar del codo."],
    },
    {
      id: "ext-triceps-anillas", nombre: "Extensión de tríceps en anillas", nivel: 3, musculos: ["Tríceps"], equipo: ["anillas"], objetivo: r(8, 12),
      pasos: ["Anillas a la altura del pecho, inclinado hacia adelante.", "Codos al frente, bajá la cabeza entre las anillas.", "Extendé completamente."],
      errores: ["Abrir los codos."],
    },
    {
      id: "flex-tigre", nombre: "Flexiones tigre (tiger bend)", nivel: 4, musculos: ["Tríceps"], secundarios: ["Hombros"], equipo: [], objetivo: r(5, 10),
      pasos: ["Desde plancha sobre antebrazos, empujá hasta brazos estirados.", "Volvé controlado a los antebrazos."],
      errores: ["Usar la cadera para subir."],
    },
  ]),

  // ═══════════════════════ RODILLA ═══════════════════════
  cadena("sentadilla", "Sentadilla", "rodilla", "Cuádriceps y glúteos, de la asistida a la pistol.", [
    {
      id: "sentadilla-asistida", nombre: "Sentadilla asistida", nivel: 1, musculos: ["Cuádriceps", "Glúteos"], equipo: [], objetivo: r(12, 20),
      pasos: ["Agarrate de un poste o baranda.", "Bajá la cadera atrás y abajo.", "Usá los brazos solo lo necesario."],
      errores: ["Rodillas que se van hacia adentro."],
    },
    {
      id: "sentadilla", nombre: "Sentadilla con tu peso", nivel: 1, musculos: ["Cuádriceps", "Glúteos"], equipo: [], objetivo: r(15, 25),
      pasos: ["Pies al ancho de hombros, puntas un poco afuera.", "Bajá hasta que la cadera pase la rodilla.", "Talones apoyados todo el tiempo."],
      errores: ["Levantar los talones.", "Rodillas hacia adentro."],
    },
    {
      id: "sentadilla-pausa", nombre: "Sentadilla con pausa (3 s abajo)", nivel: 2, musculos: ["Cuádriceps", "Glúteos"], equipo: [], objetivo: r(10, 15),
      pasos: ["Bajá en 3 segundos.", "Quedate 3 segundos abajo sin rebotar.", "Subí fuerte."],
      errores: ["Relajarse en la pausa."],
    },
    {
      id: "bulgara", nombre: "Sentadilla búlgara", nivel: 2, musculos: ["Cuádriceps", "Glúteos"], equipo: ["banco"], objetivo: r(8, 15), unilateral: true,
      pasos: ["Empeine de atrás sobre un banco.", "Pie de adelante a un paso largo.", "Bajá vertical hasta casi tocar con la rodilla de atrás."],
      errores: ["Pie de adelante muy cerca.", "Torso que se cae adelante."],
    },
    {
      id: "cosaca", nombre: "Sentadilla cosaca", nivel: 3, musculos: ["Cuádriceps", "Glúteos"], secundarios: ["Isquios"], equipo: [], objetivo: r(6, 12), unilateral: true,
      pasos: ["Piernas muy abiertas.", "Bajá hacia un lado; la otra pierna queda estirada con la punta arriba.", "Pasá al otro lado por abajo o volvé al centro."],
      errores: ["Levantar el talón de la pierna que flexiona."],
    },
    {
      id: "pistol-banco", nombre: "Pistol a un banco", nivel: 3, musculos: ["Cuádriceps", "Glúteos"], equipo: ["banco"], objetivo: r(6, 12), unilateral: true,
      pasos: ["De espaldas a un banco, una pierna al frente.", "Bajá en una pierna hasta sentarte suave.", "Pará sin impulso."],
      errores: ["Dejarse caer al banco."],
    },
    {
      id: "pistol-asistida", nombre: "Pistol asistida", nivel: 4, musculos: ["Cuádriceps", "Glúteos"], secundarios: ["Core"], equipo: [], objetivo: r(5, 10), unilateral: true,
      pasos: ["Agarrate de un poste.", "Bajá completo en una pierna, la otra al frente.", "Usá la mano lo mínimo."],
      errores: ["Rodilla hacia adentro."],
    },
    {
      id: "shrimp", nombre: "Sentadilla shrimp", nivel: 4, musculos: ["Cuádriceps", "Glúteos"], equipo: [], objetivo: r(4, 10), unilateral: true,
      pasos: ["Agarrá el pie de atrás con la mano del mismo lado.", "Bajá hasta tocar el piso con la rodilla de atrás.", "Subí sin apoyar el pie."],
      errores: ["Golpear la rodilla contra el piso."],
    },
    {
      id: "pistol", nombre: "Pistol squat", nivel: 5, musculos: ["Cuádriceps", "Glúteos"], secundarios: ["Core"], equipo: [], objetivo: r(3, 8), unilateral: true,
      pasos: ["Brazos adelante como contrapeso.", "Bajá completo en una pierna, la otra estirada al frente.", "Subí sin rebote."],
      errores: ["Rebotar abajo.", "Talón que se levanta."],
    },
  ]),

  cadena("zancadas", "Zancadas y saltos", "rodilla", "Trabajo unilateral y potencia.", [
    {
      id: "zancada-reversa", nombre: "Estocada hacia atrás", nivel: 1, musculos: ["Cuádriceps", "Glúteos"], equipo: [], objetivo: r(10, 15), unilateral: true,
      pasos: ["Paso largo hacia atrás.", "Rodilla de atrás casi al piso.", "Volvé empujando con el talón de adelante."],
      errores: ["Rodilla de adelante hacia adentro."],
    },
    {
      id: "zancada-caminando", nombre: "Estocadas caminando", nivel: 2, musculos: ["Cuádriceps", "Glúteos"], equipo: [], objetivo: r(10, 20), unilateral: true,
      pasos: ["Avanzá alternando piernas.", "Torso erguido.", "Contá reps por pierna."],
      errores: ["Pasos cortos."],
    },
    {
      id: "subida-banco", nombre: "Subida al banco", nivel: 2, musculos: ["Cuádriceps", "Glúteos"], equipo: ["banco"], objetivo: r(10, 15), unilateral: true,
      pasos: ["Pie completo arriba del banco.", "Subí empujando solo con esa pierna.", "Bajá lento."],
      errores: ["Impulsarse con el pie de abajo."],
    },
    {
      id: "sentadilla-salto", nombre: "Sentadilla con salto", nivel: 2, musculos: ["Cuádriceps", "Glúteos"], secundarios: ["Gemelos"], equipo: [], objetivo: r(8, 12),
      pasos: ["Sentadilla y saltá lo más alto posible.", "Caé suave y encadená la siguiente."],
      errores: ["Caer con las rodillas rígidas."],
    },
    {
      id: "zancada-salto", nombre: "Estocadas con salto alternadas", nivel: 3, musculos: ["Cuádriceps", "Glúteos"], equipo: [], objetivo: r(8, 16),
      pasos: ["Desde estocada, saltá y cambiá de pierna en el aire.", "Caé controlado en estocada."],
      errores: ["Caer con la rodilla de atrás golpeando."],
    },
  ]),

  cadena("sissy", "Sissy squat", "rodilla", "Cuádriceps aislado: lo más cercano al sillón de cuádriceps.", [
    {
      id: "sissy-asistida", nombre: "Sissy squat asistida", nivel: 2, musculos: ["Cuádriceps"], equipo: [], objetivo: r(8, 15),
      pasos: ["Agarrate de un poste, puntas de pie.", "Llevá las rodillas adelante mientras el torso va atrás en línea recta.", "Bajá hasta donde controles."],
      errores: ["Quebrar la cadera (se vuelve sentadilla)."],
    },
    {
      id: "sissy", nombre: "Sissy squat", nivel: 4, musculos: ["Cuádriceps"], equipo: [], objetivo: r(6, 12),
      pasos: ["Sin apoyo, rodillas adelante y cuerpo recto hacia atrás.", "Bajá hasta casi tocar los talones."],
      errores: ["Perder la línea rodilla-hombro."],
    },
    {
      id: "extension-rodillas-piso", nombre: "Extensión de cuádriceps de rodillas (reverse nordic)", nivel: 3, musculos: ["Cuádriceps"], equipo: [], objetivo: r(6, 12),
      pasos: ["De rodillas, cuerpo recto de rodillas a cabeza.", "Inclinate hacia atrás manteniendo la cadera estirada.", "Volvé con los cuádriceps."],
      errores: ["Doblar la cadera."],
    },
  ]),

  // ═══════════════════════ CADERA / POSTERIOR ═══════════════════════
  cadena("puente", "Puente de glúteo", "cadera", "Glúteo e isquios, del piso al hip thrust a una pierna.", [
    {
      id: "puente", nombre: "Puente de glúteo", nivel: 1, musculos: ["Glúteos"], secundarios: ["Isquios"], equipo: [], objetivo: r(15, 25),
      pasos: ["Boca arriba, pies apoyados cerca de la cola.", "Subí la cadera apretando glúteos.", "Pausa 1 s arriba."],
      errores: ["Arquear la zona lumbar."],
    },
    {
      id: "puente-una", nombre: "Puente de glúteo a una pierna", nivel: 2, musculos: ["Glúteos"], secundarios: ["Isquios"], equipo: [], objetivo: r(10, 20), unilateral: true,
      pasos: ["Una pierna estirada en el aire.", "Empujá con el talón de apoyo.", "Cadera nivelada."],
      errores: ["Cadera que rota hacia un lado."],
    },
    {
      id: "hip-thrust", nombre: "Hip thrust con espalda en banco", nivel: 2, musculos: ["Glúteos"], secundarios: ["Isquios"], equipo: ["banco"], objetivo: r(12, 20),
      pasos: ["Omóplatos en el borde del banco.", "Subí hasta que el torso quede paralelo al piso.", "Mentón al pecho."],
      errores: ["Hiperextender la lumbar."],
    },
    {
      id: "hip-thrust-una", nombre: "Hip thrust a una pierna", nivel: 3, musculos: ["Glúteos"], secundarios: ["Isquios"], equipo: ["banco"], objetivo: r(8, 15), unilateral: true,
      pasos: ["Como el hip thrust, con una pierna arriba.", "Pausa 2 s arriba."],
      errores: ["Empujar con la punta del pie."],
    },
    {
      id: "hip-thrust-lastre", nombre: "Hip thrust con mochila", nivel: 3, musculos: ["Glúteos"], equipo: ["banco", "lastre"], objetivo: r(10, 15),
      pasos: ["Mochila con peso sobre la cadera.", "Misma técnica, pausa arriba."],
      errores: ["Rango corto."],
    },
  ]),

  cadena("isquios", "Isquiotibiales", "cadera", "Isquios con curl y bisagra. El curl nórdico es oro.", [
    {
      id: "rdl-una", nombre: "Peso muerto rumano a una pierna", nivel: 1, musculos: ["Isquios", "Glúteos"], secundarios: ["Core"], equipo: [], objetivo: r(10, 15), unilateral: true,
      pasos: ["Parado en una pierna, rodilla apenas flexionada.", "Bisagra de cadera: torso abajo, pierna libre atrás.", "Espalda recta hasta sentir el estiramiento."],
      errores: ["Redondear la espalda.", "Abrir la cadera."],
    },
    {
      id: "curl-deslizante", nombre: "Curl femoral deslizante (toalla)", nivel: 2, musculos: ["Isquios"], secundarios: ["Glúteos"], equipo: [], objetivo: r(8, 15),
      pasos: ["Boca arriba, talones sobre una toalla en piso liso.", "Subí la cadera.", "Estirá y recogé las piernas sin bajar la cadera."],
      errores: ["Bajar la cadera al estirar."],
    },
    {
      id: "curl-anillas-femoral", nombre: "Curl femoral en anillas", nivel: 3, musculos: ["Isquios"], equipo: ["anillas"], objetivo: r(8, 12),
      pasos: ["Talones en las anillas, boca arriba.", "Cadera arriba y recogé los talones hacia la cola."],
      errores: ["Cadera que cae."],
    },
    {
      id: "nordico-banda", nombre: "Curl nórdico con banda", nivel: 3, musculos: ["Isquios"], equipo: ["banda"], objetivo: r(4, 8),
      pasos: ["De rodillas con los talones trabados.", "Banda desde un poste al pecho para asistir.", "Bajá lo más lento posible."],
      errores: ["Doblar la cadera."],
    },
    {
      id: "nordico-negativo", nombre: "Curl nórdico (bajada lenta)", nivel: 4, musculos: ["Isquios"], equipo: [], objetivo: r(3, 8),
      pasos: ["De rodillas, talones trabados bajo algo firme.", "Cuerpo recto de rodillas a cabeza.", "Bajá en 4–5 s, frená con las manos y empujá para volver."],
      errores: ["Quebrar la cadera para aliviar."],
    },
    {
      id: "nordico", nombre: "Curl nórdico completo", nivel: 5, musculos: ["Isquios"], equipo: [], objetivo: r(3, 6),
      pasos: ["Bajada lenta y subida con los isquios, sin empujar con las manos."],
      errores: ["Doblar la cadera en la subida."],
    },
  ]),

  // ═══════════════════════ GEMELOS ═══════════════════════
  cadena("gemelos", "Gemelos", "gemelos", "Rango completo y pausas: el truco con gemelos.", [
    {
      id: "gemelos-piso", nombre: "Elevación de talones", nivel: 1, musculos: ["Gemelos"], equipo: [], objetivo: r(15, 30),
      pasos: ["Parado, subí lo más alto posible.", "Pausa 1 s arriba, bajá lento."],
      errores: ["Rebotar."],
    },
    {
      id: "gemelos-escalon", nombre: "Gemelos en escalón", nivel: 1, musculos: ["Gemelos"], equipo: ["banco"], objetivo: r(12, 20),
      pasos: ["Puntas en el borde de un escalón o cordón.", "Bajá el talón todo lo que puedas.", "Subí y pausá 2 s arriba."],
      errores: ["Rango corto.", "Ir rápido."],
    },
    {
      id: "gemelos-una", nombre: "Gemelos a una pierna en escalón", nivel: 2, musculos: ["Gemelos"], equipo: ["banco"], objetivo: r(10, 20), unilateral: true,
      pasos: ["Igual que en escalón pero en una pierna.", "Agarrate de algo solo para equilibrio."],
      errores: ["Empujarte con la mano."],
    },
    {
      id: "gemelos-lastre", nombre: "Gemelos a una pierna con mochila", nivel: 3, musculos: ["Gemelos"], equipo: ["banco", "lastre"], objetivo: r(8, 15), unilateral: true,
      pasos: ["Mochila con peso.", "Pausa abajo y arriba."],
      errores: ["Sacrificar rango."],
    },
    {
      id: "pogo", nombre: "Saltos pogo", nivel: 2, musculos: ["Gemelos"], equipo: [], objetivo: s(20, 40),
      pasos: ["Saltitos rápidos con rodillas casi rectas.", "Rebotá en la punta de los pies."],
      errores: ["Caer con el talón."],
    },
  ]),

  // ═══════════════════════ CORE ═══════════════════════
  cadena("core-anti", "Core estático", "core", "Antiextensión y control: planchas y hollow.", [
    {
      id: "plancha", nombre: "Plancha", nivel: 1, musculos: ["Core"], equipo: [], objetivo: s(30, 60),
      pasos: ["Antebrazos en el piso, codos bajo los hombros.", "Glúteos y abdomen apretados, cadera en línea."],
      errores: ["Cadera muy alta o hundida."],
    },
    {
      id: "plancha-lateral", nombre: "Plancha lateral", nivel: 1, musculos: ["Core"], equipo: [], objetivo: s(20, 45), unilateral: true,
      pasos: ["Apoyado en un antebrazo y el costado del pie.", "Cadera arriba, cuerpo recto."],
      errores: ["Cadera que cae."],
    },
    {
      id: "dead-bug", nombre: "Dead bug", nivel: 1, musculos: ["Core"], equipo: [], objetivo: r(10, 16),
      pasos: ["Boca arriba, brazos al techo, rodillas a 90°.", "Estirá brazo y pierna contrarios sin despegar la lumbar.", "Alterná."],
      errores: ["Despegar la zona lumbar del piso."],
    },
    {
      id: "hollow", nombre: "Hollow body hold", nivel: 2, musculos: ["Core"], equipo: [], objetivo: s(20, 45),
      pasos: ["Boca arriba, lumbar pegada al piso.", "Hombros y piernas despegados, brazos atrás.", "Forma de banana."],
      errores: ["Arquear la lumbar."],
    },
    {
      id: "rueda-flexiones", nombre: "Plancha con caminata de manos", nivel: 2, musculos: ["Core"], secundarios: ["Hombros"], equipo: [], objetivo: r(6, 12),
      pasos: ["Desde plancha alta, caminá con las manos lo más adelante posible.", "Volvé sin perder la línea."],
      errores: ["Cadera que se hunde."],
    },
    {
      id: "dragon-flag-negativa", nombre: "Dragon flag negativa", nivel: 4, musculos: ["Core"], equipo: ["banco"], objetivo: r(3, 6),
      pasos: ["Boca arriba en un banco, agarrado detrás de la cabeza.", "Subí el cuerpo recto apoyado en los hombros.", "Bajá en 4–5 s sin quebrar la cadera."],
      errores: ["Doblar la cadera."],
    },
    {
      id: "dragon-flag", nombre: "Dragon flag", nivel: 5, musculos: ["Core"], equipo: ["banco"], objetivo: r(3, 8),
      pasos: ["Bajada y subida con el cuerpo recto."],
      errores: ["Apoyar la zona lumbar."],
    },
  ]),

  cadena("core-colgado", "Core colgado", "core", "Flexión de cadera colgado, rumbo al toes to bar.", [
    {
      id: "crunch-inverso", nombre: "Crunch inverso", nivel: 1, musculos: ["Core"], equipo: [], objetivo: r(10, 20),
      pasos: ["Boca arriba, rodillas al pecho.", "Despegá la cadera del piso enrollando la pelvis."],
      errores: ["Usar impulso."],
    },
    {
      id: "rodillas-paralelas", nombre: "Elevación de rodillas en paralelas", nivel: 2, musculos: ["Core"], equipo: ["paralelas"], objetivo: r(10, 15),
      pasos: ["Soporte con brazos estirados.", "Rodillas al pecho, enrollando la pelvis."],
      errores: ["Hombros encogidos."],
    },
    {
      id: "rodillas-colgado", nombre: "Elevación de rodillas colgado", nivel: 2, musculos: ["Core"], secundarios: ["Antebrazos"], equipo: ["barra"], objetivo: r(10, 15),
      pasos: ["Colgado activo.", "Rodillas al pecho sin balanceo.", "Bajá lento."],
      errores: ["Balancearse."],
    },
    {
      id: "piernas-colgado", nombre: "Elevación de piernas colgado", nivel: 3, musculos: ["Core"], secundarios: ["Antebrazos"], equipo: ["barra"], objetivo: r(8, 12),
      pasos: ["Piernas estiradas hasta 90° o más.", "Bajada controlada."],
      errores: ["Usar impulso."],
    },
    {
      id: "toes-to-bar", nombre: "Toes to bar", nivel: 4, musculos: ["Core"], secundarios: ["Espalda"], equipo: ["barra"], objetivo: r(5, 12),
      pasos: ["Piernas estiradas hasta tocar la barra con los pies.", "Empujá la barra hacia abajo con brazos rectos."],
      errores: ["Kipping excesivo."],
    },
    {
      id: "windshield", nombre: "Limpiaparabrisas colgado", nivel: 5, musculos: ["Core"], equipo: ["barra"], objetivo: r(4, 10),
      pasos: ["Piernas arriba a la barra.", "Giralas de lado a lado controlando."],
      errores: ["Soltar el control al girar."],
    },
  ]),

  cadena("lsit", "L-sit", "core", "Compresión y core: soporte con piernas al frente.", [
    {
      id: "soporte-paralelas", nombre: "Soporte en paralelas", nivel: 1, musculos: ["Tríceps", "Hombros"], secundarios: ["Core"], equipo: [["paralelas", "banco"]], objetivo: s(20, 45),
      pasos: ["Brazos estirados, hombros abajo.", "Cuerpo quieto."],
      errores: ["Encoger los hombros."],
    },
    {
      id: "lsit-tuck", nombre: "Tuck L-sit", nivel: 2, musculos: ["Core"], secundarios: ["Tríceps"], equipo: [], objetivo: s(10, 30),
      pasos: ["Manos en el piso (o paralelas) al lado de la cadera.", "Empujá y despegá con las rodillas al pecho."],
      errores: ["Hombros encogidos."],
    },
    {
      id: "lsit-una", nombre: "L-sit a una pierna", nivel: 3, musculos: ["Core"], equipo: [], objetivo: s(10, 20),
      pasos: ["Una pierna estirada, la otra en tuck.", "Alterná."],
      errores: ["Bajar la pierna estirada."],
    },
    {
      id: "lsit", nombre: "L-sit", nivel: 4, musculos: ["Core"], secundarios: ["Tríceps"], equipo: [], objetivo: s(10, 30),
      pasos: ["Piernas estiradas y juntas al frente, paralelas al piso.", "Puntas de pie estiradas."],
      errores: ["Rodillas dobladas."],
    },
  ]),

  // ═══════════════════════ SKILLS ═══════════════════════
  cadena("handstand", "Vertical", "skill", "Equilibrio invertido: de la pared a la vertical libre.", [
    {
      id: "hs-espalda-pared", nombre: "Vertical de espaldas a la pared", nivel: 2, musculos: ["Hombros"], secundarios: ["Core"], equipo: [], objetivo: s(20, 45),
      pasos: ["Patada hacia arriba con la espalda hacia la pared.", "Manos a un palmo de la pared.", "Despegá de a poco los talones."],
      errores: ["Espalda arqueada apoyada."],
    },
    {
      id: "hs-libre-intentos", nombre: "Vertical libre (intentos)", nivel: 4, musculos: ["Hombros"], secundarios: ["Core", "Antebrazos"], equipo: [], objetivo: s(5, 20),
      pasos: ["Patada controlada al centro.", "Corregí con los dedos (adelante) y palmas (atrás).", "Aprendé a salir girando."],
      errores: ["Practicar cansado."],
    },
  ]),

  cadena("planche", "Planche", "skill", "Fuerza de empuje con brazos rectos.", [
    {
      id: "planche-lean", nombre: "Planche lean", nivel: 3, musculos: ["Hombros"], secundarios: ["Pecho", "Core"], equipo: [], objetivo: s(15, 30),
      pasos: ["Plancha alta con dedos hacia los costados o atrás.", "Inclinate adelante hasta que los hombros pasen las manos.", "Escápulas separadas, brazos rectos."],
      errores: ["Doblar los codos."],
    },
    {
      id: "planche-tuck", nombre: "Tuck planche", nivel: 5, musculos: ["Hombros"], secundarios: ["Pecho", "Core"], equipo: [["paralelas"]], objetivo: s(5, 15),
      pasos: ["En paralelas o el piso, inclinate y despegá con rodillas al pecho.", "Espalda redondeada, brazos rectos."],
      errores: ["Codos doblados."],
    },
  ]),
];

// ───────────── Índices y utilidades ─────────────

export const EJERCICIOS: Ejercicio[] = CADENAS.flatMap((c) => c.ejercicios);
export const POR_ID: Record<string, Ejercicio> = Object.fromEntries(EJERCICIOS.map((e) => [e.id, e]));
export const CADENA_POR_ID: Record<string, Cadena> = Object.fromEntries(CADENAS.map((c) => [c.id, c]));

export const EQUIPO_LABEL: Record<Equipo, string> = {
  barra: "Barra de dominadas",
  paralelas: "Paralelas",
  "barra-baja": "Barra baja (para remo)",
  anillas: "Anillas o TRX",
  banco: "Banco / escalón",
  banda: "Bandas elásticas",
  lastre: "Mochila o cinturón con peso",
};

export const PATRON_LABEL: Record<Patron, string> = {
  "empuje-horizontal": "Empuje horizontal",
  "empuje-vertical": "Empuje vertical",
  "traccion-vertical": "Tracción vertical",
  "traccion-horizontal": "Tracción horizontal",
  rodilla: "Pierna (rodilla)",
  cadera: "Pierna (cadera)",
  gemelos: "Gemelos",
  core: "Core",
  brazos: "Brazos",
  skill: "Skills",
};

export const NIVEL_LABEL = ["", "Arranque", "Base", "Intermedio", "Avanzado", "Élite"] as const;

export const MUSCULOS: Musculo[] = [
  "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Antebrazos",
  "Cuádriceps", "Isquios", "Glúteos", "Gemelos", "Core",
];

export function disponible(e: Ejercicio, equipo: Equipo[]): boolean {
  return e.equipo.every((req) => (Array.isArray(req) ? req.some((x) => equipo.includes(x)) : equipo.includes(req)));
}

export function faltante(e: Ejercicio, equipo: Equipo[]): string[] {
  return e.equipo
    .filter((req) => (Array.isArray(req) ? !req.some((x) => equipo.includes(x)) : !equipo.includes(req)))
    .map((req) => (Array.isArray(req) ? req.map((x) => EQUIPO_LABEL[x]).join(" o ") : EQUIPO_LABEL[req]));
}

export function objetivoTexto(o: { tipo: "reps" | "seg"; min: number; max: number }): string {
  return `${o.min}–${o.max} ${o.tipo === "reps" ? "reps" : "seg"}`;
}

/** Siguiente ejercicio disponible en la misma cadena */
export function siguiente(e: Ejercicio, equipo: Equipo[]): Ejercicio | null {
  const c = CADENA_POR_ID[e.cadena];
  const i = c.ejercicios.findIndex((x) => x.id === e.id);
  return c.ejercicios.slice(i + 1).find((x) => disponible(x, equipo)) ?? null;
}

export function anterior(e: Ejercicio, equipo: Equipo[]): Ejercicio | null {
  const c = CADENA_POR_ID[e.cadena];
  const i = c.ejercicios.findIndex((x) => x.id === e.id);
  return [...c.ejercicios.slice(0, i)].reverse().find((x) => disponible(x, equipo)) ?? null;
}
