"use client";

import { Bot, Send, Sparkles, BookOpen, Ruler, FileWarning, RefreshCw } from "lucide-react";

const QUICK_ACTIONS = [
  { icon: BookOpen, label: "Explicar Norma", text: "Explica el artículo de ACI 318-19 sobre..." },
  { icon: Ruler, label: "Sugerencias de Dimensionamiento", text: "Sugiere dimensiones iniciales para una viga de..." },
  { icon: RefreshCw, label: "Revisar Resultados", text: "Revisa estos resultados de diseño: ..." },
  { icon: FileWarning, label: "Detectar Errores", text: "Encuentra errores en este cálculo: ..." },
];

export default function AsistenteTab() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Placeholder header */}
      <div className="text-center space-y-4 max-w-lg">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/30 flex items-center justify-center">
            <Bot className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Asistente IA</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Próximamente disponible</span>
          </div>
        </div>
        <p className="text-slate-400 leading-relaxed">
          El Asistente IA te ayudará a interpretar normas, sugerir dimensiones estructurales,
          revisar resultados y detectar errores en tus cálculos. Estará disponible en la
          próxima actualización de la plataforma.
        </p>
      </div>

      {/* Quick action chips (decorativos) */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              disabled
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 text-left opacity-50 cursor-not-allowed"
            >
              <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-white text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fake chat input */}
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <input
            disabled
            placeholder="El asistente IA estará disponible próximamente..."
            className="flex-1 bg-transparent text-slate-500 text-sm placeholder-slate-600 outline-none cursor-not-allowed"
          />
          <button disabled className="p-2 rounded-lg bg-slate-700/40 text-slate-600 cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
