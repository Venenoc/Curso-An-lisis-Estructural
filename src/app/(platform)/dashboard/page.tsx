import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { coursesCatalog } from "@/data/courses-catalog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
  User,
  Mail,
  Shield,
  Settings,
  PlayCircle,
  Lock,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      payment_type,
      enrolled_at,
      course_id,
      courses(title, description, price, slug)
    `)
    .eq("user_id", profile?.id);

  // Fetch module enrollments
  const { data: moduleEnrollments } = await supabase
    .from("module_enrollments")
    .select("id, course_id, module_id, courses(title, description, price, slug)")
    .eq("user_id", profile?.id) as { data: any[] | null };

  const { data: progress } = await supabase
    .from("progress")
    .select("*, lessons(title, course_id)")
    .eq("user_id", profile?.id)
    .eq("completed", true);

  const completedLessons = progress?.length || 0;
  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0];

  // Build a set of completed lesson titles
  const completedByTitle = new Set(
    (progress || []).map((p: any) => p.lessons?.title).filter(Boolean)
  );

  // Group module enrollments by course_id
  const modulesByCourseId = new Map<string, number[]>();
  (moduleEnrollments || []).forEach((me: any) => {
    const list = modulesByCourseId.get(me.course_id) || [];
    list.push(me.module_id);
    modulesByCourseId.set(me.course_id, list);
  });

  // Set of course_ids that have full enrollment
  const fullEnrollmentCourseIds = new Set(
    (enrollments || []).map((e: any) => e.course_id)
  );

  // Build unified course list: full enrollments + module-only enrollments (no duplicates)
  type DashboardCourse = {
    id: string;
    courseTitle: string;
    courseDescription: string;
    catalog: (typeof coursesCatalog)[number] | undefined;
    hasFullCourse: boolean;
    purchasedModuleIds: number[];
    progress: number;
  };

  const dashboardCourses: DashboardCourse[] = [];

  // Add full course enrollments
  (enrollments || []).forEach((enrollment: any) => {
    const catalogMatch = coursesCatalog.find(
      (c) => c.title === enrollment.courses?.title
    );
    let courseProgress = 0;
    if (catalogMatch) {
      const allLessons = catalogMatch.modules?.flatMap((m) => m.lessons || []) || [];
      const totalLessons = allLessons.length;
      const completedCount = allLessons.filter((l) => completedByTitle.has(l.title)).length;
      courseProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    }
    dashboardCourses.push({
      id: enrollment.id,
      courseTitle: enrollment.courses?.title || "",
      courseDescription: enrollment.courses?.description || "",
      catalog: catalogMatch,
      hasFullCourse: true,
      purchasedModuleIds: catalogMatch?.modules?.map((m) => m.id) || [],
      progress: courseProgress,
    });
  });

  // Add module-only courses (not already in full enrollments)
  modulesByCourseId.forEach((moduleIds, courseId) => {
    if (fullEnrollmentCourseIds.has(courseId)) return;
    const sampleME = (moduleEnrollments || []).find((me: any) => me.course_id === courseId);
    const catalogMatch = coursesCatalog.find(
      (c) => c.title === sampleME?.courses?.title
    );

    // Check if all modules are purchased -> treat as full course
    const totalModules = catalogMatch?.modules?.length || 0;
    const allModulesPurchased = totalModules > 0 && moduleIds.length >= totalModules;

    let courseProgress = 0;
    if (catalogMatch) {
      const relevantModules = allModulesPurchased
        ? catalogMatch.modules || []
        : catalogMatch.modules?.filter((m) => moduleIds.includes(m.id)) || [];
      const allLessons = relevantModules.flatMap((m) => m.lessons || []);
      const totalLessons = allLessons.length;
      const completedCount = allLessons.filter((l) => completedByTitle.has(l.title)).length;
      courseProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    }
    dashboardCourses.push({
      id: `module-${courseId}`,
      courseTitle: sampleME?.courses?.title || "",
      courseDescription: sampleME?.courses?.description || "",
      catalog: catalogMatch,
      hasFullCourse: allModulesPurchased,
      purchasedModuleIds: allModulesPurchased
        ? catalogMatch?.modules?.map((m) => m.id) || moduleIds
        : moduleIds,
      progress: courseProgress,
    });
  });

  const enrolledCount = dashboardCourses.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/50">
                  <img
                    src={user.user_metadata?.avatar_url || "/images/Ingperfil.png"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    Hola, {firstName}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    Continúa tu aprendizaje en ingeniería estructural
                  </p>
                </div>
              </div>
            </div>
            <Link href="/cursos">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white h-11 px-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Explorar Cursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-2 mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <BookOpen className="w-6 h-6 text-cyan-400 mb-3" />
            <div className="text-3xl font-bold"><span className="text-slate-400">{enrolledCount}</span><span className="text-white"> / {coursesCatalog.length}</span></div>
            <div className="text-xs text-slate-400 mt-1">
              {enrolledCount === 1 ? "Curso inscrito" : "Cursos inscritos"}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <Trophy className="w-6 h-6 text-amber-400 mb-3" />
            {
              (() => {
                const totalLessonsEnrolled = dashboardCourses.reduce((acc: number, dc) => {
                  if (dc.catalog && dc.catalog.modules) {
                    const modules = dc.hasFullCourse
                      ? dc.catalog.modules
                      : dc.catalog.modules.filter((m) => dc.purchasedModuleIds.includes(m.id));
                    return acc + modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
                  }
                  return acc;
                }, 0);
                return (
                  <div className="text-3xl font-bold">
                    <span className="text-slate-400">{completedLessons}</span>
                    <span className="text-white"> / {totalLessonsEnrolled}</span>
                  </div>
                );
              })()
            }
            <div className="text-xs text-slate-400 mt-1">
              {completedLessons === 1 ? "Lección completada" : "Lecciones completadas"}
            </div>
          </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <GraduationCap className="w-6 h-6 text-green-400 mb-3" />
              {(() => {
                const certificados = 0;
                return (
                  <div className="text-3xl font-bold">
                    <span className="text-slate-400">{certificados}</span>
                    <span className="text-white"> / {dashboardCourses.length}</span>
                  </div>
                );
              })()}
              <div className="text-xs text-slate-400 mt-1">Certificados</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <Clock className="w-6 h-6 text-purple-400 mb-3" />
              {(() => {
                // Sumar la duración de las lecciones completadas de los cursos inscritos
                function parseMin(str: string) {
                  if (!str) return 0;
                  const h = /([0-9]+)\s*h/.exec(str);
                  const m = /([0-9]+)\s*min/.exec(str);
                  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
                }
                // Total minutos completados
                let minutosCompletados = 0;
                let minutosTotales = 0;
                dashboardCourses.forEach((dc) => {
                  if (dc.catalog) {
                    if (dc.catalog.duration) {
                      const match = dc.catalog.duration.match(/(\d+)\s*h/);
                      if (match) {
                        minutosTotales += parseInt(match[1], 10) * 60;
                      }
                    }
                    if (dc.catalog.modules) {
                      const modules = dc.hasFullCourse
                        ? dc.catalog.modules
                        : dc.catalog.modules.filter((m) => dc.purchasedModuleIds.includes(m.id));
                      modules.forEach((mod: any) => {
                        (mod.lessons || []).forEach((lesson: any) => {
                          const min = parseMin(lesson.duration);
                          if (completedByTitle.has(lesson.title)) {
                            minutosCompletados += min;
                          }
                        });
                      });
                    }
                  }
                });
                const horasCompletadas = Math.floor(minutosCompletados / 60);
                const minCompletados = minutosCompletados % 60;
                const horasTotales = Math.floor(minutosTotales / 60);
                const minTotales = minutosTotales % 60;
                const format = (h: number, m: number) => m > 0 ? `${h}h ${m}min` : `${h}h`;
                return (
                  <div className="text-3xl font-bold">
                    <span className="text-slate-400">{format(horasCompletadas, minCompletados)}</span>
                    <span className="text-white"> / {format(horasTotales, minTotales)}</span>
                  </div>
                );
              })()}
              <div className="text-xs text-slate-400 mt-1">Tiempo de estudio</div>
            </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main: Mis Cursos */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  Mis Cursos
                </h2>
                {enrolledCount > 0 && (
                  <Link
                    href="/cursos"
                    className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    Ver todos
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {dashboardCourses.length > 0 ? (
                <div className="space-y-6">
                  {dashboardCourses.map((dc) => {
                    const gradient = dc.catalog?.gradient || "from-cyan-500 to-blue-600";
                    const slug = dc.catalog?.slug;
                    const modules = dc.catalog?.modules || [];

                    return (
                      <div
                        key={dc.id}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
                      >
                        {/* Course Header */}
                        <div className={`bg-gradient-to-r ${gradient} px-5 py-4`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-bold text-lg">
                                {dc.courseTitle}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  dc.hasFullCourse
                                    ? "bg-white/20 text-white"
                                    : "bg-amber-500/20 text-amber-200"
                                }`}>
                                  {dc.hasFullCourse ? "Curso Completo" : `${dc.purchasedModuleIds.length} de ${modules.length} módulos`}
                                </span>
                                <span className="text-white/70 text-xs">
                                  {dc.progress}% completado
                                </span>
                              </div>
                            </div>
                            {slug && dc.hasFullCourse && (
                              <Link href={`/classroom/${slug}`}>
                                <Button
                                  size="sm"
                                  className="bg-white/20 hover:bg-white/30 text-white border-none"
                                >
                                  Continuar
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </div>
                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="w-full bg-white/20 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${dc.progress === 100 ? "bg-green-400" : "bg-white"}`}
                                style={{ width: `${dc.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Modules List */}
                        {modules.length > 0 && (
                          <div className="divide-y divide-slate-700/50">
                            {modules.map((mod) => {
                              const isUnlocked = dc.hasFullCourse || dc.purchasedModuleIds.includes(mod.id);
                              const moduleLessons = mod.lessons || [];
                              const completedInModule = moduleLessons.filter((l) => completedByTitle.has(l.title)).length;
                              const moduleProgress = moduleLessons.length > 0
                                ? Math.round((completedInModule / moduleLessons.length) * 100)
                                : 0;

                              return (
                                <div
                                  key={mod.id}
                                  className={`px-5 py-4 flex items-center gap-4 ${
                                    isUnlocked
                                      ? "hover:bg-slate-800/70 transition-colors"
                                      : "opacity-60"
                                  }`}
                                >
                                  {/* Icon */}
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    isUnlocked
                                      ? moduleProgress === 100
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-cyan-500/20 text-cyan-400"
                                      : "bg-slate-700/50 text-slate-500"
                                  }`}>
                                    {isUnlocked ? (
                                      moduleProgress === 100 ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                      ) : (
                                        <PlayCircle className="w-5 h-5" />
                                      )
                                    ) : (
                                      <Lock className="w-5 h-5" />
                                    )}
                                  </div>

                                  {/* Module Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-sm truncate ${
                                      isUnlocked ? "text-white" : "text-slate-500"
                                    }`}>
                                      {mod.title}
                                    </h4>
                                    <div className={`flex gap-3 mt-1 text-xs ${
                                      isUnlocked ? "text-slate-400" : "text-slate-600"
                                    }`}>
                                      <span className="flex items-center gap-1">
                                        <PlayCircle className="w-3 h-3" />
                                        {mod.lessonsCount} lecciones
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {mod.duration}
                                      </span>
                                      {isUnlocked && moduleLessons.length > 0 && (
                                        <span className={moduleProgress === 100 ? "text-green-400" : "text-cyan-400"}>
                                          {moduleProgress}%
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action */}
                                  <div className="shrink-0">
                                    {isUnlocked ? (
                                      slug ? (
                                        <Link href={`/classroom/${slug}`}>
                                          <Button
                                            size="sm"
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8 px-3"
                                          >
                                            Ir al Classroom
                                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                          </Button>
                                        </Link>
                                      ) : (
                                        <Button size="sm" className="bg-slate-700 text-slate-300 text-xs h-8" disabled>
                                          Próximamente
                                        </Button>
                                      )
                                    ) : (
                                      slug ? (
                                        <Link href={`/checkout/${slug}?module=${mod.id}`}>
                                          <Button
                                            size="sm"
                                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3"
                                          >
                                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                                            ${mod.price}
                                          </Button>
                                        </Link>
                                      ) : (
                                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                                          <Lock className="w-3.5 h-3.5" />
                                          Bloqueado
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-800/30 border border-slate-700/50 border-dashed rounded-xl p-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Aún no tienes cursos
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                    Explora nuestro catálogo y comienza tu camino en el análisis
                    estructural
                  </p>
                  <Link href="/cursos">
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Explorar Cursos
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Cursos recomendados */}
            {(() => {
              const enrolledSlugs = new Set(dashboardCourses.map((dc) => dc.catalog?.slug).filter(Boolean));
              const recommended = coursesCatalog.filter((c) => !enrolledSlugs.has(c.slug)).slice(0, 2);
              if (recommended.length === 0) return null;
              return (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Recomendados para ti
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recommended.map((course) => (
                      <Link
                        key={course.slug}
                        href={`/cursos/${course.slug}`}
                        className="block"
                      >
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/70 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group">
                          <div className={`h-24 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                            <h4 className="text-white font-bold text-center text-sm px-4 drop-shadow">
                              {course.title}
                            </h4>
                          </div>
                          <div className="p-4">
                            <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                              {course.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-white font-bold">
                                ${course.price}
                              </span>
                              <span className="text-cyan-400 text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                Ver curso
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 h-20 relative">
                <div className="absolute -bottom-8 left-5">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden">
                    <img
                      src={
                        user.user_metadata?.avatar_url || "/images/Ingperfil.png"
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-10 px-5 pb-5">
                <h3 className="text-white font-bold text-lg">
                  {profile?.full_name || "Usuario"}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {profile?.role === "instructor" ? "Instructor" : "Estudiante"}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300 truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">
                      {profile?.full_name || "Sin nombre"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300 capitalize">
                      {profile?.role || "student"}
                    </span>
                  </div>
                </div>

                <Link href="/settings" className="block mt-5">
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md"
                  >
                    <Settings className="w-4 h-4 mr-2 text-white" />
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Link href="/cursos" className="block">
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md"
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-white" />
                    Explorar Cursos
                  </Button>
                </Link>
                <Link href="/community" className="block">
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md"
                  >
                    <GraduationCap className="h-4 w-4 mr-2 text-white" />
                    Comunidad
                  </Button>
                </Link>
                <Link href="/tools" className="block">
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-white" />
                    Herramientas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
