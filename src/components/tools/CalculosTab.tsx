"use client";

import { useState } from "react";
import CalculatorModal, {
  CalculatorConfig,
} from "@/components/tools/CalculatorModal";
import {
  ChevronRight,
  Square,
  Triangle,
  BarChart3,
  Layers,
  HardHat,
  Ruler,
  LayoutGrid,
  FlaskConical,
} from "lucide-react";

// ─── Definición de calculadoras ───────────────────────────────────────────────

const CALCULATORS: CalculatorConfig[] = [
  // ── Concreto ──────────────────────────────────────────────────────────────
  {
    id: "concreto-minmax",
    title: "Mínimos y Máximos de Acero",
    description: "Cuantías mínima y máxima de refuerzo (ACI 318-19 §9.6)",
    endpoint: "concreto/minimos-maximos",
    fields: [
      { name: "fc", label: "f'c", unit: "MPa", defaultValue: 28 },
      { name: "fy", label: "fy", unit: "MPa", defaultValue: 420 },
      { name: "b", label: "Ancho (b)", unit: "mm", defaultValue: 300 },
      { name: "d", label: "Peralte efectivo (d)", unit: "mm", defaultValue: 550 },
    ],
  },
  {
    id: "concreto-refuerzo",
    title: "Diseño de Refuerzo a Flexión",
    description: "As requerido, varillas sugeridas y verificación φMn ≥ Mu",
    endpoint: "concreto/refuerzo",
    fields: [
      { name: "fc", label: "f'c", unit: "MPa", defaultValue: 28 },
      { name: "fy", label: "fy", unit: "MPa", defaultValue: 420 },
      { name: "b", label: "Ancho (b)", unit: "mm", defaultValue: 300 },
      { name: "d", label: "Peralte efectivo (d)", unit: "mm", defaultValue: 550 },
      { name: "Mu", label: "Momento último Mu", unit: "kN·m", defaultValue: 200 },
    ],
  },
  {
    id: "concreto-columna-pm",
    title: "Interacción Columna P-M",
    description: "Diagrama de interacción para columna rectangular (ACI 318-19)",
    endpoint: "concreto/columna-pm",
    fields: [
      { name: "fc", label: "f'c", unit: "MPa", defaultValue: 28 },
      { name: "fy", label: "fy", unit: "MPa", defaultValue: 420 },
      { name: "b", label: "Ancho (b)", unit: "mm", defaultValue: 400 },
      { name: "h", label: "Altura (h)", unit: "mm", defaultValue: 400 },
      { name: "cover", label: "Recubrimiento centroide", unit: "mm", defaultValue: 60 },
      { name: "As_total", label: "As total", unit: "mm²", defaultValue: 2000 },
    ],
  },
  {
    id: "concreto-viga",
    title: "Interacción Viga (Flexión + Cortante)",
    description: "Diseño combinado φMn y estribos (ACI 318-19)",
    endpoint: "concreto/viga-interaccion",
    fields: [
      { name: "fc", label: "f'c", unit: "MPa", defaultValue: 28 },
      { name: "fy", label: "fy", unit: "MPa", defaultValue: 420 },
      { name: "b", label: "Ancho (b)", unit: "mm", defaultValue: 300 },
      { name: "d", label: "Peralte efectivo (d)", unit: "mm", defaultValue: 500 },
      { name: "Mu", label: "Momento último Mu", unit: "kN·m", defaultValue: 180 },
      { name: "Vu", label: "Cortante último Vu", unit: "kN", defaultValue: 120 },
    ],
  },
  // ── Acero ─────────────────────────────────────────────────────────────────
  {
    id: "acero-viga-i",
    title: "Vigas I & RHM — Flexión + Cortante",
    description: "Verificación φMn, φVn y pandeo lateral (AISC 360-22)",
    endpoint: "acero/viga-i",
    fields: [
      { name: "Fy", label: "Fy", unit: "MPa", defaultValue: 250 },
      { name: "Fu", label: "Fu", unit: "MPa", defaultValue: 400 },
      { name: "Ix_cm4", label: "Ix", unit: "cm⁴", defaultValue: 15000 },
      { name: "Sx_cm3", label: "Sx", unit: "cm³", defaultValue: 750 },
      { name: "Zx_cm3", label: "Zx", unit: "cm³", defaultValue: 850 },
      { name: "d_mm", label: "Altura total d", unit: "mm", defaultValue: 400 },
      { name: "bf_mm", label: "Ancho de ala bf", unit: "mm", defaultValue: 200 },
      { name: "tf_mm", label: "Espesor ala tf", unit: "mm", defaultValue: 12 },
      { name: "tw_mm", label: "Espesor alma tw", unit: "mm", defaultValue: 8 },
      { name: "L_m", label: "Longitud L", unit: "m", defaultValue: 6 },
      { name: "Mu_kNm", label: "Mu", unit: "kN·m", defaultValue: 200 },
      { name: "Vu_kN", label: "Vu", unit: "kN", defaultValue: 80 },
    ],
  },
  {
    id: "acero-pandeo",
    title: "Diseño por Pandeo Axial",
    description: "Resistencia φPn y modo de pandeo (AISC 360-22 Cap. E)",
    endpoint: "acero/pandeo",
    fields: [
      { name: "Fy", label: "Fy", unit: "MPa", defaultValue: 250 },
      { name: "A_cm2", label: "Área A", unit: "cm²", defaultValue: 80 },
      { name: "rx_cm", label: "rx", unit: "cm", defaultValue: 8 },
      { name: "ry_cm", label: "ry", unit: "cm", defaultValue: 4 },
      { name: "Lx_m", label: "Longitud Lx", unit: "m", defaultValue: 4 },
      { name: "Ly_m", label: "Longitud Ly", unit: "m", defaultValue: 4 },
      { name: "Kx", label: "Kx", unit: "", defaultValue: 1.0 },
      { name: "Ky", label: "Ky", unit: "", defaultValue: 1.0 },
      { name: "Pu_kN", label: "Pu (carga axial)", unit: "kN", defaultValue: 500 },
    ],
  },
  {
    id: "acero-deflexion",
    title: "Deflexión de Viga",
    description: "Verificación de deflexión máxima vs. límite L/n",
    endpoint: "acero/deflexion",
    fields: [
      { name: "Ix_cm4", label: "Ix", unit: "cm⁴", defaultValue: 15000 },
      { name: "L_m", label: "Longitud L", unit: "m", defaultValue: 6 },
      { name: "w_kNm", label: "Carga dist. w", unit: "kN/m", defaultValue: 20 },
      { name: "P_kN", label: "Carga puntual P", unit: "kN", defaultValue: 0 },
    ],
  },
  // ── Análisis Estructural ───────────────────────────────────────────────────
  {
    id: "seccion-rect",
    title: "Propiedades de Sección — Rectángulo",
    description: "A, Ix, Iy, Sx, Sy, rx, ry para sección rectangular",
    endpoint: "estructural/seccion",
    fields: [
      { name: "b", label: "Ancho b", unit: "mm", defaultValue: 300 },
      { name: "h", label: "Altura h", unit: "mm", defaultValue: 500 },
    ],
  },
  {
    id: "seccion-i",
    title: "Propiedades de Sección — Perfil I",
    description: "Propiedades geométricas de perfil I laminado o armado",
    endpoint: "estructural/seccion",
    fields: [
      { name: "bf", label: "Ancho de ala bf", unit: "mm", defaultValue: 200 },
      { name: "tf", label: "Espesor ala tf", unit: "mm", defaultValue: 12 },
      { name: "d", label: "Altura total d", unit: "mm", defaultValue: 400 },
      { name: "tw", label: "Espesor alma tw", unit: "mm", defaultValue: 8 },
    ],
  },
  {
    id: "viga-simple",
    title: "Análisis Viga Biapoyada",
    description: "Reacciones, Mmax y deflexión máxima por superposición",
    endpoint: "estructural/viga-simple",
    fields: [
      { name: "L_m", label: "Longitud L", unit: "m", defaultValue: 6 },
      { name: "EI_kNm2", label: "Rigidez EI", unit: "kN·m²", defaultValue: 30000 },
      { name: "w_kNm", label: "Carga dist. w", unit: "kN/m", defaultValue: 15 },
      { name: "P_kN", label: "Carga puntual central P", unit: "kN", defaultValue: 0 },
    ],
  },
];

