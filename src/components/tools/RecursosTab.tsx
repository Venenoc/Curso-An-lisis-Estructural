"use client";

import { Download, CheckSquare, Calculator, FileText, DollarSign } from "lucide-react";
import type { ToolResource } from "./BibliotecaTab";

interface Props {
  resources: ToolResource[];
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; gradient: string; border: string; accent: string }> = {
  structural_checklist: {
    label: "Lista de Verificación Estructural",
    icon: <CheckSquare className="w-6 h-6" />,
    gradient: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
  },
  calculation_templates: {
    label: "Plantillas de Cálculo",
    icon: <Calculator className="w-6 h-6" />,
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/30",
    accent: "text-blue-400",
  },
  report_templates: {
    label: "Plantillas de Memoria",
    icon: <FileText className="w-6 h-6" />,
    gradient: "from-violet-600/20 to-purple-600/20",
    border: "border-violet-500/30",
    accent: "text-violet-400",
  },
  budget_templates: {
    label: "Plantillas de Presupuesto",
    icon: <DollarSign className="w-6 h-6" />,
    gradient: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/30",
    accent: "text-orange-400",
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
  const displayItems = resources.length > 0 ? resources : PLACEHOLDER_ITEMS;
  const isEmpty = resources.length === 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Recursos de Productividad</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Plantillas, checklists y documentos listos para usar en tu práctica profesional.
        </p>
        {isEmpty && (
          <p className="text-amber-400/80 text-sm mt-1">
            Vista previa — los recursos se habilitarán próximamente.
          </p>
        )}
      </div>

      {/* Grid 2 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayItems.map((item) => {
          const meta = CATEGORY_META[item.category] ?? {
            label: item.category,
            icon: <FileText className="w-6 h-6" />,
            gradient: "from-slate-600/20 to-slate-700/20",
            border: "border-slate-500/30",
            accent: "text-slate-400",
          };
          const canDownload = Boolean(item.file_url);

          return (
            <div
              key={item.id}
              className={`flex gap-5 bg-gradient-to-br ${meta.gradient} border ${meta.border} rounded-2xl p-6 transition-all duration-200 hover:brightness-110`}
            >
              {/* Icon */}
              <div className={`shrink-0 mt-0.5 ${meta.accent}`}>{meta.icon}</div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{meta.label}</p>
                    <h3 className="text-white font-semibold leading-snug mt-0.5">{item.title}</h3>
                  </div>
                  {item.is_free && (
                    <span className="shrink-0 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
                      Gratis
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                )}
                <div className="pt-1">
                  {canDownload ? (
                    <a
                      href={item.file_url!}
                      download
                      className={`inline-flex items-center gap-2 text-sm font-medium ${meta.accent} hover:underline`}
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Download className="w-4 h-4" />
                      Próximamente
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
