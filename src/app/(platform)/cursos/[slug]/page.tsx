"use server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import {
  BookOpen, Clock, Signal, ShoppingCart, CheckCircle2,
  PlayCircle, Lock, ChevronRight, ArrowLeft, Compass, Scale, Landmark, PenTool, FileText,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getYoutubeEmbedUrl } from "@/lib/utils";

function fmtMin(minutes: number | null): string {
  if (!minutes) return "";
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes} min`;
}

export default async function CursoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── Fetch course from Supabase ──────────────────────────────────────────────
  const { data: dbCourse } = await admin
    .from("courses")
    .select("id, slug, title, description, price, gradient, level, total_duration, total_lessons, image_url, presentation_video_url")
    .eq("slug", slug)
    .single();

  if (!dbCourse) notFound();

  // ── Fetch modules → chapters → lessons ──────────────────────────────────────
  const { data: rawModules } = await admin
    .from("modules")
    .select(`
      id, title, order, presentation_video_url, price,
      chapters(
        id, title, order,
        sessions(
          id, title, order,
          lessons(id, title, video_url, duration, order)
        ),
        lessons(id, title, video_url, duration, order)
      )
    `)
    .eq("course_id", dbCourse.id)
    .order("order");

  // ── Transform to page shape ─────────────────────────────────────────────────
  const modules = (rawModules || []).map((m: any) => {
    const sortedChapters = [...(m.chapters || [])].sort((a: any, b: any) => a.order - b.order);
    const chapters = sortedChapters.map((ch: any) => {
      const sessions = [...(ch.sessions || [])].sort((a: any, b: any) => a.order - b.order);
      const directLessons = [...(ch.lessons || [])].sort((a: any, b: any) => a.order - b.order);
      const rawLessons = sessions.length > 0
        ? sessions.flatMap((s: any) => [...(s.lessons || [])].sort((a: any, b: any) => a.order - b.order))
        : directLessons;
      return {
        id: ch.id as string,
        title: ch.title as string,
        lessons: rawLessons.map((l: any) => ({
          id: l.id as string,
          title: l.title as string,
          videoUrl: (l.video_url as string) || "",
          duration: fmtMin(l.duration),
          durationMinutes: (l.duration as number) || 0,
        })),
      };
    });

    const allLessons = chapters.flatMap((ch) => ch.lessons);
    const lessonCount = allLessons.length;
    const totalMins = allLessons.reduce((s, l) => s + l.durationMinutes, 0);
    const firstVideoUrl =
      (m.presentation_video_url as string) ||
      allLessons.find((l) => l.videoUrl)?.videoUrl ||
      "";

    return {
      id: (m.order as number) + 1, // catalog-style integer for module_enrollments
      dbId: m.id as string,
      title: m.title as string,
      price: Number(m.price) || 0,
      duration: fmtMin(totalMins),
      lessonsCount: lessonCount,
      chapters,
      firstVideoUrl,
    };
  });

  const course = {
    slug: dbCourse.slug as string,
    title: dbCourse.title as string,
    description: (dbCourse.description as string) || "",
    price: Number(dbCourse.price),
    gradient: (dbCourse.gradient as string) || "from-cyan-500 to-blue-600",
    level: (dbCourse.level as string) || "Principiante",
    lessonsCount:
      (dbCourse.total_lessons as number) ||
      modules.reduce((s, m) => s + m.lessonsCount, 0),
    duration: (dbCourse.total_duration as string) || "",
    image_url: (dbCourse.image_url as string) || null,
    presentation_video_url: (dbCourse.presentation_video_url as string) || null,
  };

  // ── Auth + enrollment ────────────────────────────────────────────────────────
  const user = await getUser();
  if (!user) redirect(`/login?redirectTo=/cursos/${slug}`);

  let isPurchased = false;
  let purchasedModuleIds: number[] = [];

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profile) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", profile.id)
      .eq("course_id", dbCourse.id);

    isPurchased = (enrollments?.length ?? 0) > 0;

    if (!isPurchased) {
      const { data: moduleEnrollments } = await supabase
        .from("module_enrollments")
        .select("module_id")
        .eq("user_id", profile.id)
        .eq("course_id", dbCourse.id);

      purchasedModuleIds = (moduleEnrollments || []).map((me: any) => Number(me.module_id));
      if (modules.length > 0 && purchasedModuleIds.length >= modules.length) {
        isPurchased = true;
      }
    }

    // ── Excepción de acceso gratuito ─────────────────────────────────────────
    if (!isPurchased) {
      const { data: exception } = await admin
        .from("course_exceptions")
        .select("id")
        .or(`auth_user_id.eq.${user.id},user_id.eq.${profile.id}`)
        .eq("course_slug", slug)
        .maybeSingle();

      if (exception) {
        isPurchased = true;
        purchasedModuleIds = modules.map((m) => m.id);
      }
    }
  }

  // ── Pricing ──────────────────────────────────────────────────────────────────
  // Remaining price = sum of prices of modules the user hasn't bought yet
  const remainingPrice = modules
    .filter((m) => !purchasedModuleIds.includes(m.id))
    .reduce((sum, m) => sum + m.price, 0);

  const courseVideoUrl =
    course.presentation_video_url ||
    modules.flatMap((m) => m.chapters.flatMap((ch) => ch.lessons)).find((l) => l.videoUrl)?.videoUrl ||
    "";
  const courseYoutubeEmbedUrl = getYoutubeEmbedUrl(courseVideoUrl);

  const moduleIcons = [Compass, Scale, Landmark, PenTool];
  const displayModules = modules.slice(0, 4);

  return (
    <div className="min-h-screen relative">
      {/* Fondo fijo superior */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          backgroundImage: `url('/images/FondoPlataforma/FondoPlatform_slugc.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      {/* ── Modules – Orbital Layout ──────────────────────────────────────────── */}
      {modules.length > 0 && (() => {
        return (
          <section className="relative overflow-hidden pt-20 pb-10 lg:pb-10">
            <div className={`absolute inset-0 opacity-10`} />
            <div className="container mx-auto px-4 relative z-10">

              {/* Back link */}
              <Link href="/cursos" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" />
                Volver a cursos
              </Link>

              {/* Course header */}
              <ScrollReveal delay={0.1} className="text-center mb-12">
              <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${course.gradient} text-white`}>
                    <Signal className="w-3 h-3" />
                    {course.level}
                  </span>
                </div>
                <div className="max-w-4xl mx-auto bg-slate-900/90 rounded-xl p-8 border border-white/20 shadow-lg">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{course.title}</h1>
                  <p className="text-lg text-slate-200 mb-6 leading-relaxed">{course.description}</p>
                  <div className="flex flex-wrap justify-center gap-6 text-slate-200">
                    <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-400" />{course.lessonsCount} lecciones</span>
                    <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400" />{course.duration}</span>
                    <span className="flex items-center gap-2"><PlayCircle className="w-5 h-5 text-cyan-400" />{modules.length} módulos</span>
                  </div>
                </div>
              </div>
              </ScrollReveal>

              <div className="relative max-w-6xl mx-auto">

                {/* ── Desktop orbital ── */}
                <div className="hidden lg:block relative" style={{ height: "860px" }}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 860">
                    <line x1="120" y1="170" x2="600" y2="430" stroke="#fff" strokeWidth="6" strokeDasharray="12 8" />
                    <line x1="1080" y1="170" x2="600" y2="430" stroke="#fff" strokeWidth="6" strokeDasharray="12 8" />
                    <line x1="120" y1="690" x2="600" y2="430" stroke="#fff" strokeWidth="6" strokeDasharray="12 8" />
                    <line x1="1080" y1="690" x2="600" y2="430" stroke="#fff" strokeWidth="6" strokeDasharray="12 8" />
                  </svg>

                  {/* Central card */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[480px]">
                    <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-1 shadow-2xl shadow-cyan-500/20`}>
                      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden">
                        {courseVideoUrl ? (
                          courseYoutubeEmbedUrl ? (
                            <iframe
                              src={courseYoutubeEmbedUrl}
                              className="w-full h-64 bg-black"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video className="w-full h-64 object-cover bg-black" controls preload="metadata">
                              <source src={courseVideoUrl} type="video/mp4" />
                            </video>
                          )
                        ) : (
                          <div className={`h-44 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                            <BookOpen className="w-14 h-14 text-white/70" />
                          </div>
                        )}
                        <div className="p-5 text-center">
                          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">{course.level}</p>
                          <h3 className="text-white font-bold text-lg leading-snug">{course.title}</h3>
                          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" />{course.lessonsCount} lecciones</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-700/50">
                            {isPurchased ? (
                              <Link href={`/classroom/${course.slug}`}>
                                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-10 text-sm">
                                  <PlayCircle className="w-4 h-4 mr-2" />Ir al Classroom
                                </Button>
                              </Link>
                            ) : (
                              <>
                                <div className="flex items-baseline justify-center gap-1 mb-3">
                                  {purchasedModuleIds.length > 0 ? (
                                    <>
                                      <span className="text-sm text-slate-500 line-through">S/. {course.price}</span>
                                      <span className="text-2xl font-bold text-white">S/. {remainingPrice.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    <span className="text-2xl font-bold text-white">S/. {course.price}</span>
                                  )}
                                </div>
                                <Link href={`/checkout/${course.slug}`}>
                                  <Button className={`w-full bg-gradient-to-r ${course.gradient} hover:opacity-90 text-white h-10 text-sm font-semibold`}>
                                    <ShoppingCart className="w-4 h-4 mr-2" />Comprar Curso Completo
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module orbital cards */}
                  {displayModules.map((module, index) => {
                    const ModuleIcon = moduleIcons[index];
                    const isModuleOwned = isPurchased || purchasedModuleIds.includes(module.id);
                    const moduleYoutubeEmbedUrl = getYoutubeEmbedUrl(module.firstVideoUrl);
                    const positions = ["left-[-7%] top-[3%]", "right-[-7%] top-[3%]", "left-[-7%] bottom-[3%]", "right-[-7%] bottom-[3%]"];
                    const rotations = ["-rotate-2", "rotate-2", "rotate-1", "-rotate-1"];
                    return (
                      <div key={module.dbId} className={`absolute ${positions[index]} z-20 w-[320px] group`}>
                        <div className={`${rotations[index]} hover:rotate-0 transition-all duration-500 ease-out`}>
                          <div className={`bg-slate-800/90 border rounded-xl overflow-hidden backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${isModuleOwned ? "border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/10" : "border-slate-700/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10"}`}>
                            <div className="relative overflow-hidden">
                              {module.firstVideoUrl ? (
                                moduleYoutubeEmbedUrl ? (
                                  <iframe
                                    src={moduleYoutubeEmbedUrl}
                                    className="w-full h-52 bg-black"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video className="w-full h-52 object-cover bg-black" controls preload="metadata">
                                    <source src={module.firstVideoUrl} type="video/mp4" />
                                  </video>
                                )
                              ) : (
                                <div className={`h-40 bg-gradient-to-br ${course.gradient} opacity-80 relative`}>
                                  <div className="absolute inset-0 bg-black/20" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <ModuleIcon className="w-12 h-12 text-white/70" />
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">
                                Módulo {String(index + 1).padStart(2, "0")}
                              </div>
                              <div className="absolute bottom-3 right-3 z-10">
                                {isModuleOwned ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-white/60" />}
                              </div>
                              {isModuleOwned && (
                                <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">Adquirido</div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">{module.title}</h4>
                              {module.chapters.length > 0 && (
                                <ul className="space-y-1 mb-3">
                                  {module.chapters.slice(0, 3).map((ch) => (
                                    <li key={ch.id} className="flex items-start gap-1.5 text-xs text-slate-400">
                                      <ChevronRight className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">{ch.title}</span>
                                    </li>
                                  ))}
                                  {module.chapters.length > 3 && <li className="text-xs text-slate-500 pl-4">+{module.chapters.length - 3} más</li>}
                                </ul>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex gap-3 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />{module.lessonsCount} lecciones</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                                </div>
                                {isModuleOwned ? (
                                  <Link href={`/classroom/${course.slug}?module=${module.id}`}>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 hover:text-green-300 cursor-pointer">
                                      <PlayCircle className="w-3 h-3" />Ir al Classroom
                                    </span>
                                  </Link>
                                ) : (
                                  <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer">
                                      <ShoppingCart className="w-3 h-3" />S/. {module.price}
                                    </span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="absolute left-[45%] top-[8%] w-2 h-2 rounded-full bg-cyan-500/30" />
                  <div className="absolute right-[30%] top-[15%] w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
                  <div className="absolute left-[35%] bottom-[12%] w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
                  <div className="absolute right-[42%] bottom-[8%] w-2 h-2 rounded-full bg-cyan-500/30" />
                </div>

                {/* ── Tablet layout ── */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
                  <div className="col-span-2 flex justify-center mb-4">
                    <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-1 shadow-2xl shadow-cyan-500/20 w-full max-w-2xl`}>
                      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden">
                        {courseVideoUrl ? (
                          courseYoutubeEmbedUrl ? (
                            <iframe
                              src={courseYoutubeEmbedUrl}
                              className="w-full h-64 bg-black"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video className="w-full h-64 object-cover bg-black" controls preload="metadata">
                              <source src={courseVideoUrl} type="video/mp4" />
                            </video>
                          )
                        ) : (
                          <div className={`h-40 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                            <BookOpen className="w-12 h-12 text-white/70" />
                          </div>
                        )}
                        <div className="p-5 text-center">
                          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">{course.level}</p>
                          <h3 className="text-white font-bold text-lg">{course.title}</h3>
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            {isPurchased ? (
                              <Link href={`/classroom/${course.slug}`}>
                                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-10 text-sm">
                                  <PlayCircle className="w-4 h-4 mr-2" />Ir al Classroom
                                </Button>
                              </Link>
                            ) : (
                              <>
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                  <span className="text-slate-500 text-xs">S/.</span>
                                  <span className="text-2xl font-bold text-white">{course.price}</span>
                                </div>
                                <Link href={`/checkout/${course.slug}`}>
                                  <Button className={`w-full bg-gradient-to-r ${course.gradient} hover:opacity-90 text-white h-10 text-sm font-semibold`}>
                                    <ShoppingCart className="w-4 h-4 mr-2" />Comprar Curso Completo
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {displayModules.map((module, index) => {
                    const ModuleIcon = moduleIcons[index];
                    const isModuleOwned = isPurchased || purchasedModuleIds.includes(module.id);
                    const moduleYoutubeEmbedUrl = getYoutubeEmbedUrl(module.firstVideoUrl);
                    return (
                      <ScrollReveal key={module.dbId} delay={Math.min(index * 0.1, 0.3)} scale>
                      <div className={`bg-slate-800/80 border rounded-xl overflow-hidden transition-all ${isModuleOwned ? "border-green-500/30 hover:border-green-500/50" : "border-slate-700/50 hover:border-cyan-500/30"}`}>
                        <div className="relative">
                          {module.firstVideoUrl ? (
                            moduleYoutubeEmbedUrl ? (
                              <iframe
                                src={moduleYoutubeEmbedUrl}
                                className="w-full h-52 bg-black"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video className="w-full h-52 object-cover bg-black" controls preload="metadata">
                                <source src={module.firstVideoUrl} type="video/mp4" />
                              </video>
                            )
                          ) : (
                            <div className={`h-40 bg-gradient-to-br ${course.gradient} opacity-80 relative`}>
                              <div className="absolute inset-0 bg-black/20" />
                              <div className="absolute inset-0 flex items-center justify-center"><ModuleIcon className="w-10 h-10 text-white/70" /></div>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">
                            Módulo {String(index + 1).padStart(2, "0")}
                          </div>
                          {isModuleOwned && (
                            <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">Adquirido</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{module.title}</h4>
                          {module.chapters.length > 0 && (
                            <ul className="space-y-1 mb-2">
                              {module.chapters.slice(0, 3).map((ch) => (
                                <li key={ch.id} className="flex items-start gap-1.5 text-xs text-slate-400">
                                  <ChevronRight className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{ch.title}</span>
                                </li>
                              ))}
                              {module.chapters.length > 3 && <li className="text-xs text-slate-500 pl-4">+{module.chapters.length - 3} más</li>}
                            </ul>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-3 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />{module.lessonsCount} lecciones</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                            </div>
                            {isModuleOwned ? (
                              <Link href={`/classroom/${course.slug}?module=${module.id}`}>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 hover:text-green-300">
                                  <PlayCircle className="w-3 h-3" />Ir al Classroom
                                </span>
                              </Link>
                            ) : (
                              <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300">
                                  <ShoppingCart className="w-3 h-3" />S/. {module.price}
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      </ScrollReveal>
                    );
                  })}
                </div>

                {/* ── Mobile layout ── */}
                <div className="md:hidden space-y-4">
                  <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-1 shadow-xl shadow-cyan-500/20`}>
                    <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden">
                      {courseVideoUrl ? (
                        courseYoutubeEmbedUrl ? (
                          <iframe
                            src={courseYoutubeEmbedUrl}
                            className="w-full h-56 bg-black"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video className="w-full h-56 object-cover bg-black" controls preload="metadata">
                            <source src={courseVideoUrl} type="video/mp4" />
                          </video>
                        )
                      ) : (
                        <div className={`h-36 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                          <BookOpen className="w-10 h-10 text-white/70" />
                        </div>
                      )}
                      <div className="p-4 text-center">
                        <p className="text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-1">{course.level}</p>
                        <h3 className="text-white font-bold text-base">{course.title}</h3>
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          {isPurchased ? (
                            <Link href={`/classroom/${course.slug}`}>
                              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-9 text-sm">
                                <PlayCircle className="w-4 h-4 mr-2" />Ir al Classroom
                              </Button>
                            </Link>
                          ) : (
                            <>
                              <div className="flex items-baseline justify-center gap-1 mb-2">
                                {purchasedModuleIds.length > 0 ? (
                                  <>
                                    <span className="text-xs text-slate-500 line-through">S/. {course.price}</span>
                                    <span className="text-xl font-bold text-white">{remainingPrice.toFixed(2)}</span>
                                  </>
                                ) : (
                                  <span className="text-xl font-bold text-white">{course.price}</span>
                                )}
                                <span className="text-slate-500 text-xs">S/.</span>
                              </div>
                              <Link href={`/checkout/${course.slug}`}>
                                <Button className={`w-full bg-gradient-to-r ${course.gradient} hover:opacity-90 text-white h-9 text-sm font-semibold`}>
                                  <ShoppingCart className="w-4 h-4 mr-2" />Comprar Curso Completo
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {displayModules.map((module, index) => {
                    const ModuleIcon = moduleIcons[index];
                    const isModuleOwned = isPurchased || purchasedModuleIds.includes(module.id);
                    const moduleYoutubeEmbedUrl = getYoutubeEmbedUrl(module.firstVideoUrl);
                    return (
                      <div key={module.dbId} className={`bg-slate-800/80 border rounded-xl overflow-hidden ${isModuleOwned ? "border-green-500/30" : "border-slate-700/50"}`}>
                        {module.firstVideoUrl ? (
                          <div className="relative">
                            {moduleYoutubeEmbedUrl ? (
                              <iframe
                                src={moduleYoutubeEmbedUrl}
                                className="w-full h-52 bg-black"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video className="w-full h-52 object-cover bg-black" controls preload="metadata">
                                <source src={module.firstVideoUrl} type="video/mp4" />
                              </video>
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white z-10">
                              Módulo {String(index + 1).padStart(2, "0")}
                            </div>
                            {isModuleOwned && (
                              <div className="absolute top-2 right-2 bg-green-500/80 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white z-10">Adquirido</div>
                            )}
                          </div>
                        ) : (
                          <div className="flex">
                            <div className={`w-24 shrink-0 bg-gradient-to-br ${course.gradient} opacity-80 relative flex items-center justify-center`}>
                              <ModuleIcon className="w-8 h-8 text-white/70" />
                              <div className="absolute top-2 left-2 bg-black/40 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">{String(index + 1).padStart(2, "0")}</div>
                              {isModuleOwned && <div className="absolute bottom-2 right-2"><CheckCircle2 className="w-4 h-4 text-green-400" /></div>}
                            </div>
                            <div className="p-3 flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold text-sm line-clamp-1">{module.title}</h4>
                                {isModuleOwned && <span className="text-[9px] font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full shrink-0">Adquirido</span>}
                              </div>
                              {module.chapters.length > 0 && (
                                <ul className="space-y-1 mb-2">
                                  {module.chapters.slice(0, 2).map((ch) => (
                                    <li key={ch.id} className="flex items-start gap-1 text-[10px] text-slate-400">
                                      <ChevronRight className="w-2.5 h-2.5 text-cyan-500 shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">{ch.title}</span>
                                    </li>
                                  ))}
                                  {module.chapters.length > 2 && <li className="text-[10px] text-slate-500 pl-3">+{module.chapters.length - 2} más</li>}
                                </ul>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex gap-3 text-[10px] text-slate-500">
                                  <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />{module.lessonsCount}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                                </div>
                                {isModuleOwned ? (
                                  <Link href={`/classroom/${course.slug}?module=${module.id}`}>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 hover:text-green-300"><PlayCircle className="w-3 h-3" />Classroom</span>
                                  </Link>
                                ) : (
                                  <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"><ShoppingCart className="w-3 h-3" />S/. {module.price}</span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {module.firstVideoUrl && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-semibold text-sm line-clamp-1">{module.title}</h4>
                              {isModuleOwned && <span className="text-[9px] font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full shrink-0">Adquirido</span>}
                            </div>
                            {module.chapters.length > 0 && (
                              <ul className="space-y-1 mb-2">
                                {module.chapters.slice(0, 2).map((ch) => (
                                  <li key={ch.id} className="flex items-start gap-1 text-[10px] text-slate-400">
                                    <ChevronRight className="w-2.5 h-2.5 text-cyan-500 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1">{ch.title}</span>
                                  </li>
                                ))}
                                {module.chapters.length > 2 && <li className="text-[10px] text-slate-500 pl-3">+{module.chapters.length - 2} más</li>}
                              </ul>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-3 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />{module.lessonsCount}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                              </div>
                              {isModuleOwned ? (
                                <Link href={`/classroom/${course.slug}?module=${module.id}`}>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 hover:text-green-300"><PlayCircle className="w-3 h-3" />Classroom</span>
                                </Link>
                              ) : (
                                <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"><ShoppingCart className="w-3 h-3" />S/. {module.price}</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── Syllabus ──────────────────────────────────────────────────────────── */}
      {modules.length > 0 && (
        <section className="py-16 lg:py-10 border-t border-slate-800/60">
          <div className="container mx-auto px-4">
            <ScrollReveal delay={0.05}>
            <div className="max-w-4xl mx-auto bg-slate-900/90 rounded-xl p-8 border border-white/20 shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-2 text-center">Syllabus</h2>
              <p className="text-slate-400 mb-10 text-center max-w-2xl mx-auto">{course.title}</p>
              <div className="space-y-3">
                {modules.map((module, moduleIndex) => (
                  <details key={module.dbId} className="group bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold bg-gradient-to-br ${course.gradient} text-white shadow-md`}>
                          {String(moduleIndex + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Módulo {moduleIndex + 1}</p>
                          <h3 className="text-white font-semibold text-sm leading-snug truncate">{module.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
                          <PlayCircle className="w-3.5 h-3.5" />{module.lessonsCount} lecciones
                        </span>
                        <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5" />{module.duration}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-300 group-open:rotate-90" />
                      </div>
                    </summary>
                    {module.chapters.map((chapter) => (
                      <div key={chapter.id} className="border-t border-slate-700/40">
                        <div className="flex items-center gap-2 px-5 py-3 bg-slate-900/50">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                          <p className="text-cyan-300/90 text-xs font-medium">{chapter.title}</p>
                        </div>
                        <ul>
                          {chapter.lessons.map((lesson, li) => (
                            <li key={lesson.id} className="flex items-center justify-between px-5 py-2.5 border-t border-slate-700/20 hover:bg-slate-700/10 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] text-slate-600 shrink-0 w-5 text-right tabular-nums">{li + 1}</span>
                                <span className="text-slate-300 text-xs truncate">{lesson.title}</span>
                              </div>
                              <span className="text-[11px] text-slate-500 shrink-0 ml-4 tabular-nums">{lesson.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </details>
                ))}
              </div>

              {/* Botón temario PDF */}
              <div className="mt-6 flex justify-center">
                <a
                  href={`/images/Temariodecursos/Curso1tema.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-cyan-500/40 bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition-colors"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  Ver temario completo (PDF)
                </a>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-10 border-t border-slate-800/90">
        <div className="container mx-auto px-4">
          <ScrollReveal delay={0.05}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-2 text-center">Lo que dicen nuestros estudiantes</h2>
              <p className="text-white mb-10 text-center">Opiniones reales de quienes ya completaron el curso</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { name: "Carlos M.", role: "Ingeniero Civil", text: "El curso superó todas mis expectativas. La forma en que explican los conceptos es clara y directa. En pocas semanas logré aplicarlos en mis proyectos reales.", stars: 5 },
                  { name: "Andrea P.", role: "Estudiante de Ing. Civil", text: "Excelente material didáctico. Los ejercicios propuestos son muy similares a los que se encuentran en la práctica profesional. Totalmente recomendado.", stars: 5 },
                  { name: "Luis F.", role: "Proyectista Estructural", text: "Llevaba años buscando un curso que explicara bien el análisis estructural. Este lo hace de forma magistral y con mucha profundidad práctica.", stars: 5 },
                  { name: "María G.", role: "Docente universitaria", text: "Lo utilizo como material de apoyo en mis clases. La secuencia pedagógica es impecable y los ejemplos están muy bien seleccionados.", stars: 5 },
                  { name: "Roberto S.", role: "Ingeniero Estructural", text: "La calidad del contenido es sobresaliente. Se nota el dominio del tema. Completamente recomendado para cualquier nivel de experiencia.", stars: 5 },
                  { name: "Jorge T.", role: "Consultor en estructuras", text: "Uno de los mejores cursos que he tomado en línea. El ritmo es ideal y las explicaciones son muy precisas. Ya lo recomendé a varios colegas.", stars: 5 },
                ].map((t, i) => (
                  <ScrollReveal key={i} delay={Math.min(0.08 + i * 0.07, 0.4)}>
                    <div className="bg-slate-900/90 border border-slate-700/50 rounded-xl p-5 flex flex-col h-full">
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: t.stars }).map((_, j) => (
                          <svg key={j} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-4">&ldquo;{t.text}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {t.name[0]}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{t.name}</p>
                          <p className="text-slate-500 text-xs">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Purchase Section ──────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-10">
        <div className="container mx-auto px-4">
          <ScrollReveal delay={0.1}>
          <div className="max-w-4xl mx-auto bg-slate-900/90 rounded-xl p-8 border border-white/20 shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Obtén el curso completo</h2>
            <p className="text-slate-400 mb-10 text-center">Accede a todos los módulos con un solo pago y ahorra</p>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className={`h-44 bg-gradient-to-br ${course.gradient} rounded-xl flex items-center justify-center`}>
                  <BookOpen className="w-14 h-14 text-white/80" />
                </div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${course.gradient} text-white`}>
                      <Signal className="w-3 h-3" />{course.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{course.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-5 text-sm text-slate-300">
                    <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-cyan-400" />{course.lessonsCount} lecciones</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" />{course.duration}</span>
                    <span className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-cyan-400" />{modules.length} módulos</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <div className="mb-6 text-center">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Curso completo</p>
                  <div className="flex items-baseline justify-center gap-2">
                    {purchasedModuleIds.length > 0 ? (
                      <>
                        <span className="text-lg text-slate-500 line-through">S/. {course.price}</span>
                        <span className="text-4xl font-bold text-white">{remainingPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-white">{course.price}</span>
                    )}
                    <span className="text-slate-500">S/.</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">Pago único · acceso de por vida</p>
                  {modules.length > 0 && (
                    <p className="text-cyan-400/70 text-xs mt-2">
                      Ahorra vs comprar módulos por separado (S/. {modules.reduce((sum, m) => sum + m.price, 0).toFixed(2)})
                    </p>
                  )}
                </div>

                {isPurchased ? (
                  <div className="space-y-3">
                    <Link href={`/classroom/${course.slug}`} className="block">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                        <PlayCircle className="w-5 h-5 mr-2" />Ir al Classroom
                      </Button>
                    </Link>
                    <Link href="/dashboard" className="block">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                        <span className="flex items-center gap-2 justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" />
                          </svg>
                          Ir al Dashboard
                        </span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href={`/checkout/${course.slug}`} className="block">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                        <ShoppingCart className="w-5 h-5 mr-2" />Comprar curso completo
                      </Button>
                    </Link>
                    {purchasedModuleIds.length > 0 && (
                      <p className="text-center text-xs text-green-400">
                        Ya tienes {purchasedModuleIds.length} de {modules.length} módulos adquiridos
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                  {["Acceso inmediato a todos los módulos", "Certificado de finalización", "Actualizaciones gratuitas", "Soporte del instructor"].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      {!isPurchased && purchasedModuleIds.length === 0 && (
        <section className="py-10 ">
          <div className="container mx-auto px-4">
            <ScrollReveal delay={0.1}>
          <div className={`max-w-3xl mx-auto text-center bg-gradient-to-r ${course.gradient} rounded-2xl p-10`}>
              <h2 className="text-3xl font-bold text-white mb-4">Comienza a aprender hoy</h2>
              <p className="text-white/80 mb-6">
                Accede a las {course.lessonsCount} lecciones y domina {course.title.toLowerCase()}
              </p>
              <Link href={`/checkout/${course.slug}`}>
                <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 text-base font-semibold">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Comprar por S/. {purchasedModuleIds.length > 0 ? remainingPrice.toFixed(2) : course.price}
                </Button>
              </Link>
            </div>
          </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  );
}
