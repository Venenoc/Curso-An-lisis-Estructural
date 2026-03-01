# Sección de Herramientas (Tools) — Documentación de Implementación

Este documento cubre exclusivamente la implementación de la sección `/tools` de la plataforma,
incluyendo el servidor Python de cálculo estructural, la API proxy de Next.js, la base de datos,
y todos los componentes y páginas del frontend.

---

## Arquitectura general

```
Usuario → /tools/[tab] (Next.js Server Component)
              ↓
         ToolsNav (Client Component — navegación de 5 tabs)
              ↓ (cálculos)
         CalculatorModal → POST /api/tools/calculate (Next.js API Route)
              ↓ (proxy)
         Python FastAPI (localhost:8000 / Railway en producción)
              ↓
         Routers: concrete.py | steel.py | structural.py

         (recursos)
         BibliotecaTab / RecursosTab → Server Component lee tool_resources en Supabase
```

---

## Base de datos

### Tabla `tool_resources`
Almacena todos los recursos descargables de la Biblioteca Técnica y los Recursos de Productividad.

```sql
CREATE TABLE tool_resources (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT        NOT NULL,
  description   TEXT,
  category      TEXT        NOT NULL,
  file_url      TEXT,           -- URL del archivo en Supabase Storage
  thumbnail_url TEXT,
  is_free       BOOLEAN     NOT NULL DEFAULT true,
  is_published  BOOLEAN     NOT NULL DEFAULT false,
  created_by    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Categorías válidas

**Biblioteca Técnica:**
| Valor en DB | Descripción |
|---|---|
| `norms_codes` | Normas y Códigos (ACI, AISC, NTC...) |
| `formula_sheets` | Formularios de referencia rápida |
| `excel_templates` | Plantillas Excel de diseño |
| `manuals_guides` | Manuales y Guías técnicas |
| `manuals_details` | Detalles de Manuales |
| `column_details` | Detalles de Columnas |
| `structural_details` | Detalles Estructurales constructivos |
| `example_models` | Modelos de ejemplo (SAP2000, ETABS, etc.) |

**Recursos de Productividad:**
| Valor en DB | Descripción |
|---|---|
| `structural_checklist` | Checklists de verificación de proyectos |
| `calculation_templates` | Plantillas de memoria de cálculo |
| `report_templates` | Plantillas de informes técnicos |
| `budget_templates` | Plantillas de presupuesto de obra |

### Políticas RLS

```sql
-- Solo recursos publicados son visibles para usuarios autenticados
CREATE POLICY "Published resources viewable by authenticated"
  ON tool_resources FOR SELECT
  USING (
    is_published = true
    OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Solo instructores/admins pueden crear y gestionar recursos
CREATE POLICY "Instructors can manage resources"
  ON tool_resources FOR ALL
  USING (
    created_by IN (
      SELECT id FROM profiles WHERE user_id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );
```

### Migración SQL
Archivo: `supabase/migrations/20260301_tools_resources.sql`
Este archivo también corrige las políticas RLS rotas de la tabla `tools` existente (que referenciaban columnas inexistentes `is_published` y `created_by`).

---

## Servidor Python (FastAPI)

### Ubicación
```
python_server/
├── main.py
├── requirements.txt
└── routers/
    ├── __init__.py
    ├── concrete.py      ← ACI 318-19
    ├── steel.py         ← AISC 360-22
    └── structural.py    ← Propiedades geométricas y análisis básico
```

### Dependencias (`requirements.txt`)
```
fastapi==0.115.6
uvicorn[standard]==0.32.1
numpy==2.2.1
scipy==1.15.0
pydantic==2.10.4
python-dotenv==1.0.1
```

### `main.py`
- FastAPI app con CORS habilitado para `localhost:3000` y `*.vercel.app`
- Endpoint de salud: `GET /health` → `{"status": "ok", "version": "1.0.0"}`
- Routers montados en: `/concreto`, `/acero`, `/estructural`

### Arranque
```bash
cd python_server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Verificar que funciona:
curl http://localhost:8000/health
# → {"status":"ok","version":"1.0.0"}
```

---

## Endpoints del servidor Python

### Módulo Concreto (`/concreto`) — ACI 318-19

#### `POST /concreto/minimos-maximos`
Calcula cuantías mínima y máxima de refuerzo a flexión.

**Inputs:**
```json
{ "fc": 28, "fy": 420, "b": 300, "d": 550 }
```
Unidades: MPa, mm.

**Outputs:**
```json
{
  "As_min_mm2": 460.0,
  "As_max_mm2": 2380.0,
  "rho_min": 0.00280,
  "rho_max": 0.01444,
  "rho_bal": 0.02156,
  "beta1": 0.85,
  "notas": "ACI 318-19 §9.6.1.2"
}
```

#### `POST /concreto/refuerzo`
Diseño de refuerzo a flexión para viga rectangular.

**Inputs:**
```json
{ "fc": 28, "fy": 420, "b": 300, "d": 550, "Mu": 200 }
```
Unidades: MPa, mm, kN·m.

**Outputs:** `As_min_mm2`, `As_req_mm2`, `As_design_mm2`, `As_max_mm2`, `a_mm`, `c_mm`, `et`, `phi`, `phi_Mn_kNm`, `DCR`, `sugerencia_varillas` (array de hasta 3 opciones de varilla + cantidad).

#### `POST /concreto/columna-pm`
Diagrama de interacción P-M para columna rectangular con acero en 4 esquinas.

**Inputs:**
```json
{ "fc": 28, "fy": 420, "b": 400, "h": 400, "cover": 60, "As_total": 2000 }
```

**Outputs:** `phi`, `Pn_max_kN`, `phi_Pn_max_kN`, `interaccion` (array de ~50 puntos `{Pn_kN, Mn_kNm}`).

#### `POST /concreto/viga-interaccion`
Diseño combinado flexión + cortante.

**Inputs:**
```json
{ "fc": 28, "fy": 420, "b": 300, "d": 500, "Mu": 180, "Vu": 120 }
```

**Outputs:** Objeto con `flexion` (idéntico a `/refuerzo`) + `cortante` (φVc, Vs_req, opciones de estribos).

---

### Módulo Acero (`/acero`) — AISC 360-22 LRFD

#### `POST /acero/viga-i`
Verificación de viga I a flexión + cortante con revisión de pandeo lateral.

**Inputs:** `Fy`, `Fu`, `Ix_cm4`, `Sx_cm3`, `Zx_cm3`, `d_mm`, `bf_mm`, `tf_mm`, `tw_mm`, `L_m`, `Mu_kNm`, `Vu_kN`, `Cb`

**Outputs:**
```json
{
  "flexion": { "Mp_kNm": ..., "phi_Mn_kNm": ..., "Lp_mm": ..., "Lr_mm": ..., "zona_pandeo": "...", "DCR_flexion": ..., "ok_flexion": true },
  "cortante": { "Aw_mm2": ..., "phi_Vn_kN": ..., "DCR_cortante": ..., "ok_cortante": true }
}
```

#### `POST /acero/pandeo`
Diseño por pandeo axial (columna/puntal) — AISC 360-22 Capítulo E.

**Inputs:** `Fy`, `A_cm2`, `rx_cm`, `ry_cm`, `Lx_m`, `Ly_m`, `Kx`, `Ky`, `Pu_kN`

**Outputs:** `KL_r_x`, `KL_r_y`, `KL_r_gov`, `Fe_MPa`, `Fcr_MPa`, `phi_Pn_kN`, `modo_pandeo`, `DCR`, `ok`

#### `POST /acero/deflexion`
Deflexión máxima de viga biapoyada por Euler-Bernoulli.

**Inputs:** `Ix_cm4`, `L_m`, `w_kNm`, `P_kN`, `limite` (`"L/240"` | `"L/360"` | `"L/480"`)

**Outputs:** `delta_w_m`, `delta_P_m`, `delta_total_mm`, `delta_limite_mm`, `ok`, `relacion_L_delta`

---

### Módulo Estructural (`/estructural`)

#### `POST /estructural/seccion`
Propiedades geométricas de sección transversal.

**Inputs** (campo `tipo` requerido):

- `tipo: "rectangulo"` → `b`, `h`
- `tipo: "circulo"` → `d`
- `tipo: "I"` → `bf`, `tf`, `d`, `tw`
- `tipo: "cajon"` → `B`, `H`, `t`

**Outputs:** `A_mm2`, `A_cm2`, `Ix_mm4`, `Ix_cm4`, `Iy_mm4`, `Iy_cm4`, `Sx_mm3`, `Sy_mm3`, `rx_mm`, `ry_mm` (+ extras por tipo)

#### `POST /estructural/viga-simple`
Análisis de viga biapoyada por superposición.

**Inputs:**
```json
{
  "L_m": 6,
  "EI_kNm2": 30000,
  "cargas": [
    { "tipo": "dist", "w": 15 },
    { "tipo": "puntual", "P": 50, "a": 3.0 }
  ]
}
```

**Outputs:** `RA_kN`, `RB_kN`, `Mmax_kNm`, `delta_max_mm`

---

## API Route Next.js (proxy)

### `src/app/api/tools/calculate/route.ts`

```typescript
// POST — Proxy al servidor Python
POST /api/tools/calculate
Body: { "endpoint": "concreto/refuerzo", "params": { "fc": 28, ... } }

// GET — Verificación de estado
GET /api/tools/calculate
Response: { "status": "ok" } | { "status": "offline" }
```

**Manejo de errores:**
- Si el servidor Python no está corriendo (`ECONNREFUSED`): responde `503` con mensaje descriptivo.
- Cualquier otro error: responde `500`.

**Variable de entorno requerida:**
```bash
PYTHON_API_URL=http://localhost:8000     # desarrollo
PYTHON_API_URL=https://tu-app.railway.app  # producción
```

---

## Layout y navegación

### `src/app/(platform)/tools/layout.tsx`
Sub-layout del grupo `tools`. Aplica:
- Fondo: `bg-gradient-to-b from-slate-950 via-slate-900 to-black`
- `ToolsNav` sticky en la parte superior
- `<main>` con `max-w-7xl mx-auto px-4 py-8`

### `src/app/(platform)/tools/page.tsx`
Redirige automáticamente a `/tools/calculos`.

### `src/components/tools/ToolsNav.tsx`
Barra de 5 tabs con navegación activa:
- Fondo: `bg-white/10 backdrop-blur-sm border-b border-white/20`
- Tab activo: `bg-white text-slate-900 shadow-md rounded-lg`
- Tab inactivo: `text-white/70 hover:text-white hover:bg-white/10`
- En móvil muestra solo la primera palabra del label

---

## Páginas de las 5 secciones

### `/tools/calculos` — Server Component
Renderiza `<CalculosTab />` (Client Component).

### `/tools/biblioteca` — Server Component
Lee `tool_resources` de Supabase con categorías de Biblioteca Técnica.
Usa `createAdminClient` para bypasear RLS y leer todos los recursos publicados.
Pasa el array a `<BibliotecaTab resources={resources} />`.
Si no hay recursos en DB, el componente muestra **8 placeholders** con badge "Próximamente".

### `/tools/simuladores` — Server Component
Renderiza `<SimuladoresTab />` (Client Component) con 5 cards estáticas.

### `/tools/asistente` — Server Component
Renderiza `<AsistenteTab />` (Client Component) — UI placeholder de chat.

### `/tools/recursos` — Server Component
Lee `tool_resources` de Supabase con categorías de Productividad.
Pasa el array a `<RecursosTab resources={resources} />`.
Si no hay recursos en DB, muestra **4 placeholders**.

---

## Componentes

### `CalculosTab.tsx`
Componente client principal de la sección de cálculo.
Organiza 10 calculadoras en 3 grupos (Concreto / Acero / Análisis Estructural).
Al hacer clic en una calculadora, abre `CalculatorModal` (o `VigaSimpleModal` para la viga biapoyada que requiere estructura de carga especial).

**Calculadoras disponibles:**

| ID | Título | Endpoint |
|---|---|---|
| `concreto-minmax` | Mínimos y Máximos de Acero | `concreto/minimos-maximos` |
| `concreto-refuerzo` | Diseño de Refuerzo a Flexión | `concreto/refuerzo` |
| `concreto-columna-pm` | Interacción Columna P-M | `concreto/columna-pm` |
| `concreto-viga` | Interacción Viga (Flexión + Cortante) | `concreto/viga-interaccion` |
| `acero-viga-i` | Vigas I & RHM — Flexión + Cortante | `acero/viga-i` |
| `acero-pandeo` | Diseño por Pandeo Axial | `acero/pandeo` |
| `acero-deflexion` | Deflexión de Viga | `acero/deflexion` |
| `seccion-rect` | Propiedades de Sección — Rectángulo | `estructural/seccion` |
| `seccion-i` | Propiedades de Sección — Perfil I | `estructural/seccion` |
| `viga-simple` | Análisis Viga Biapoyada | `estructural/viga-simple` |

### `CalculatorModal.tsx`
Modal genérico reutilizable para todas las calculadoras.
- Recibe una `CalculatorConfig` con la definición de los campos de entrada
- Valida que todos los campos sean números antes de enviar
- Hace `POST /api/tools/calculate` con `{ endpoint, params }`
- Muestra los resultados en una tabla genérica `ResultTable` (key-value, con soporte para objetos anidados y arrays)
- Muestra errores del servidor o de conexión

### `BibliotecaTab.tsx`
Grid de recursos de la Biblioteca Técnica.
- Ícono y color diferente por categoría
- Badge "Gratis" si `is_free = true`
- Botón de descarga activo si `file_url` no es null, deshabilitado si es null

### `SimuladoresTab.tsx`
Grid de 5 simuladores con diseño de cards de gradiente y badge "Próximamente".

### `AsistenteTab.tsx`
UI placeholder de chat:
- Ícono de bot + Sparkles + mensaje "Próximamente disponible"
- 4 chips de acciones rápidas (deshabilitados)
- Input de chat deshabilitado

### `RecursosTab.tsx`
Grid de 2 columnas de recursos de productividad.
- Layout horizontal: ícono + contenido + descarga
- Diseño similar a BibliotecaTab pero con más espacio

---

## Flujo de un cálculo de extremo a extremo

```
1. Usuario navega a /tools/calculos
2. Server Component renderiza CalculosTab (Client Component)
3. Usuario hace clic en "Diseño de Refuerzo a Flexión"
4. CalculosTab abre <CalculatorModal config={...} />
5. Usuario ingresa: fc=28, fy=420, b=300, d=550, Mu=200
6. Usuario hace clic en "Calcular"
7. CalculatorModal hace:
   POST /api/tools/calculate
   Body: { endpoint: "concreto/refuerzo", params: { fc:28, fy:420, b:300, d:550, Mu:200 } }
8. API Route (route.ts) hace:
   POST http://localhost:8000/concreto/refuerzo
   Body: { fc:28, fy:420, b:300, d:550, Mu:200 }
9. concrete.py ejecuta las fórmulas ACI 318-19 y devuelve el JSON de resultados
10. API Route retorna la respuesta al navegador
11. CalculatorModal muestra los resultados en ResultTable
```

---

## Flujo de recursos descargables (Biblioteca / Recursos)

```
Admin sube archivo a Supabase Storage bucket "tool-files"
Admin inserta registro en tool_resources:
  { title, description, category, file_url, is_free, is_published: true, created_by }

Usuario navega a /tools/biblioteca (Server Component)
Server Component hace query a tool_resources con admin client
Pasa resources[] a <BibliotecaTab resources={resources} />
Usuario hace clic en "Descargar" → window abre el file_url
```

---

## Cómo agregar una nueva calculadora

1. **Backend Python** — agregar endpoint en el router correspondiente (`concrete.py`, `steel.py` o `structural.py`):
```python
class NuevaInput(BaseModel):
    campo1: float
    campo2: float

@router.post("/nuevo-calculo")
def nuevo_calculo(data: NuevaInput):
    resultado = data.campo1 * data.campo2
    return { "resultado": resultado }
```

2. **Frontend** — agregar entrada al array `CALCULATORS` en `CalculosTab.tsx`:
```typescript
{
  id: "nuevo-calculo",
  title: "Nombre de la Calculadora",
  description: "Descripción breve del cálculo",
  endpoint: "concreto/nuevo-calculo",
  fields: [
    { name: "campo1", label: "Campo 1", unit: "MPa", defaultValue: 28 },
    { name: "campo2", label: "Campo 2", unit: "mm", defaultValue: 300 },
  ],
}
```

3. **Agregar al grupo** — incluir el `id` en el array `ids` del grupo correspondiente en `GROUPS`.

4. **Agregar ícono** — incluir en el objeto `icons` de `CalculosTab.tsx`.

---

## Despliegue en producción

### Next.js → Vercel
1. Configurar en el dashboard de Vercel las variables de entorno:
   - Todas las de `.env.local`
   - `PYTHON_API_URL=https://tu-servidor-python.railway.app`

### Python FastAPI → Railway o Render
1. Crear proyecto apuntando a la carpeta `python_server/`
2. El servicio arranca con: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Copiar la URL pública del servicio a `PYTHON_API_URL` en Vercel

### CORS en producción
En `main.py`, agregar el dominio de producción a `allow_origins`:
```python
allow_origins=[
    "http://localhost:3000",
    "https://tu-dominio.vercel.app",
    "https://tu-dominio-personalizado.com",
],
```

---

## Archivos creados en esta implementación

| Acción | Ruta |
|---|---|
| CREAR | `supabase/migrations/20260301_tools_resources.sql` |
| CREAR | `python_server/main.py` |
| CREAR | `python_server/requirements.txt` |
| CREAR | `python_server/routers/__init__.py` |
| CREAR | `python_server/routers/concrete.py` |
| CREAR | `python_server/routers/steel.py` |
| CREAR | `python_server/routers/structural.py` |
| CREAR | `src/app/api/tools/calculate/route.ts` |
| CREAR | `src/app/(platform)/tools/layout.tsx` |
| MODIFICAR | `src/app/(platform)/tools/page.tsx` → redirect a /tools/calculos |
| CREAR | `src/app/(platform)/tools/calculos/page.tsx` |
| CREAR | `src/app/(platform)/tools/biblioteca/page.tsx` |
| CREAR | `src/app/(platform)/tools/simuladores/page.tsx` |
| CREAR | `src/app/(platform)/tools/asistente/page.tsx` |
| CREAR | `src/app/(platform)/tools/recursos/page.tsx` |
| CREAR | `src/components/tools/ToolsNav.tsx` |
| CREAR | `src/components/tools/CalculosTab.tsx` |
| CREAR | `src/components/tools/CalculatorModal.tsx` |
| CREAR | `src/components/tools/BibliotecaTab.tsx` |
| CREAR | `src/components/tools/SimuladoresTab.tsx` |
| CREAR | `src/components/tools/AsistenteTab.tsx` |
| CREAR | `src/components/tools/RecursosTab.tsx` |
| MODIFICAR | `.env.local` → añadida variable `PYTHON_API_URL` |

---

**Última actualización:** Marzo 2026
