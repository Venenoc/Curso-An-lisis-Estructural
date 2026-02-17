"use client";

import { Alert } from "@/components/ui/alert";
import { Wrench } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100 items-center justify-center">
      <Alert className="max-w-lg mx-auto bg-white/90 border-cyan-300/40 text-slate-800 text-center shadow-lg p-8">
        <Wrench className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-extrabold mb-4 text-cyan-600">¡Herramientas exclusivas para ti!</h2>
        <p className="text-base text-slate-700 mb-4">
          Pronto podrás acceder a <span className="font-semibold text-cyan-700">herramientas interactivas</span> que facilitarán tu aprendizaje y potenciarán tu trabajo profesional.<br />
          ¡Prepárate para descubrir recursos únicos pensados para ingenieros civiles!
        </p>
        <span className="inline-block bg-cyan-100 text-cyan-700 rounded-full px-4 py-2 font-bold shadow-sm mt-2">
          🛠️ ¡Lanzamiento muy pronto!
        </span>
      </Alert>
    </div>
  );
}
