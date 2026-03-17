import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, CheckCircle2, Star, Users, Clock, ArrowRight, Video } from "lucide-react";

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let id: string | null = null;
    if (parsed.hostname.includes("youtube.com")) {
      id = parsed.searchParams.get("v");
    } else if (parsed.hostname === "youtu.be") {
      id = parsed.pathname.slice(1);
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

const SAMPLE_VIDEOS = [
  {
    id: 1,
    title: "Análisis de armaduras planas",
    description: "Resolución completa de una armadura con el método de nodos, verificación de estabilidad y cálculo de fuerzas internas.",
    duration: "48 min",
    gradient: "from-cyan-600/40 to-blue-800/40",
    accent: "#22d3ee",
    videoUrl: "https://www.youtube.com/watch?v=ivjhXoCuRs4", // ← reemplaza con tu URL
  },
  {
    id: 2,
    title: "Diagramas de cortante y momento",
    description: "Construcción paso a paso de diagramas V y M en vigas continuas con cargas distribuidas y puntuales.",
    duration: "55 min",
    gradient: "from-blue-600/40 to-indigo-800/40",
    accent: "#6366f1",
    videoUrl: "https://www.youtube.com/watch?v=XF39qDIm7XE&feature=youtu.be", // ← reemplaza con tu URL
  },
  {
    id: 3,
    title: "Diseño de columnas de concreto",
    description: "Dimensionamiento y verificación de columnas bajo carga axial y momento biaxial según ACI 318.",
    duration: "62 min",
    gradient: "from-violet-600/40 to-purple-900/40",
    accent: "#a78bfa",
    videoUrl: "https://www.youtube.com/watch?v=dJiGsCxZC5g&feature=youtu.be", // ← reemplaza con tu URL
  },
  {
    id: 4,
    title: "Modelo estructural en SAP2000",
    description: "Sesión práctica de modelado, asignación de cargas sísmicas y lectura de resultados en SAP2000.",
    duration: "74 min",
    gradient: "from-sky-600/40 to-cyan-900/40",
    accent: "#38bdf8",
    videoUrl: "https://www.youtube.com/watch?v=-d1HiwvibQM&feature=youtu.be", // ← reemplaza con tu URL
  },
];

const BENEFITS = [
  { icon: <Video className="w-5 h-5" />, text: "Sesión 1 a 1 por videollamada" },
  { icon: <Clock className="w-5 h-5" />, text: "Duración flexible según tu necesidad" },
  { icon: <CheckCircle2 className="w-5 h-5" />, text: "Resolución de tu problema específico" },
  { icon: <Star className="w-5 h-5" />, text: "Instructor con experiencia en proyectos reales" },
];

export default async function AsesoriasPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Hero ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,0.25)" }}>
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">Atención personalizada</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Asesorías{" "}
            <span style={{
              background: "linear-gradient(135deg, #22d3ee, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Personalizadas
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Resuelve tus dudas de análisis estructural en sesiones 1 a 1 con el instructor.
            Trabajamos directamente sobre tu proyecto o ejercicio.
          </p>
        </div>

        {/* ── Beneficios ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
          {BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-cyan-400 shrink-0">{b.icon}</span>
              <span className="text-slate-300 text-sm">{b.text}</span>
            </div>
          ))}
        </div>

        {/* ── Videos de muestra ── */}
        <div className="mb-14">
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">Ejemplos de asesorías</h2>
          <p className="text-slate-500 text-sm mb-7">Así son las sesiones — mira cómo trabajamos antes de agendar la tuya.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SAMPLE_VIDEOS.map((video) => (
              <div key={video.id} className="group rounded-2xl overflow-hidden"
                style={{ background: "rgba(14,30,54,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>

                {/* Video player */}
                <div className="relative aspect-video bg-black">
                  {(() => {
                    const embedUrl = getYouTubeEmbedUrl(video.videoUrl);
                    return embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: "none" }}
                      />
                    ) : (
                      <video
                        className="w-full h-full"
                        controls
                        controlsList="nodownload noplaybackrate"
                        disablePictureInPicture
                        preload="metadata"
                        src={video.videoUrl}
                      />
                    );
                  })()}
                  {/* Sample badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold pointer-events-none"
                    style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee" }}>
                    Muestra
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-base mb-1">{video.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="rounded-3xl p-8 sm:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(99,102,241,0.08) 100%)", border: "1px solid rgba(34,211,238,0.18)" }}>
          <Calendar className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl sm:text-3xl font-extrabold mb-3">¿Listo para tu asesoría?</h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto mb-8">
            Agenda una sesión personalizada y resuelve exactamente lo que necesitas con atención directa del instructor.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/message/XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #22d3ee, #6366f1)" }}
            >
              Agendar por WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/community"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-200 hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Preguntar en la comunidad
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
