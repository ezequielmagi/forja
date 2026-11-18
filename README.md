# Forja — calistenia + comida

App personal (PWA en Next.js) para entrenar calistenia y llevar las calorías sacándole una foto a la comida.

- **109 ejercicios de calistenia** en 20 progresiones (flexiones, fondos, vertical, dominadas, muscle-up, remo, front lever, sentadilla/pistol, sissy, nórdicos, gemelos, core, L-sit, planche…), con técnica, errores comunes y equipo necesario.
- **Rutina automática** según tu nivel, días por semana (3, 4 o 5) y lo que tengas en la plaza (barra, paralelas, anillas, bandas, banco, lastre).
- **Registro de series**: reps o segundos, lastre, RIR, timer de descanso con vibración.
- **Progresión automática**: si completás todas las series en el tope del rango te sugiere el siguiente ejercicio de la cadena (o sumar lastre).
- **Calorías por foto** con Claude: identifica cada alimento, estima gramos, kcal y macros. Todo es editable; si cambiás los gramos se recalcula.
- Objetivo diario calculado con Mifflin-St Jeor según tu meta (bajar grasa, recomposición, mantener, ganar músculo).
- Los datos quedan **en tu teléfono** (IndexedDB). Hay exportar/importar backup en Perfil.

## Correr en local

```bash
npm install
cp .env.example .env.local   # completá ANTHROPIC_API_KEY
npm run dev
```

Para probar la interfaz sin gastar API: `MOCK_ANALYSIS=1` en `.env.local` (devuelve una milanesa con puré de ejemplo).

## Deploy en Vercel

1. Subí la carpeta a un repo de GitHub.
2. En Vercel: **Add New → Project** e importá el repo (detecta Next.js solo).
3. En **Settings → Environment Variables** cargá:
   - `ANTHROPIC_API_KEY` — de console.anthropic.com
   - `APP_PASSWORD` — una clave cualquiera, para que nadie más use tu endpoint
   - `ANTHROPIC_MODEL` (opcional) — por defecto `claude-sonnet-5-5`
4. Deploy. En el celu abrí la URL, **Compartir → Agregar a inicio**, y en **Perfil → Clave de la app** escribí la misma `APP_PASSWORD`.

Costo aproximado por foto con Sonnet: menos de 1 centavo de dólar.

## Estructura

```
src/
  app/
    page.tsx              Hoy (resumen de comida y próximo entreno)
    entreno/page.tsx      Rutina editable + historial
    entreno/sesion/       Sesión en vivo, descanso y progresión
    comida/page.tsx       Comidas del día, edición y últimos 7 días
    ejercicios/page.tsx   Catálogo con filtros
    perfil/page.tsx       Perfil, equipo, objetivo, backup
    api/analizar/route.ts Foto → Claude → JSON de alimentos
  lib/
    catalog.ts            Todos los ejercicios y progresiones (sumá los tuyos acá)
    routine.ts            Generador de rutina y lógica de progresión
    nutrition.ts          Calorías objetivo y macros
    store.tsx             Estado global + persistencia en IndexedDB
  components/             UI (captura de comida, editor, detalle de ejercicio…)
```

### Sumar un ejercicio

En `src/lib/catalog.ts`, agregalo dentro de la cadena que corresponda, en el lugar de dificultad que le toque. `nivel` va de 1 a 5, `equipo` lista lo necesario (un array interno significa "cualquiera de estos").
