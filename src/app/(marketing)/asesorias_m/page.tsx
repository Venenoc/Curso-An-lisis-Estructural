import { createClient as createAdminClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Calendar, CheckCircle2, Star, Users, Clock, ArrowRight, Video } from "lucide-react";

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let id: string | null = null;
    if (parsed.hostname.includes("youtube.com")) id = parsed.searchParams.get("v");
    else if (parsed.hostname === "youtu.be") id = parsed.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
}

const BENEFITS = [
  { icon: <Video className="w-5 h-5" />, text: "Sesión 1 a 1 por videollamada" },
  { icon: <Clock className="w-5 h-5" />, text: "Duración flexible según tu necesidad" },
  { icon: <CheckCircle2 className="w-5 h-5" />, text: "Resolución de tu problema específico" },
  { icon: <Star className="w-5 h-5" />, text: "Instructor con experiencia en proyectos reales" },
];

export default async function AsesoriasMarketingPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await admin
    .from("advisory_videos")
    .select("id, title, description, duration, video_url")
    .eq("is_published", true)
    .order("order");

  const videos = (data || []) as Array<{
    id: string; title: string; description: string | null;
    duration: string | null; video_url: string;
  }>;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: "url('/images/FondoPlataforma/FondoPlatform_d.webp')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
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
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Personalizadas
            </span>
          </h1>
          <p className="text-white text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            <strong>Resuelve tus dudas de análisis y diseño estructural en sesiones 1 a 1 con el instructor.
            Trabajamos directamente sobre tu proyecto o ejercicio.</strong>
          </p>
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
          {BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#242A37]/[0.6] border border-[#ffffff]/[0.08]"
              >
              <span className="text-cyan-400 shrink-0">{b.icon}</span>
              <span className="text-white/80 text-sm">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mb-14">
            <h2 className="text-cyan-400 text-xl sm:text-2xl font-bold mb-2">Ejemplos de asesorías</h2>
            <p className="text-white/80 text-sm mb-7">Así son las sesiones — mira cómo trabajamos antes de agendar la tuya.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {videos.map((video) => {
                const embedUrl = getYouTubeEmbedUrl(video.video_url);
                return (
                  <div key={video.id} className="rounded-2xl overflow-hidden"
                    style={{ background: "rgba(14,30,54,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="relative aspect-video bg-black">
                      {embedUrl ? (
                        <iframe src={embedUrl} className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen style={{ border: "none" }} />
                      ) : (
                        <video className="w-full h-full" controls controlsList="nodownload noplaybackrate"
                          disablePictureInPicture preload="metadata" src={video.video_url} />
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold pointer-events-none"
                        style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee" }}>
                        Muestra
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-white font-semibold text-base">{video.title}</h3>
                        {video.duration && (
                          <span className="text-slate-500 text-xs shrink-0 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />{video.duration}
                          </span>
                        )}
                      </div>
                      {video.description && <p className="text-slate-400 text-sm leading-relaxed">{video.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-3xl p-8 sm:p-12 text-center bg-[#242A37]/[0.6] border border-[#ffffff]/[0.08]"
          >
          <Calendar className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl sm:text-3xl font-extrabold mb-3">¿Listo para tu asesoría?</h2>
          <p className="text-white/80 text-base max-w-lg mx-auto mb-8">
            Agenda una sesión personalizada y resuelve exactamente lo que necesitas con atención directa del instructor.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/message/XXXXXXXXXX" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #22d3ee, #6366f1)" }}>
              Agendar por WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/community_m"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
              Preguntar en la comunidad
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
