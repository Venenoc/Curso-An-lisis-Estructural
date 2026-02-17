"use client";

import { Alert } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100 py-40">
      <div className="mx-auto max-w-3xl bg-white/90 border border-cyan-300/40 rounded-2xl p-10 shadow-lg">
        <h1 className="text-4xl font-extrabold mb-8 text-cyan-700 text-center">
          Política de Privacidad
        </h1>
        <div className="prose prose-gray max-w-none text-slate-800">
          <p className="mb-4">
            En nuestra plataforma nos tomamos muy en serio la privacidad y protección de tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos tu información.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">1. Información que recopilamos</h2>
          <ul>
            <li>Datos de registro: nombre, correo electrónico y contraseña.</li>
            <li>Información de uso: cursos inscritos, progreso, mensajes y actividad en la plataforma.</li>
            <li>Datos de contacto: mensajes enviados a través de formularios.</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">2. Uso de la información</h2>
          <ul>
            <li>Gestionar tu cuenta y acceso a los cursos.</li>
            <li>Mejorar la experiencia y personalización de la plataforma.</li>
            <li>Comunicaciones relacionadas con el servicio y soporte.</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">3. Protección de datos</h2>
          <p>
            Utilizamos medidas de seguridad técnicas y organizativas para proteger tus datos contra accesos no autorizados, pérdida o alteración.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">4. Compartir información</h2>
          <p>
            No compartimos tu información personal con terceros, salvo obligación legal o para la prestación de servicios esenciales para la plataforma.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">5. Derechos del usuario</h2>
          <ul>
            <li>Acceder, rectificar o eliminar tus datos personales.</li>
            <li>Solicitar la portabilidad de tus datos.</li>
            <li>Retirar tu consentimiento en cualquier momento.</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">6. Cambios en la política</h2>
          <p>
            Nos reservamos el derecho de modificar esta política de privacidad. Notificaremos cualquier cambio relevante a través de la plataforma.
          </p>
          <p className="mt-8 text-xs text-slate-400 text-center">
            Última actualización: 15 de febrero de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
