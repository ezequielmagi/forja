import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODELO = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_BYTES_B64 = 4_000_000; // ~3 MB de imagen (Vercel acepta hasta 4,5 MB por request)

const SISTEMA = `Sos un nutricionista deportivo argentino que estima calorías y macros a partir de fotos de comida.

Cómo trabajar:
- Identificá cada alimento visible por separado (ej: "milanesa de carne", "puré de papa", "ensalada de tomate y lechuga", "pan francés").
- Usá nombres y porciones habituales en Argentina (milanesa, empanada, medialuna, mate cocido, tarta, guiso, asado, choripán, fideos con tuco, etc.).
- Estimá los gramos usando referencias visuales: tamaño del plato (playo ≈ 26 cm), cubiertos, manos, envases, vasos.
- Considerá el método de cocción y el aceite/manteca que probablemente tenga (frito, al horno, salteado). Sumá aceite de condimento en ensaladas si se ve brillo.
- Para bebidas, estimá el volumen en ml y usalo como "gramos".
- Si la persona agrega una aclaración (ej: "es media porción", "sin aceite", "pan integral"), priorizala sobre lo que ves.
- Las kcal de cada item tienen que ser coherentes con sus macros (proteínas×4 + carbohidratos×4 + grasas×9, ±10%).
- Si la foto no muestra comida, devolvé items vacío y explicalo en notas.
- confianza: "alta" si los alimentos y porciones son claros, "media" si hay dudas de porción o ingredientes ocultos, "baja" si la foto es ambigua.
- notas: 1–2 frases cortas en español rioplatense con lo que asumiste (ej: "Asumí milanesa frita y 1 cda de aceite en la ensalada").`;

const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: ["titulo", "items", "confianza", "notas"],
  properties: {
    titulo: { type: "string", description: "Nombre corto del plato completo, ej: 'Milanesa con puré'" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["nombre", "gramos", "kcal", "proteinas", "carbohidratos", "grasas"],
        properties: {
          nombre: { type: "string" },
          gramos: { type: "number" },
          kcal: { type: "number" },
          proteinas: { type: "number" },
          carbohidratos: { type: "number" },
          grasas: { type: "number" },
        },
      },
    },
    confianza: { type: "string", enum: ["alta", "media", "baja"] },
    notas: { type: "string" },
  },
} as const;

const EJEMPLO = {
  titulo: "Milanesa con puré (ejemplo)",
  items: [
    { nombre: "Milanesa de carne frita", gramos: 180, kcal: 430, proteinas: 32, carbohidratos: 18, grasas: 25 },
    { nombre: "Puré de papa", gramos: 200, kcal: 220, proteinas: 4, carbohidratos: 32, grasas: 8 },
    { nombre: "Limón", gramos: 15, kcal: 4, proteinas: 0, carbohidratos: 1, grasas: 0 },
  ],
  confianza: "media",
  notas: "Respuesta de ejemplo (MOCK_ANALYSIS activado). Asumí milanesa frita y puré con manteca.",
};

export async function POST(req: Request) {
  // Protección opcional para que nadie más use tu saldo
  const clave = process.env.APP_PASSWORD;
  if (clave && req.headers.get("x-app-key") !== clave) {
    return NextResponse.json({ error: "Clave de la app incorrecta. Cargala en Perfil → Clave de la app." }, { status: 401 });
  }

  let body: { imagen?: string; nota?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const match = body.imagen?.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Falta la imagen o el formato no es válido" }, { status: 400 });
  const [, mediaType, data] = match;
  if (data.length > MAX_BYTES_B64) return NextResponse.json({ error: "La imagen es demasiado grande" }, { status: 413 });

  if (process.env.MOCK_ANALYSIS === "1") {
    await new Promise((r) => setTimeout(r, 900));
    return NextResponse.json(EJEMPLO);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Falta configurar ANTHROPIC_API_KEY en el servidor (Vercel → Settings → Environment Variables)." }, { status: 500 });
  }

  const nota = (body.nota ?? "").slice(0, 300).trim();
  const client = new Anthropic();

  try {
    const msg = await client.messages.create({
      model: MODELO,
      max_tokens: 1500,
      system: SISTEMA,
      output_config: { format: { type: "json_schema", schema: ESQUEMA }, effort: "low" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg", data } },
            { type: "text", text: nota ? `Aclaración de la persona: ${nota}` : "Estimá esta comida." },
          ],
        },
      ],
    });

    const texto = msg.content.find((b) => b.type === "text");
    if (!texto || texto.type !== "text") throw new Error("Respuesta vacía del modelo");
    const analisis = JSON.parse(texto.text);
    return NextResponse.json(analisis);
  } catch (err) {
    console.error("[analizar]", err);
    const status = err instanceof Anthropic.APIError ? err.status ?? 502 : 502;
    const mensaje =
      status === 401 ? "La API key de Anthropic no es válida."
      : status === 429 ? "Demasiados pedidos seguidos. Probá en un minuto."
      : status === 400 ? "No se pudo analizar la imagen. Probá con otra foto."
      : "No se pudo analizar la foto. Probá de nuevo.";
    return NextResponse.json({ error: mensaje }, { status: status >= 400 && status < 600 ? status : 502 });
  }
}
