"use client";

import { useState } from "react";
import CalculatorModal, { CalculatorConfig } from "@/components/tools/CalculatorModal";
import {
  ChevronRight, Square, Triangle, BarChart3, Layers, HardHat,
  Ruler, LayoutGrid, FlaskConical, Calculator, Search,
} from "lucide-react";

const CALCULATORS: CalculatorConfig[] = [
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
    title: "Deflexión de Viga de Acero",
    description: "Verificación de deflexión máxima vs. límite L/n",
    endpoint: "acero/deflexion",
    fields: [
      { name: "Ix_cm4", label: "Ix", unit: "cm⁴", defaultValue: 15000 },
      { name: "L_m", label: "Longitud L", unit: "m", defaultValue: 6 },
      { name: "w_kNm", label: "Carga dist. w", unit: "kN/m", defaultValue: 20 },
      { name: "P_kN", label: "Carga puntual P", unit: "kN", defaultValue: 0 },
    ],
  },
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

const CARD_META: Record<string, { color: string; tag: string; tagColor: string; icon: React.ReactNode }> = {
  "concreto-minmax":    { color: "#1e40af", tag: "Concreto",           tagColor: "bg-blue-100 text-blue-700",    icon: <Layers className="w-6 h-6 text-white" /> },
  "concreto-refuerzo":  { color: "#1d4ed8", tag: "Concreto",           tagColor: "bg-blue-100 text-blue-700",    icon: <Ruler className="w-6 h-6 text-white" /> },
  "concreto-columna-pm":{ color: "#1e3a8a", tag: "Concreto",           tagColor: "bg-blue-100 text-blue-700",    icon: <LayoutGrid className="w-6 h-6 text-white" /> },
  "concreto-viga":      { color: "#2563eb", tag: "Concreto",           tagColor: "bg-blue-100 text-blue-700",    icon: <HardHat className="w-6 h-6 text-white" /> },
  "acero-viga-i":       { color: "#7f1d1d", tag: "Acero",              tagColor: "bg-red-100 text-red-700",      icon: <FlaskConical className="w-6 h-6 text-white" /> },
  "acero-pandeo":       { color: "#991b1b", tag: "Acero",              tagColor: "bg-red-100 text-red-700",      icon: <BarChart3 className="w-6 h-6 text-white" /> },
  "acero-deflexion":    { color: "#b91c1c", tag: "Acero",              tagColor: "bg-red-100 text-red-700",      icon: <Ruler className="w-6 h-6 text-white" /> },
  "seccion-rect":       { color: "#065f46", tag: "Análisis Estructural", tagColor: "bg-emerald-100 text-emerald-700", icon: <Square className="w-6 h-6 text-white" /> },
  "seccion-i":          { color: "#047857", tag: "Análisis Estructural", tagColor: "bg-emerald-100 text-emerald-700", icon: <Triangle className="w-6 h-6 text-white" /> },
  "viga-simple":        { color: "#0f766e", tag: "Análisis Estructural", tagColor: "bg-emerald-100 text-emerald-700", icon: <BarChart3 className="w-6 h-6 text-white" /> },
};

const calcMap = Object.fromEntries(CALCULATORS.map((c) => [c.id, c]));

function buildConfig(config: CalculatorConfig): CalculatorConfig {
  if (config.id === "seccion-rect") return { ...config, fields: [{ name: "tipo", label: "tipo", defaultValue: "rectangulo", type: "select", options: [{ value: "rectangulo", label: "rectangulo" }] }, ...config.fields] };
  if (config.id === "seccion-i") return { ...config, fields: [{ name: "tipo", label: "tipo", defaultValue: "I", type: "select", options: [{ value: "I", label: "I" }] }, ...config.fields] };
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
            {[["L_m","Longitud L (m)",L,setL],["EI_kNm2","EI (kN·m²)",EI,setEI],["w_kNm","Carga dist. w (kN/m)",w,setW],["P_kN","Puntual P centro (kN)",P,setP]].map(([,label,val,setter]) => (
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

export default function CalculosTab() {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = CALCULATORS.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (CARD_META[c.id]?.tag ?? "").toLowerCase().includes(q);
  });

  const activeConfig = active ? calcMap[active] : null;

  return (
    <>
      <div className="min-h-screen py-2 px-2 sm:px-6 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Calculator className="w-7 h-7 text-blue-400" />
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Herramientas de <span className="font-light">Cálculo</span></h1>
          </div>
          <div className="relative w-full max-w-md md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar calculadora..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((calc) => {
            const meta = CARD_META[calc.id];
            return (
              <div key={calc.id} className="flex flex-col bg-[#F0F3FA] border border-slate-100 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-200 group p-6">
                {/* Thumbnail */}
                <div className="w-full h-32 overflow-hidden mb-4 rounded-md flex items-center justify-center" style={{ backgroundColor: meta?.color ?? "#1e40af" }}>
                  <div className="flex flex-col items-center gap-2 opacity-90">
                    {meta?.icon}
                    <span className="text-white text-xs font-semibold opacity-70">{meta?.tag}</span>
                  </div>
                </div>
                {/* Title */}
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{calc.title}</h3>
                {/* Description */}
                <p className="text-slate-500 text-sm mb-4 min-h-[40px]">{calc.description}</p>
                {/* Tag */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs rounded-full px-3 py-1 font-medium ${meta?.tagColor ?? "bg-blue-100 text-blue-700"}`}>{meta?.tag}</span>
                </div>
                {/* Button */}
                <div className="mt-auto">
                  <button
                    onClick={() => setActive(calc.id)}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    Abrir Calculadora
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {active === "viga-simple" && <VigaSimpleModal onClose={() => setActive(null)} />}
      {active && active !== "viga-simple" && activeConfig && (
        <CalculatorModal config={buildConfig(activeConfig)} onClose={() => setActive(null)} />
      )}
    </>
  );
}