// ─── Secciones del grid ───────────────────────────────────────────────────────

const GROUPS = [
  {
    title: "Diseño en Concreto",
    color: "from-blue-50 to-cyan-50 border-blue-200",
    accent: "text-blue-700",
    icon: Square,
    ids: ["concreto-minmax", "concreto-refuerzo", "concreto-columna-pm", "concreto-viga"],
  },
  {
    title: "Diseño en Acero",
    color: "from-orange-50 to-amber-50 border-orange-200",
    accent: "text-orange-700",
    icon: Triangle,
    ids: ["acero-viga-i", "acero-pandeo", "acero-deflexion"],
  },
  {
    title: "Análisis Estructural",
    color: "from-emerald-50 to-teal-50 border-emerald-200",
    accent: "text-emerald-700",
    icon: BarChart3,
    ids: ["seccion-rect", "seccion-i", "viga-simple"],
  },
];

const calcMap = Object.fromEntries(CALCULATORS.map((c) => [c.id, c]));

function buildConfig(config: CalculatorConfig): CalculatorConfig {
  if (config.id === "seccion-rect") {
    return { ...config, fields: [{ name: "tipo", label: "tipo", defaultValue: "rectangulo", type: "select", options: [{ value: "rectangulo", label: "rectangulo" }] }, ...config.fields] };
  }
  if (config.id === "seccion-i") {
    return { ...config, fields: [{ name: "tipo", label: "tipo", defaultValue: "I", type: "select", options: [{ value: "I", label: "I" }] }, ...config.fields] };
  }
  return config;
}

