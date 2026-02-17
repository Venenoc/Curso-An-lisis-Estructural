"use client";

import { Alert } from "@/components/ui/alert";
import { FileText } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100 py-40">
      <div className="mx-auto max-w-3xl bg-white/90 border border-cyan-300/40 rounded-2xl p-10 shadow-lg">
        <h1 className="text-4xl font-extrabold mb-8 text-cyan-700 text-center">
          Términos y Condiciones
        </h1>
        <div className="prose prose-gray max-w-none text-slate-800">
          <p className="mb-4">
            Estos términos y condiciones regulan el uso de la plataforma y los servicios ofrecidos. Al acceder o utilizar la plataforma, aceptas cumplir con estos términos.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">1. Uso de la plataforma</h2>
          <ul>
            <li>Debes proporcionar información veraz y mantener la confidencialidad de tus credenciales.</li>
            <li>No está permitido compartir tu cuenta ni realizar actividades fraudulentas.</li>
            <li>El uso de los contenidos es solo para fines educativos y personales.</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">2. Propiedad intelectual</h2>
          <p>
            Todos los materiales, cursos y recursos son propiedad de la plataforma o de sus respectivos autores. No está permitida su reproducción o distribución sin autorización.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">3. Pagos y devoluciones</h2>
          <ul>
            <li>Los pagos realizados por cursos o servicios no son reembolsables, salvo indicación expresa.</li>
            <li>La plataforma se reserva el derecho de modificar precios y condiciones en cualquier momento.</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">4. Responsabilidad</h2>
          <p>
            No nos hacemos responsables por daños derivados del uso indebido de la plataforma o por interrupciones del servicio ajenas a nuestro control.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">5. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">6. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos términos, puedes contactarnos a través del formulario de contacto.
          </p>
          <p className="mt-8 text-xs text-slate-400 text-center">
            Última actualización: 15 de febrero de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
