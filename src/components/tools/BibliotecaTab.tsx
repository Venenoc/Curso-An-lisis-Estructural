"use client";

import { useRouter } from "next/navigation";
import { Download, BookOpen, FileText, Table2, FileSpreadsheet, BookMarked, Search } from "lucide-react";

const CDN = process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL ?? "";

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
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  formula_sheets: {
    label: "Formularios",
    icon: <FileText className="w-5 h-5" />,
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
  excel_templates: {
    label: "Plantillas Excel",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  manuals_guides: {
    label: "Manuales y Guías",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-violet-700 bg-violet-50 border-violet-200",
  },
  manuals_details: {
    label: "Detalles de Manuales",
    icon: <FileText className="w-5 h-5" />,
    color: "text-pink-700 bg-pink-50 border-pink-200",
  },
  column_details: {
    label: "Detalles de Columnas",
    icon: <Table2 className="w-5 h-5" />,
    color: "text-orange-700 bg-orange-50 border-orange-200",
  },
  structural_details: {
    label: "Detalles Estructurales",
    icon: <Table2 className="w-5 h-5" />,
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  example_models: {
    label: "Modelos de Ejemplo",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-teal-700 bg-teal-50 border-teal-200",
  },
};

const PLACEHOLDER_ITEMS: ToolResource[] = [
  { 
    id: "p1", 
    title: "Normatividad ACI - NTP", 
    description: "Compendio de normas y regulaciones técnicas para el análisis y diseño estructural.", 
    category: "norms_codes", 
    file_url: null, 
    thumbnail_url: null, 
    is_free: false 
  },
  { 
    id: "p2", 
    title: "Manuales y Guías", 
    description: "Documentación técnica y guías de usuario para el diseño de acero estructural.", 
    category: "norms_codes", 
    file_url: null, 
    thumbnail_url: null, 
    is_free: false 
  },
  { 
    id: "p3", 
    title: "Tablas y Fórmulas", 
    description: "Hojas de referencia rápida con fórmulas de diseño a flexión según ACI 318-19.", 
    category: "formula_sheets", 
    file_url: null, 
    thumbnail_url: null, 
    is_free: true 
  },
  { 
    id: "p4", 
    title: "Plantilla Excel", 
    description: "Hoja de cálculo programada con las ecuaciones para Análisis y Diseño Estructural.", 
    category: "excel_templates", 
    file_url: null, 
    thumbnail_url: null, 
    is_free: true 
  },
  { 
    id: "p5", 
    title: "Detalles Estructurales", 
    description: "Planos y detalles típicos de refuerzo para vigas y elementos de concreto.", 
    category: "structural_details", 
    file_url: null, 
    thumbnail_url: null, 
    is_free: false 
  },
  { 
    id: "p6", 
    title: "Ejemplo de Modelos", 
    description: "Archivos de modelos estructurales de referencia para análisis y diseño.", 
    category: "structural_models", 
    file_url: null, 
    thumbnail_url: null, 
    is_free: false 
  }
];

export default function BibliotecaTab({ resources }: Props) {
  const router = useRouter();
  const displayItems = resources.length > 0 ? resources : PLACEHOLDER_ITEMS;
  const isEmpty = resources.length === 0;

  return (
    <div className="min-h-screen py-2 px-2 sm:px-6 lg:px-16">
      {/* Título con icono y Barra de búsqueda */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-400" />
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Librería <span className="font-light">Técnica</span></h1>
          </div>
          <div className="relative w-full max-w-md md:w-96">
            <input
              type="text"
              placeholder="Search technical library..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
              disabled
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          </div>
        </div>

      {/* Grid de tarjetas tipo biblioteca */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayItems.map((item) => {
          const meta = CATEGORY_META[item.category] ?? {
            label: item.category,
            icon: <FileText className="w-5 h-5" />,
            color: "text-slate-600 bg-slate-50 border-slate-200",
          };
          const canDownload = Boolean(item.file_url);
          const isNormatividadCard = item.id === "p1" || item.title.toLowerCase().includes("normativ");

          return (
            <div
              key={item.id}
              className={`flex flex-col bg-[#F0F3FA] border border-slate-100 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-200 group p-6 ${isNormatividadCard ? "cursor-pointer" : ""}`}
              onClick={isNormatividadCard ? () => router.push("/tools/biblioteca/normatividad") : undefined}
            >
              {/* Imagen superior */}
              <div className="w-full h-32 overflow-hidden mb-4">
                {item.id === "p1" ? (
                  <img src={`${CDN}/images/Herramientas/Librería%20Teécnica/1.Normativa.jpg`} alt={item.title} className="object-cover w-full h-full" />
                ) : item.id === "p2" ? (
                  <img src={`${CDN}/images/Herramientas/Librería%20Teécnica/2.Manuales%20y%20Guias.jpg`} alt={item.title} className="object-cover w-full h-full" />
                ) : item.id === "p3" ? (
                  <img src={`${CDN}/images/Herramientas/Librería%20Teécnica/3.Tablas%20y%20Formularios.jpg`} alt={item.title} className="object-cover w-full h-full" />
                ) : item.id === "p4" ? (
                  <img src={`${CDN}/images/Herramientas/Librería%20Teécnica/4.Plantillas%20Excel.jpg`} alt={item.title} className="object-cover w-full h-full" />
                ) : item.id === "p5" ? (
                  <img src={`${CDN}/images/Herramientas/Librería%20Teécnica/5.Detalles%20estructurales.jpg`} alt={item.title} className="object-cover w-full h-full" />
                ) : item.id === "p6" ? (
                  <img src={`${CDN}/images/Herramientas/Librería%20Teécnica/6.Ejemplo%20de%20modelos.jpg`} alt={item.title} className="object-cover w-full h-full" />
                ) : item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-100">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                )}
              </div>
              {/* Título */}
              <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{item.title}</h3>
              {/* Descripción */}
              {item.description && (
                <p className="text-slate-500 text-sm mb-4 min-h-[40px]">{item.description}</p>
              )}
              {/* Browse y etiquetas */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 font-medium cursor-pointer">Browse</span>
                <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 font-medium cursor-pointer">Most Popular</span>
                <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 font-medium cursor-pointer">Codes Map</span>
              </div>
              {/* Botón de descarga o próximamente */}
              <div className="mt-auto">
                {canDownload ? (
                  <a
                    href={item.file_url!}
                    download
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 text-slate-400 text-xs rounded-lg cursor-not-allowed">
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
