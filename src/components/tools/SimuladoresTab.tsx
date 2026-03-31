"use client";

import { useState } from "react";
import { Clock, Search, Cpu, GitBranch, Box, Layers, Activity, Sliders } from "lucide-react";

const SIMULADORES = [
  {
    id: "portales",
    title: "Pórticos Planos",
    description: "Análisis estático de pórticos 2D. Ingresa nodos, barras y cargas para obtener diagramas de momento, cortante y axial.",
    tag: "Análisis Estructural",
    tagColor: "bg-emerald-100 text-emerald-700",
    color: "#065f46",
    icon: <GitBranch className="w-6 h-6 text-white" />,
  },
  {
    id: "vigas",
    title: "Vigas Continuas",
    description: "Método de rigidez para vigas continuas con múltiples apoyos y cargas. Diagramas de esfuerzos interactivos.",
    tag: "Análisis Estructural",
    tagColor: "bg-emerald-100 text-emerald-700",
    color: "#0f766e",
    icon: <Activity className="w-6 h-6 text-white" />,
  },
  {
    id: "armaduras",
    title: "Armaduras (Trusses)",
    description: "Análisis matricial de armaduras planas. Calcula deformaciones y fuerzas en cada barra bajo cargas nodales.",
    tag: "Análisis Estructural",
    tagColor: "bg-emerald-100 text-emerald-700",
    color: "#047857",
    icon: <Box className="w-6 h-6 text-white" />,
  },
  {
    id: "seccion-interactiva",
    title: "Constructor de Secciones",
    description: "Crea secciones transversales compuestas y obtén sus propiedades geométricas (A, Ix, Iy, Sx, centroide).",
    tag: "Propiedades de Sección",
    tagColor: "bg-orange-100 text-orange-700",
    color: "#c2410c",
    icon: <Layers className="w-6 h-6 text-white" />,
  },
  {
    id: "carga-lateral",
    title: "Distribución de Carga Sísmica",
    description: "Método estático equivalente para distribución de fuerzas sísmicas en altura según E.030 o ASCE 7.",
    tag: "Diseño Sísmico",
    tagColor: "bg-red-100 text-red-700",
    color: "#9f1239",
    icon: <Sliders className="w-6 h-6 text-white" />,
  },
  {
    id: "espectro",
    title: "Espectro de Diseño",
    description: "Generación del espectro de respuesta Sa(T) según E.030 (zonas sísmicas peruanas) y ASCE 7-22.",
    tag: "Diseño Sísmico",
    tagColor: "bg-red-100 text-red-700",
    color: "#be123c",
    icon: <Activity className="w-6 h-6 text-white" />,
  },
];

export default function SimuladoresTab() {
  const [search, setSearch] = useState("");

  const filtered = SIMULADORES.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen py-2 px-2 sm:px-6 lg:px-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Cpu className="w-7 h-7 text-blue-400" />
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Simuladores <span className="font-light">Visuales</span></h1>
        </div>
        <div className="relative w-full max-w-md md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar simulador..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((sim) => (
          <div key={sim.id} className="flex flex-col bg-[#F0F3FA] border border-slate-100 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-200 group p-6">
            {/* Thumbnail */}
            <div className="w-full h-32 overflow-hidden mb-4 rounded-md flex items-center justify-center" style={{ backgroundColor: sim.color }}>
              <div className="flex flex-col items-center gap-2 opacity-90">
                {sim.icon}
                <span className="text-white text-xs font-semibold opacity-70">{sim.tag}</span>
              </div>
            </div>
            {/* Title */}
            <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{sim.title}</h3>
            {/* Description */}
            <p className="text-slate-500 text-sm mb-4 min-h-[40px]">{sim.description}</p>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs rounded-full px-3 py-1 font-medium ${sim.tagColor}`}>{sim.tag}</span>
            </div>
            {/* Button */}
            <div className="mt-auto">
              <div className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs rounded-lg cursor-not-allowed select-none">
                <Clock className="w-3.5 h-3.5" />
                Próximamente
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
