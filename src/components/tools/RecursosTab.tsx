"use client";

import { useState } from "react";
import { Download, CheckSquare, Calculator, FileText, DollarSign, Search, BookMarked } from "lucide-react";
import type { ToolResource } from "./BibliotecaTab";

interface Props {
  resources: ToolResource[];
}

const CATEGORY_META: Record<string, { label: string; tagColor: string; color: string; icon: React.ReactNode }> = {
  structural_checklist: {
    label: "Verificación Estructural",
    tagColor: "bg-emerald-100 text-emerald-700",
    color: "#065f46",
    icon: <CheckSquare className="w-6 h-6 text-white" />,
  },
  calculation_templates: {
    label: "Plantillas de Cálculo",
    tagColor: "bg-blue-100 text-blue-700",
    color: "#1e40af",
    icon: <Calculator className="w-6 h-6 text-white" />,
  },
  report_templates: {
    label: "Plantillas de Memoria",
    tagColor: "bg-violet-100 text-violet-700",
    color: "#5b21b6",
    icon: <FileText className="w-6 h-6 text-white" />,
  },
  budget_templates: {
    label: "Plantillas de Presupuesto",
    tagColor: "bg-orange-100 text-orange-700",
    color: "#c2410c",
    icon: <DollarSign className="w-6 h-6 text-white" />,
  },
};

const PLACEHOLDER_ITEMS: ToolResource[] = [
  {
    id: "r1",
    title: "Checklist Revisión de Proyecto Estructural",
    description: "Lista de verificación completa para revisión de memorias de cálculo, planos y especificaciones.",
    category: "structural_checklist",
    file_url: null,
    thumbnail_url: null,
    is_free: true,
  },
  {
    id: "r2",
    title: "Plantilla de Memoria de Cálculo",
    description: "Documento Word preformateado para organizar y presentar memorias de cálculo estructural.",
    category: "report_templates",
    file_url: null,
    thumbnail_url: null,
    is_free: false,
  },
  {
    id: "r3",
    title: "Plantillas Excel de Cálculo Estructural",
    description: "Set de hojas de cálculo para diseño de elementos: vigas, columnas, zapatas y conexiones.",
    category: "calculation_templates",
    file_url: null,
    thumbnail_url: null,
    is_free: false,
  },
  {
    id: "r4",
    title: "Plantilla de Presupuesto de Obra",
    description: "Estimación de costos por partidas para proyectos de estructura de concreto y acero.",
    category: "budget_templates",
    file_url: null,
    thumbnail_url: null,
    is_free: false,
  },
];

export default function RecursosTab({ resources }: Props) {
  const [search, setSearch] = useState("");
  const displayItems = resources.length > 0 ? resources : PLACEHOLDER_ITEMS;

  const filtered = displayItems.filter((item) => {
    const q = search.toLowerCase();
    const meta = CATEGORY_META[item.category];
    return !q || item.title.toLowerCase().includes(q) || (item.description ?? "").toLowerCase().includes(q) || (meta?.label ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen py-2 px-2 sm:px-6 lg:px-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <BookMarked className="w-7 h-7 text-blue-400" />
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Recursos de <span className="font-light">Productividad</span></h1>
        </div>
        <div className="relative w-full max-w-md md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar recurso, plantilla..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const meta = CATEGORY_META[item.category] ?? {
            label: item.category,
            tagColor: "bg-slate-100 text-slate-600",
            color: "#475569",
            icon: <FileText className="w-6 h-6 text-white" />,
          };
          const canDownload = Boolean(item.file_url);

          return (
            <div key={item.id} className="flex flex-col bg-[#F0F3FA] border border-slate-100 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-200 group p-6">
              {/* Thumbnail */}
              <div className="w-full h-32 overflow-hidden mb-4 rounded-md flex items-center justify-center" style={{ backgroundColor: meta.color }}>
                <div className="flex flex-col items-center gap-2 opacity-90">
                  {meta.icon}
                  <span className="text-white text-xs font-semibold opacity-70">{meta.label}</span>
                </div>
              </div>
              {/* Title */}
              <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{item.title}</h3>
              {/* Description */}
              {item.description && (
                <p className="text-slate-500 text-sm mb-4 min-h-[40px]">{item.description}</p>
              )}
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs rounded-full px-3 py-1 font-medium ${meta.tagColor}`}>{meta.label}</span>
                {item.is_free && (
                  <span className="text-xs rounded-full px-3 py-1 font-medium bg-green-100 text-green-700">Gratis</span>
                )}
              </div>
              {/* Button */}
              <div className="mt-auto">
                {canDownload ? (
                  <a
                    href={item.file_url!}
                    download
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs rounded-lg cursor-not-allowed select-none">
                    <Download className="w-3.5 h-3.5" />
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