function VigaSimpleModal({ onClose }: { onClose: () => void }) {
  const [L, setL] = useState("6");
  const [EI, setEI] = useState("30000");
  const [w, setW] = useState("15");
  const [P, setP] = useState("0");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calc() {
    setLoading(true); setError(null); setResult(null);
    const cargas: any[] = [];
    if (parseFloat(w) > 0) cargas.push({ tipo: "dist", w: parseFloat(w) });
    if (parseFloat(P) > 0) cargas.push({ tipo: "puntual", P: parseFloat(P), a: parseFloat(L) / 2 });
    try {
      const res = await fetch("/api/tools/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "estructural/viga-simple", params: { L_m: parseFloat(L), EI_kNm2: parseFloat(EI), cargas } }),
      });
      const data = await res.json();
      data.error ? setError(data.error) : setResult(data);
    } catch { setError("No se pudo conectar."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Análisis Viga Biapoyada</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><span className="text-xl leading-none">&times;</span></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[["L_m", "Longitud L (m)", L, setL], ["EI_kNm2", "EI (kN·m²)", EI, setEI], ["w_kNm", "Carga dist. w (kN/m)", w, setW], ["P_kN", "Puntual P centro (kN)", P, setP]].map(([, label, val, setter]) => (
              <div key={label as string}>
                <label className="text-xs font-medium text-slate-700">{label as string}</label>
                <input type="number" value={val as string} onChange={e => (setter as any)(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {result && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-sm">
              {Object.entries(result).map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-slate-500 font-mono text-xs">{k}</span><span className="text-slate-800 font-medium">{String(v)}</span></div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2">Cerrar</button>
          <button onClick={calc} disabled={loading} className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-60">{loading ? "Calculando..." : "Calcular"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculosTab() {
  const [active, setActive] = useState<string | null>(null);

  const icons: Record<string, React.ReactNode> = {
    "concreto-minmax": <Layers className="w-5 h-5" />,
    "concreto-refuerzo": <Ruler className="w-5 h-5" />,
    "concreto-columna-pm": <LayoutGrid className="w-5 h-5" />,
    "concreto-viga": <HardHat className="w-5 h-5" />,
    "acero-viga-i": <FlaskConical className="w-5 h-5" />,
    "acero-pandeo": <BarChart3 className="w-5 h-5" />,
    "acero-deflexion": <Ruler className="w-5 h-5" />,
    "seccion-rect": <Square className="w-5 h-5" />,
    "seccion-i": <Triangle className="w-5 h-5" />,
    "viga-simple": <BarChart3 className="w-5 h-5" />,
  };

  const activeConfig = active ? calcMap[active] : null;

  return (
    <>
      <div className="space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Herramientas de Cálculo</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Calculadoras de diseño estructural basadas en normas ACI 318-19 y AISC 360-22.
            Selecciona una herramienta para comenzar.
          </p>
        </div>

        {/* Grupos */}
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.title} className={`rounded-2xl border bg-gradient-to-br ${group.color} p-6 shadow-sm`}>
              <div className="flex items-center gap-3 mb-5">
                <GroupIcon className={`w-6 h-6 ${group.accent}`} />
                <h2 className={`text-lg font-semibold ${group.accent}`}>{group.title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {group.ids.map((id) => {
                  const calc = calcMap[id];
                  if (!calc) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => setActive(id)}
                      className="group flex items-start gap-3 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl p-4 text-left transition-all duration-200 shadow-sm"
                    >
                      <span className={`mt-0.5 ${group.accent} shrink-0`}>{icons[id]}</span>
                      <div className="min-w-0">
                        <p className="text-slate-800 text-sm font-medium leading-tight">{calc.title}</p>
                        <p className="text-slate-500 text-xs mt-1 leading-snug line-clamp-2">{calc.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {active === "viga-simple" && (
        <VigaSimpleModal onClose={() => setActive(null)} />
      )}
      {active && active !== "viga-simple" && activeConfig && (
        <CalculatorModal
          config={buildConfig(activeConfig)}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
