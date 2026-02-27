import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { coursesCatalog } from "@/data/courses-catalog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Signal,
  CheckCircle2,
  Lock,
  Play,
  ShoppingCart,
  Award,
  ChevronLeft,
  Users,
} from "lucide-react";

function getLevelColor(level: string) {
  switch (level) {
    case "Principiante":
      // Color especial para resaltar en fondo blanco
      return "bg-orange-400/20 text-orange-600 border-orange-400/40";
    case "Intermedio":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Avanzado":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
}

function getFirstVideoUrl(course: (typeof coursesCatalog)[number]): string {
  if (!course.modules) return "";
  for (const mod of course.modules) {
    if (!mod.chapters) continue;
    for (const chapter of mod.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.videoUrl) return lesson.videoUrl;
      }
    }
  }
  return "";
}

export default async function CourseSyllabusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = coursesCatalog.find((c) => c.slug === slug);
  if (!course) notFound();

  const user = await getUser();
  let purchased = false;

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("courses(title)")
        .eq("user_id", profile.id);

      if (enrollments) {
        const purchasedTitles = enrollments
          .map((e: any) => e.courses?.title)
          .filter(Boolean);
        purchased = purchasedTitles.includes(course.title);
      }
    }
  }

  const introVideoUrl = getFirstVideoUrl(course);
  const buyLink = user
    ? `/checkout/${course.slug}`
    : `/login?redirectTo=/checkout/${course.slug}`;

  const totalLessons =
    course.modules?.reduce((acc, mod) => {
      const count =
        mod.chapters?.reduce((a, ch) => a + ch.lessons.length, 0) ??
        mod.lessonsCount;
      return acc + count;
    }, 0) ?? course.lessonsCount;

  const isFirstCourse =
    course.title ===
    "Conceptos Fundamentales en el Comportamiento y Diseño de Vigas";

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-slate-100 to-slate-200"
      style={{
        backgroundImage: 'url(/images/Fondo_cslugm.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Back link */}
      <div className="pt-24 pb-0 container mx-auto px-4 max-w-6xl">
        <Link
          href="/cursos_m"
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-cyan-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cursos
        </Link>
      </div>

      {/* Hero */}
      <section className="py-10 border-b border-slate-300/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mb-5 ${getLevelColor(course.level)}`}
            >
              <Signal className="w-3 h-3" />
              {course.level}
            </span>
            <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-5 leading-tight">
              {course.title}
            </h1>
            <p className="text-slate-700 text-lg mb-7 leading-relaxed max-w-2xl">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-5 text-sm text-slate-700">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-700" />
                {totalLessons} lecciones
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-700" />
                {course.duration}
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-700" />
                Certificado incluido
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-700" />
                Acceso de por vida
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left column: video + syllabus */}
            <div className="lg:col-span-2 space-y-10">
              {/* Intro video */}
              {introVideoUrl && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-cyan-400" />
                    Video de introducción
                  </h2>
                  <div className="rounded-2xl overflow-hidden bg-slate-800 shadow-xl shadow-black/40 aspect-video">
                    <video
                      src={introVideoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Syllabus */}
              {course.modules && course.modules.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-5">
                    Contenido del curso
                  </h2>
                  <div className="space-y-3">
                    {course.modules.map((mod, modIndex) => (
                      <details
                        key={mod.id}
                        className="group bg-slate-800/90 border border-slate-700/60 rounded-xl overflow-hidden"
                        open={modIndex === 0}
                      >
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-700/30 transition-colors list-none select-none">
                          <div className="flex items-center gap-4">
                            <div className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm font-bold flex items-center justify-center flex-shrink-0">
                              {`Módulo ${modIndex + 1}:`}
                            </div>
                            <div>
                              <div className="font-semibold text-white leading-snug">
                                {mod.title}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {mod.chapters?.reduce(
                                  (a, ch) => a + ch.lessons.length,
                                  0
                                ) ?? mod.lessonsCount}{" "}
                                lecciones · {mod.duration}
                              </div>
                            </div>
                          </div>
                          <span className="text-slate-500 text-xs transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-3">
                            ▼
                          </span>
                        </summary>

                        <div className="px-5 pb-5">
                          {mod.description && (
                            <p className="text-slate-400 text-sm mb-4 pl-13">
                              {mod.description}
                            </p>
                          )}
                          {mod.chapters?.map((chapter) => (
                            <div key={chapter.id} className="mt-4">
                              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 pl-2">
                                {chapter.title}
                              </div>
                              <div className="space-y-0.5">
                                {chapter.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-700/25 transition-colors"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-300 flex-1 leading-snug">
                                      {lesson.title}
                                    </span>
                                    <span className="text-xs text-slate-600 flex-shrink-0">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* What you'll learn — shown when no modules detail available */}
              {!course.modules && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">
                    Acerca de este curso
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {course.description}
                  </p>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {totalLessons} lecciones en video
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {course.duration} de contenido
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      Acceso de por vida
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      Certificado de finalización
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: price card (sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                  {/* Thumbnail */}
                  {isFirstCourse ? (
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: "url(/images/Fondocurso1.jpg)",
                      }}
                    />
                  ) : (
                    <div
                      className={`h-48 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}
                    >
                      <BookOpen className="w-14 h-14 text-white/30" />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Price */}
                    <div className="mb-5">
                      <span className="text-4xl font-bold text-white">
                        ${course.price}
                      </span>
                      <span className="text-slate-500 text-sm ml-2">USD</span>
                    </div>

                    {/* CTA */}
                    {purchased ? (
                      <Link href={`/cursos/${course.slug}`}>
                        <Button className="w-full bg-green-600 hover:bg-green-500 text-white h-12 text-base font-semibold">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Acceder al Curso
                        </Button>
                      </Link>
                    ) : (
                      <Link href={buyLink}>
                        <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-12 text-base font-semibold">
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Comprar Ahora
                        </Button>
                      </Link>
                    )}

                    {!user && (
                      <p className="mt-3 text-xs text-slate-500 text-center">
                        Al comprar se te pedirá{" "}
                        <Link
                          href="/login"
                          className="text-cyan-400 hover:underline"
                        >
                          iniciar sesión
                        </Link>
                      </p>
                    )}

                    {/* Features */}
                    <div className="mt-6 pt-5 border-t border-slate-700/50 space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Este curso incluye
                      </p>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <BookOpen className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        {totalLessons} lecciones en video
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <Clock className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        {course.duration} de contenido
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        Acceso de por vida
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <Award className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        Certificado de finalización
                      </div>
                    </div>

                    {/* Compra por módulos */}
                    {!purchased && course.modules && course.modules.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                          O compra solo un módulo
                        </p>
                        <div className="space-y-3">
                          {course.modules.map((mod, modIndex) => (
                            <div key={mod.id} className="bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 flex flex-col items-start">
                              <div>
                                <div className="font-semibold text-white text-sm">{mod.title}</div>
                                <div className="text-xs text-slate-400">{mod.lessonsCount} lecciones · {mod.duration}</div>
                              </div>
                              <span className="text-base font-bold text-cyan-400 mt-2">${mod.price}</span>
                              <Link
                                href={user
                                  ? `/checkout/${course.slug}?module=${mod.id}`
                                  : `/login?redirectTo=/checkout/${course.slug}%3Fmodule%3D${mod.id}`
                                }
                                className="w-full mt-2"
                              >
                                <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-9 px-4 font-semibold">
                                  {`Comprar módulo ${modIndex + 1}`}
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile buy button (shown below card on small screens, hidden on lg) */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-50">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <div>
            <div className="text-xl font-bold text-white">${course.price}</div>
            <div className="text-xs text-slate-500">USD</div>
          </div>
          {purchased ? (
            <Link href={`/cursos/${course.slug}`} className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-500 text-white h-11 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acceder al Curso
              </Button>
            </Link>
          ) : (
            <Link href={buyLink} className="flex-1">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-11 font-semibold">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar Ahora
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
