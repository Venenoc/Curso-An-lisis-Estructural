import { getUserCertificates } from "@/app/actions/certificates";
import { GraduationCap, Award, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function CertificadosPage() {
  const certificates = await getUserCertificates();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <ScrollReveal delay={0.1} className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mis Certificados</h1>
          <p className="text-slate-400 text-sm">
            {certificates.length === 0
              ? "Aún no tienes certificados. Completa un curso para obtener el tuyo."
              : `Tienes ${certificates.length} certificado${certificates.length > 1 ? "s" : ""} de finalización.`}
          </p>
        </ScrollReveal>

        {/* Empty state */}
        {certificates.length === 0 && (
          <ScrollReveal delay={0.2}>
          <div className="flex flex-col items-center justify-center py-20 border border-slate-700/40 rounded-2xl bg-slate-800/30">
            <Award className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg font-medium mb-2">Sin certificados todavía</p>
            <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">
              Completa el 100% de las lecciones de cualquier curso para recibir tu certificado.
            </p>
            <Link
              href="/cursos"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Ver cursos disponibles
            </Link>
          </div>
          </ScrollReveal>
        )}

        {/* Certificates grid */}
        {certificates.length > 0 && (
          <div className="grid gap-4">
            {certificates.map((cert, i) => {
              const issueDate = new Date(cert.issued_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              return (
                <ScrollReveal key={cert.id} delay={Math.min(i * 0.08, 0.3)}>
                <Link
                  key={cert.id}
                  href={`/certificados/${cert.id}`}
                  className="group flex items-center gap-5 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5
                    hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-200"
                >
                  {/* Icon */}
                  <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-cyan-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base truncate group-hover:text-cyan-300 transition-colors">
                      {cert.course_title}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Emitido el {issueDate}</span>
                    </div>
                    <p className="text-slate-600 font-mono text-xs mt-1">
                      ID: {cert.id.split("-")[0].toUpperCase()}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex items-center gap-1.5 text-cyan-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver certificado</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
