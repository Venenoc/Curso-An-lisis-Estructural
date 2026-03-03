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
    gradient: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    accent: "text-emerald-700",
  },
  calculation_templates: {
    label: "Plantillas de Cálculo",
    icon: <Calculator className="w-6 h-6" />,
    gradient: "from-blue-50 to-cyan-50",
    border: "border-blue-200",
    accent: "text-blue-700",
  },
  report_templates: {
    label: "Plantillas de Memoria",
    icon: <FileText className="w-6 h-6" />,
    gradient: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    accent: "text-violet-700",
  },
  budget_templates: {
    label: "Plantillas de Presupuesto",
    icon: <DollarSign className="w-6 h-6" />,
    gradient: "from-orange-50 to-amber-50",
    border: "border-orange-200",
    accent: "text-orange-700",
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
        <h1 className="text-3xl font-bold text-slate-800">Recursos de Productividad</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Plantillas, checklists y documentos listos para usar en tu práctica profesional.
        </p>
        {isEmpty && (
          <p className="text-amber-600 text-sm mt-1">
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
            gradient: "from-slate-50 to-slate-100",
            border: "border-slate-200",
            accent: "text-slate-600",
          };
          const canDownload = Boolean(item.file_url);

          return (
            <div
              key={item.id}
              className={`flex gap-5 bg-gradient-to-br ${meta.gradient} border ${meta.border} rounded-2xl p-6 transition-all duration-200 hover:shadow-md shadow-sm`}
            >
              <div className={`shrink-0 mt-0.5 ${meta.accent}`}>{meta.icon}</div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{meta.label}</p>
                    <h3 className="text-slate-800 font-semibold leading-snug mt-0.5">{item.title}</h3>
                  </div>
                  {item.is_free && (
                    <span className="shrink-0 text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
                      Gratis
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
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
                    <span className="inline-flex items-center gap-2 text-sm text-slate-400">
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
