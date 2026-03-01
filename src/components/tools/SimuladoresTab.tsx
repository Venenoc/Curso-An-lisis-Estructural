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
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/30",
    accent: "text-blue-400",
  },
  {
    id: "vigas",
    title: "Vigas Continuas",
    description:
      "Método de rigidez para vigas continuas con múltiples apoyos y cargas. Diagramas de esfuerzos interactivos.",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-violet-600/20 to-purple-600/20",
    border: "border-violet-500/30",
    accent: "text-violet-400",
  },
  {
    id: "armaduras",
    title: "Armaduras (Trusses)",
    description:
      "Análisis matricial de armaduras planas. Calcula deformaciones y fuerzas en cada barra bajo cargas nodales.",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
  },
  {
    id: "seccion-interactiva",
    title: "Constructor de Secciones",
    description:
      "Crea secciones transversales compuestas y obtén sus propiedades geométricas (A, Ix, Iy, Sx, centroide).",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/30",
    accent: "text-orange-400",
  },
  {
    id: "carga-lateral",
    title: "Distribución de Carga Sísmica",
    description:
      "Método estático equivalente para distribución de fuerzas sísmicas en altura según NTC o ASCE 7.",
    status: "coming-soon",
    badge: "Próximamente",
    gradient: "from-rose-600/20 to-pink-600/20",
    border: "border-rose-500/30",
    accent: "text-rose-400",
  },
];

export default function SimuladoresTab() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Simuladores Visuales</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Herramientas interactivas de análisis estructural con visualización en tiempo real.
          Actualmente en desarrollo.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SIMULADORES.map((sim) => (
          <div
            key={sim.id}
            className={`relative flex flex-col bg-gradient-to-br ${sim.gradient} border ${sim.border} rounded-2xl p-6 overflow-hidden`}
          >
            {/* Badge */}
            <div
              className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-black/30 border border-white/10 text-slate-300`}
            >
              <Clock className="w-3 h-3" />
              {sim.badge}
            </div>

            {/* Content */}
            <div className="space-y-3 flex-1">
              <h3 className={`text-xl font-semibold ${sim.accent}`}>{sim.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{sim.description}</p>
            </div>

            {/* CTA placeholder */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
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
