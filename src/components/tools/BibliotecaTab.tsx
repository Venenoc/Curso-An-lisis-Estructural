"use client";

import { Download, BookOpen, FileText, Table2, FileSpreadsheet, BookMarked } from "lucide-react";

export interface ToolResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  thumbnail_url: string | null;
  is_free: boolean;
}

interface Props {
  resources: ToolResource[];
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  norms_codes: {
    label: "Normas y Códigos",
    icon: <BookMarked className="w-5 h-5" />,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  formula_sheets: {
    label: "Formularios",
    icon: <FileText className="w-5 h-5" />,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  excel_templates: {
    label: "Plantillas Excel",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  manuals_guides: {
    label: "Manuales y Guías",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  },
  manuals_details: {
    label: "Detalles de Manuales",
    icon: <FileText className="w-5 h-5" />,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  },
  column_details: {
    label: "Detalles de Columnas",
    icon: <Table2 className="w-5 h-5" />,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  structural_details: {
    label: "Detalles Estructurales",
    icon: <Table2 className="w-5 h-5" />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  example_models: {
    label: "Modelos de Ejemplo",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  },
};

const PLACEHOLDER_ITEMS: ToolResource[] = [
  { id: "p1", title: "ACI 318-19 — Requisitos de Código", description: "Norma completa de diseño de concreto reforzado", category: "norms_codes", file_url: null, thumbnail_url: null, is_free: false },
  { id: "p2", title: "AISC 360-22 — Acero Estructural", description: "Especificación para edificios de acero estructural", category: "norms_codes", file_url: null, thumbnail_url: null, is_free: false },
  { id: "p3", title: "Formulario de Flexión — Concreto", description: "Fórmulas de diseño a flexión ACI 318-19", category: "formula_sheets", file_url: null, thumbnail_url: null, is_free: true },
  { id: "p4", title: "Formulario de Pandeo — Acero", description: "Ecuaciones AISC 360-22 Capítulo E y F", category: "formula_sheets", file_url: null, thumbnail_url: null, is_free: true },
  { id: "p5", title: "Plantilla Diseño de Vigas", description: "Excel para diseño rápido de vigas de concreto", category: "excel_templates", file_url: null, thumbnail_url: null, is_free: false },
  { id: "p6", title: "Plantilla Columnas P-M", description: "Diagrama de interacción automático en Excel", category: "excel_templates", file_url: null, thumbnail_url: null, is_free: false },
  { id: "p7", title: "Manual de Detalles Constructivos", description: "Guía de detalles de conexiones y refuerzo", category: "manuals_guides", file_url: null, thumbnail_url: null, is_free: false },
  { id: "p8", title: "Modelos SAP2000 — Ejemplos", description: "Archivos de ejemplo de análisis estructural 3D", category: "example_models", file_url: null, thumbnail_url: null, is_free: false },
];

export default function BibliotecaTab({ resources }: Props) {
  const displayItems = resources.length > 0 ? resources : PLACEHOLDER_ITEMS;
  const isEmpty = resources.length === 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Biblioteca Técnica</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Normas, formularios, plantillas y manuales de diseño estructural para tu práctica profesional.
        </p>
        {isEmpty && (
          <p className="text-amber-400/80 text-sm mt-1">
            Vista previa — los recursos se habilitarán próximamente.
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayItems.map((item) => {
          const meta = CATEGORY_META[item.category] ?? {
            label: item.category,
            icon: <FileText className="w-5 h-5" />,
            color: "text-slate-400 bg-slate-500/10 border-slate-500/30",
          };
          const canDownload = Boolean(item.file_url);

          return (
            <div
              key={item.id}
              className="flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-200 group"
            >
              {/* Card header */}
              <div className={`flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-br ${meta.color.includes("blue") ? "from-blue-600/10" : meta.color.includes("cyan") ? "from-cyan-600/10" : meta.color.includes("emerald") ? "from-emerald-600/10" : "from-violet-600/10"} to-transparent`}>
                <span className={`p-2 rounded-lg border ${meta.color}`}>{meta.icon}</span>
                <span className="text-xs text-slate-400 font-medium">{meta.label}</span>
                {item.is_free && (
                  <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
                    Gratis
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-2">
                <h3 className="text-white text-sm font-semibold leading-snug">{item.title}</h3>
                {item.description && (
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{item.description}</p>
                )}
              </div>

              {/* Download */}
              <div className="p-4 pt-0">
                {canDownload ? (
                  <a
                    href={item.file_url!}
                    download
                    className="flex items-center justify-center gap-2 w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full py-2 bg-slate-700/30 border border-slate-600/30 text-slate-500 text-xs rounded-lg cursor-not-allowed">
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
