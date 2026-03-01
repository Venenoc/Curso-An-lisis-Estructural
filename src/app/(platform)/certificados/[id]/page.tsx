import { notFound } from "next/navigation";
import { getCertificate } from "@/app/actions/certificates";
import { GraduationCap, Award, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import PrintButton from "./PrintButton";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await getCertificate(id);

  if (!cert) notFound();

  const issueDate = new Date(cert.issued_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black flex flex-col items-center justify-center p-6">
      {/* Print button */}
      <div className="w-full max-w-3xl mb-4 flex justify-end gap-3 print:hidden">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Volver al Dashboard
        </Link>
        <PrintButton />
      </div>

      {/* Certificate */}
      <div
        className="w-full max-w-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
          border-2 border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden
          print:shadow-none print:border print:border-gray-300 print:rounded-none print:max-w-none"
      >
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400" />

        <div className="p-12 text-center space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm uppercase tracking-[0.3em]">
              Curso de Análisis Estructural
            </p>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              Certificado de Finalización
            </h1>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/40" />
            <Award className="w-5 h-5 text-cyan-400" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/40" />
          </div>

          {/* Body */}
          <div className="space-y-4">
            <p className="text-slate-300 text-lg">Se certifica que</p>
            <h2 className="text-4xl font-bold text-white">
              {cert.holder_name || "Estudiante"}
            </h2>
            <p className="text-slate-300 text-lg">
              completó exitosamente el curso
            </p>
            <h3 className="text-2xl font-semibold text-cyan-300 max-w-xl mx-auto leading-tight">
              {cert.course_title}
            </h3>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/40" />
            <div className="w-2 h-2 rounded-full bg-cyan-500/60" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/40" />
          </div>

          {/* Meta info */}
          <div className="flex justify-center gap-10 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span>{issueDate}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Hash className="w-4 h-4 text-cyan-500" />
              <span className="font-mono text-xs">{cert.id.split("-")[0].toUpperCase()}</span>
            </div>
          </div>

          {/* Signature line */}
          <div className="flex justify-center pt-4">
            <div className="text-center">
              <div className="w-40 h-px bg-slate-600 mb-2" />
              <p className="text-slate-500 text-xs">Instructor — Curso de Análisis Estructural</p>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500" />
      </div>

      {/* Verification note */}
      <p className="mt-4 text-slate-600 text-xs print:hidden">
        ID de verificación: {cert.id}
      </p>
    </div>
  );
}
