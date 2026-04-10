"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Clock, Square, Triangle, BarChart3, Layers, HardHat,
  Ruler, LayoutGrid, FlaskConical, Calculator, Search,
} from "lucide-react";

interface CalcCard {
  id: string;
  title: string;
  description: string;
}

const CALCULATORS: CalcCard[] = [
  { id: "concreto-minmax",    title: "Mínimos y Máximos de Acero",          description: "Cuantías mínima y máxima de refuerzo (ACI 318-19 §9.6 / NTP E.060)" },
  { id: "concreto-refuerzo",  title: "Diseño de Refuerzo a Flexión",        description: "As requerido, varillas sugeridas y verificación φMn ≥ Mu" },
  { id: "concreto-columna-pm",title: "Interacción Columna P-M",             description: "Diagrama de interacción para columna rectangular (ACI 318-19)" },
  { id: "concreto-viga",      title: "Interacción Viga (Flexión + Cortante)",description: "Diseño combinado φMn y estribos (ACI 318-19)" },
  { id: "acero-viga-i",       title: "Vigas I & RHM — Flexión + Cortante",  description: "Verificación φMn, φVn y pandeo lateral (AISC 360-22)" },
  { id: "acero-pandeo",       title: "Diseño por Pandeo Axial",             description: "Resistencia φPn y modo de pandeo (AISC 360-22 Cap. E)" },
  { id: "acero-deflexion",    title: "Deflexión de Viga de Acero",          description: "Verificación de deflexión máxima vs. límite L/n" },
  { id: "seccion-rect",       title: "Propiedades de Sección — Rectángulo", description: "A, Ix, Iy, Sx, Sy, rx, ry para sección rectangular" },
  { id: "seccion-i",          title: "Propiedades de Sección — Perfil I",   description: "Propiedades geométricas de perfil I laminado o armado" },
  { id: "viga-simple",        title: "Análisis Viga Biapoyada",             description: "Reacciones, Mmax y deflexión máxima por superposición" },
];

const CARD_META: Record<string, { color: string; tag: string; tagColor: string; icon: React.ReactNode }> = {
  "concreto-minmax":    { color: "#1e40af", tag: "Concreto",            tagColor: "bg-blue-100 text-blue-700",       icon: <Layers className="w-6 h-6 text-white" /> },
  "concreto-refuerzo":  { color: "#1d4ed8", tag: "Concreto",            tagColor: "bg-blue-100 text-blue-700",       icon: <Ruler className="w-6 h-6 text-white" /> },
  "concreto-columna-pm":{ color: "#1e3a8a", tag: "Concreto",            tagColor: "bg-blue-100 text-blue-700",       icon: <LayoutGrid className="w-6 h-6 text-white" /> },
  "concreto-viga":      { color: "#2563eb", tag: "Concreto",            tagColor: "bg-blue-100 text-blue-700",       icon: <HardHat className="w-6 h-6 text-white" /> },
  "acero-viga-i":       { color: "#7f1d1d", tag: "Acero",               tagColor: "bg-red-100 text-red-700",         icon: <FlaskConical className="w-6 h-6 text-white" /> },
  "acero-pandeo":       { color: "#991b1b", tag: "Acero",               tagColor: "bg-red-100 text-red-700",         icon: <BarChart3 className="w-6 h-6 text-white" /> },
  "acero-deflexion":    { color: "#b91c1c", tag: "Acero",               tagColor: "bg-red-100 text-red-700",         icon: <Ruler className="w-6 h-6 text-white" /> },
  "seccion-rect":       { color: "#065f46", tag: "Análisis Estructural", tagColor: "bg-emerald-100 text-emerald-700", icon: <Square className="w-6 h-6 text-white" /> },
  "seccion-i":          { color: "#047857", tag: "Análisis Estructural", tagColor: "bg-emerald-100 text-emerald-700", icon: <Triangle className="w-6 h-6 text-white" /> },
  "viga-simple":        { color: "#0f766e", tag: "Análisis Estructural", tagColor: "bg-emerald-100 text-emerald-700", icon: <BarChart3 className="w-6 h-6 text-white" /> },
};

// Calculadoras con página propia activa
const ACTIVE_PAGES: Record<string, string> = {
  "concreto-minmax": "/tools/calculos/minimos-maximos",
};

export default function CalculosTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = CALCULATORS.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (CARD_META[c.id]?.tag ?? "").toLowerCase().includes(q);
  });

  return (
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
                {ACTIVE_PAGES[calc.id] ? (
                  <button
                    onClick={() => router.push(ACTIVE_PAGES[calc.id])}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    Abrir Calculadora
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs rounded-lg cursor-not-allowed select-none">
                    <Clock className="w-3.5 h-3.5" />
                    Próximamente
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
