"use client";

import { Alert } from "@/components/ui/alert";
import { FileText } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black items-center justify-center">
      <Alert className="max-w-lg mx-auto bg-slate-800/80 border-cyan-500/30 text-white text-center shadow-lg">
        <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <h2 className="text-2xl font-bold mb-2">¡Página de Términos en desarrollo!</h2>
        <p className="text-slate-300 mb-2">Estamos trabajando para ofrecerte información clara sobre términos y condiciones de uso.</p>
        <span className="text-cyan-400 font-semibold">Próximamente disponible</span>
      </Alert>
    </div>
  );
}
