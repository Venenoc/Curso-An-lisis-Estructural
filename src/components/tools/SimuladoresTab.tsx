"use client";

import { ExternalLink, Clock } from "lucide-react";

const SIMULADORES = [
  {
    id: "portales",
    title: "Pórticos Planos",
    description:
      "Análisis estático de pórticos 2D. Ingresa nodos, barras y cargas para obtener diagramas de momento, cortante y axial.",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-blue-50 to-cyan-50",
    border: "border-blue-200",
    accent: "text-blue-700",
  },
  {
    id: "vigas",
    title: "Vigas Continuas",
    description:
      "Método de rigidez para vigas continuas con múltiples apoyos y cargas. Diagramas de esfuerzos interactivos.",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    accent: "text-violet-700",
  },
  {
    id: "armaduras",
    title: "Armaduras (Trusses)",
    description:
      "Análisis matricial de armaduras planas. Calcula deformaciones y fuerzas en cada barra bajo cargas nodales.",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    accent: "text-emerald-700",
  },
  {
    id: "seccion-interactiva",
    title: "Constructor de Secciones",
    description:
      "Crea secciones transversales compuestas y obtén sus propiedades geométricas (A, Ix, Iy, Sx, centroide).",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-orange-50 to-amber-50",
    border: "border-orange-200",
    accent: "text-orange-700",
  },
  {
    id: "carga-lateral",
    title: "Distribución de Carga Sísmica",
    description:
      "Método estático equivalente para distribución de fuerzas sísmicas en altura según NTC o ASCE 7.",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-rose-50 to-pink-50",
    border: "border-rose-200",
    accent: "text-rose-700",
  },
];

export default function SimuladoresTab() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Simuladores Visuales</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Herramientas interactivas de análisis estructural con visualización en tiempo real.
          Actualmente en desarrollo.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SIMULADORES.map((sim) => (
          <div
            key={sim.id}
            className={`relative flex flex-col bg-gradient-to-br ${sim.gradient} border ${sim.border} rounded-2xl p-6 overflow-hidden shadow-sm`}
          >
            {/* Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-white/80 border border-slate-300 text-slate-600">
              <Clock className="w-3 h-3" />
              {sim.badge}
            </div>

            {/* Content */}
            <div className="space-y-3 flex-1">
              <h3 className={`text-xl font-semibold ${sim.accent}`}>{sim.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{sim.description}</p>
            </div>

            {/* CTA placeholder */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Disponible en próxima actualización</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center py-4">
        <p className="text-slate-500 text-sm">
          ¿Tienes sugerencias de simuladores? Compártelas en la sección de Comunidad.
        </p>
      </div>
    </div>
  );
}
