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
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 border border-blue-200 flex items-center justify-center">
            <Bot className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Asistente IA</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-amber-600 text-sm font-medium">Próximamente disponible</span>
          </div>
        </div>
        <p className="text-slate-500 leading-relaxed">
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
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 text-left opacity-50 cursor-not-allowed shadow-sm"
            >
              <Icon className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-slate-700 text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fake chat input */}
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <input
            disabled
            placeholder="El asistente IA estará disponible próximamente..."
            className="flex-1 bg-transparent text-slate-400 text-sm placeholder-slate-400 outline-none cursor-not-allowed"
          />
          <button disabled className="p-2 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
