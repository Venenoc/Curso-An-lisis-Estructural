import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getUserCertificates, checkAndIssueCertificate } from "@/app/actions/certificates";
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
  Award,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── Profile ───────────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // ── Fetch enrollments, module-enrollments, progress, published courses and exceptions in parallel ──
  const [enrollmentsRes, moduleEnrollmentsRes, progressRes, publishedCoursesRes, exceptionsRes] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, payment_type, enrolled_at, course_id, courses(id, title, description, price, slug, gradient)")
      .eq("user_id", profile?.id),
    supabaseAdmin
      .from("module_enrollments")
      .select("id, course_id, module_id, courses(id, title, description, price, slug, gradient)")
      .eq("user_id", profile?.id),
    supabaseAdmin
      .from("progress")
      .select("lesson_id")
      .eq("user_id", profile?.id)
      .eq("completed", true),
    supabaseAdmin
      .from("courses")
      .select("id, slug, title, description, price, gradient", { count: "exact" })
      .eq("status", "published")
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("course_exceptions")
      .select("id, course_slug")
      .or(profile?.id
        ? `auth_user_id.eq.${user.id},user_id.eq.${profile.id}`
        : `auth_user_id.eq.${user.id}`),
  ]);

  const allPublishedCourses = (publishedCoursesRes.data || []) as Array<{ id: string; slug: string; title: string; description: string; price: number; gradient: string }>;
  const totalPublishedCourses = publishedCoursesRes.count ?? allPublishedCourses.length;

  const enrollments = enrollmentsRes.data;
  const moduleEnrollments = moduleEnrollmentsRes.data as any[] | null;
  const exceptionSlugs = ((exceptionsRes as any).data || []).map((e: any) => e.course_slug as string);
  const progressRows = progressRes.data;

  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0];
  const completedLessonIds = new Set((progressRows || []).map((p: any) => p.lesson_id as string));
  const totalCompletedLessons = completedLessonIds.size;

  // Group module enrollments by course_id → list of integer module positions
  const modulesByCourseId = new Map<string, number[]>();
  (moduleEnrollments || []).forEach((me: any) => {
    const list = modulesByCourseId.get(me.course_id) || [];
    list.push(Number(me.module_id));
    modulesByCourseId.set(me.course_id, list);
  });

  const fullEnrollmentCourseIds = new Set((enrollments || []).map((e: any) => e.course_id as string));

  // Fetch exception courses by slug directly (no status filter — classroom also skips it)
  const { data: exceptionCoursesRaw } = exceptionSlugs.length
    ? await supabaseAdmin
        .from("courses")
        .select("id, slug, title, description, price, gradient")
        .in("slug", exceptionSlugs)
    : { data: [] as any[] };

  const exceptionCourses = (exceptionCoursesRaw || []) as Array<{ id: string; slug: string; title: string; description: string; price: number; gradient: string }>;

  // Exception course IDs resolved directly (not gated by published status)
  const exceptionCourseIds = exceptionCourses.map((c) => c.id);

  const allEnrolledCourseIds = [
    ...new Set([
      ...(enrollments || []).map((e: any) => e.course_id as string),
      ...(moduleEnrollments || []).map((me: any) => me.course_id as string),
      ...exceptionCourseIds,
    ]),
  ].filter(Boolean);

  // ── Fetch Supabase modules for all enrolled courses ───────────────────────────
  const { data: dbModulesRaw } = allEnrolledCourseIds.length
    ? await supabaseAdmin
        .from("modules")
        .select("id, course_id, title, order, price")
        .in("course_id", allEnrolledCourseIds)
        .order("order")
    : { data: [] as any[] };

  const dbModuleIds = (dbModulesRaw || []).map((m: any) => m.id as string);

  // ── Fetch chapters for those modules ─────────────────────────────────────────
  const { data: dbChaptersRaw } = dbModuleIds.length
    ? await supabaseAdmin
        .from("chapters")
        .select("id, module_id")
        .in("module_id", dbModuleIds)
    : { data: [] as any[] };

  const dbChapterIds = (dbChaptersRaw || []).map((ch: any) => ch.id as string);
  const chapterToModule = new Map<string, string>();
  (dbChaptersRaw || []).forEach((ch: any) =>
    chapterToModule.set(ch.id as string, ch.module_id as string)
  );

  // ── Fetch lessons for those chapters ─────────────────────────────────────────
  const { data: dbLessonsRaw } = dbChapterIds.length
    ? await supabaseAdmin
        .from("lessons")
        .select("id, chapter_uuid, course_id, duration")
        .in("chapter_uuid", dbChapterIds)
    : { data: [] as any[] };

  // Build lookup maps: lesson UUID → module UUID, course UUID, duration (minutes)
  const lessonModule = new Map<string, string>();
  const lessonCourse = new Map<string, string>();
  const lessonDurationMin = new Map<string, number>();
  (dbLessonsRaw || []).forEach((l: any) => {
    const lid = l.id as string;
    const mId = l.chapter_uuid ? chapterToModule.get(l.chapter_uuid as string) : undefined;
    if (mId) lessonModule.set(lid, mId);
    if (l.course_id) lessonCourse.set(lid, l.course_id as string);
    if (l.duration) lessonDurationMin.set(lid, Number(l.duration));
  });

  // ── Count totals and completed per module / per course ────────────────────────
  const totalByModule = new Map<string, number>();
  const completedByModule = new Map<string, number>();
  const totalByCourse = new Map<string, number>();
  const completedByCourse = new Map<string, number>();
  const totalMinByModule = new Map<string, number>();
  const completedMinByModule = new Map<string, number>();

  (dbLessonsRaw || []).forEach((l: any) => {
    const lid = l.id as string;
    const mId = lessonModule.get(lid);
    const cId = lessonCourse.get(lid);
    const dur = lessonDurationMin.get(lid) || 0;

    if (mId) totalByModule.set(mId, (totalByModule.get(mId) || 0) + 1);
    if (cId) totalByCourse.set(cId, (totalByCourse.get(cId) || 0) + 1);
    if (mId) totalMinByModule.set(mId, (totalMinByModule.get(mId) || 0) + dur);

    if (completedLessonIds.has(lid)) {
      if (mId) completedByModule.set(mId, (completedByModule.get(mId) || 0) + 1);
      if (cId) completedByCourse.set(cId, (completedByCourse.get(cId) || 0) + 1);
      if (mId) completedMinByModule.set(mId, (completedMinByModule.get(mId) || 0) + dur);
    }
  });

  // Group Supabase modules by course_id
  const dbModulesByCourse = new Map<string, any[]>();
  (dbModulesRaw || []).forEach((m: any) => {
    if (!dbModulesByCourse.has(m.course_id)) dbModulesByCourse.set(m.course_id, []);
    dbModulesByCourse.get(m.course_id)!.push(m);
  });

  // ── Build unified dashboard course list ───────────────────────────────────────
  type DashboardCourse = {
    id: string;
    courseId: string;
    /** Slug from Supabase — used for ALL navigation links */
    dbSlug: string;
    courseTitle: string;
    courseDescription: string;
    gradient: string;
    hasFullCourse: boolean;
    /** Integer module positions (order + 1) that are purchased */
    purchasedModuleIds: number[];
    /** Module rows from Supabase */
    dbModules: any[];
    progress: number;
  };

  const dashboardCourses: DashboardCourse[] = [];

  // Full course enrollments
  (enrollments || []).forEach((enrollment: any) => {
    const courseId = enrollment.course_id as string;
    const dbSlug = (enrollment.courses?.slug as string) || "";
    const gradient =
      (enrollment.courses?.gradient as string) ||
      "from-cyan-500 to-blue-600";

    const dbMods = dbModulesByCourse.get(courseId) || [];
    const total = totalByCourse.get(courseId) || 0;
    const completed = completedByCourse.get(courseId) || 0;
    const courseProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    dashboardCourses.push({
      id: enrollment.id as string,
      courseId,
      dbSlug,
      courseTitle: (enrollment.courses?.title as string) || "",
      courseDescription: (enrollment.courses?.description as string) || "",
      gradient,
      hasFullCourse: true,
      purchasedModuleIds: dbMods.map((m: any) => (m.order as number) + 1),
      dbModules: dbMods,
      progress: courseProgress,
    });
  });

  // Module-only enrollments (not already in full enrollments)
  modulesByCourseId.forEach((purchasedModulePos, courseId) => {
    if (fullEnrollmentCourseIds.has(courseId)) return;
    const sampleME = (moduleEnrollments || []).find((me: any) => me.course_id === courseId);
    const dbSlug = (sampleME?.courses?.slug as string) || "";
    const gradient =
      (sampleME?.courses?.gradient as string) ||
      "from-cyan-500 to-blue-600";

    const dbMods = dbModulesByCourse.get(courseId) || [];
    const allModulesPurchased = dbMods.length > 0 && purchasedModulePos.length >= dbMods.length;

    // Progress = only over purchased modules
    let total = 0;
    let completed = 0;
    dbMods.forEach((m: any) => {
      const mPos = (m.order as number) + 1;
      if (!allModulesPurchased && !purchasedModulePos.includes(mPos)) return;
      total += totalByModule.get(m.id as string) || 0;
      completed += completedByModule.get(m.id as string) || 0;
    });
    const courseProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    dashboardCourses.push({
      id: `module-${courseId}`,
      courseId,
      dbSlug,
      courseTitle: (sampleME?.courses?.title as string) || "",
      courseDescription: (sampleME?.courses?.description as string) || "",
      gradient,
      hasFullCourse: allModulesPurchased,
      purchasedModuleIds: allModulesPurchased
        ? dbMods.map((m: any) => (m.order as number) + 1)
        : purchasedModulePos,
      dbModules: dbMods,
      progress: courseProgress,
    });
  });

  // Exception enrollments: upgrade existing entry to full access, or add new entry
  exceptionCourseIds.forEach((courseId) => {
    const existing = dashboardCourses.find((dc) => dc.courseId === courseId);
    const dbMods = dbModulesByCourse.get(courseId) || [];
    const allModulePos = dbMods.map((m: any) => (m.order as number) + 1);
    if (existing) {
      // Upgrade to full access — unlock all modules
      existing.hasFullCourse = true;
      existing.purchasedModuleIds = allModulePos;
    } else {
      const courseData = exceptionCourses.find((c) => c.id === courseId);
      if (!courseData) return;
      const total = totalByCourse.get(courseId) || 0;
      const completed = completedByCourse.get(courseId) || 0;
      const courseProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
      dashboardCourses.push({
        id: `exception-${courseId}`,
        courseId,
        dbSlug: courseData.slug,
        courseTitle: courseData.title,
        courseDescription: courseData.description,
        gradient: courseData.gradient || "from-cyan-500 to-blue-600",
        hasFullCourse: true,
        purchasedModuleIds: allModulePos,
        dbModules: dbMods,
        progress: courseProgress,
      });
    }
  });

  const enrolledCount = dashboardCourses.length;

  // ── Recommended courses: published courses not yet enrolled ──────────────────
  const enrolledSlugSet = new Set(dashboardCourses.map((dc) => dc.dbSlug).filter(Boolean));
  const recommendedCourses = allPublishedCourses.filter((c) => !enrolledSlugSet.has(c.slug)).slice(0, 2);

  // ── Auto-issue certificates for completed courses ─────────────────────────────
  const completedCourseSlugs = dashboardCourses
    .filter((dc) => dc.progress === 100 && dc.dbSlug)
    .map((dc) => dc.dbSlug);

  await Promise.all(completedCourseSlugs.map((slug) => checkAndIssueCertificate(slug)));

  const certificates = await getUserCertificates();

  // ── Stats helpers ─────────────────────────────────────────────────────────────
  const totalEnrolledLessons = dashboardCourses.reduce((acc, dc) => {
    dc.dbModules.forEach((m: any) => {
      const mPos = (m.order as number) + 1;
      if (!dc.hasFullCourse && !dc.purchasedModuleIds.includes(mPos)) return;
      acc += totalByModule.get(m.id as string) || 0;
    });
    return acc;
  }, 0);

  const totalCompletedMinutes = dashboardCourses.reduce((acc, dc) => {
    dc.dbModules.forEach((m: any) => {
      const mPos = (m.order as number) + 1;
      if (!dc.hasFullCourse && !dc.purchasedModuleIds.includes(mPos)) return;
      acc += completedMinByModule.get(m.id as string) || 0;
    });
    return acc;
  }, 0);

  const totalEnrolledMinutes = dashboardCourses.reduce((acc, dc) => {
    dc.dbModules.forEach((m: any) => {
      const mPos = (m.order as number) + 1;
      if (!dc.hasFullCourse && !dc.purchasedModuleIds.includes(mPos)) return;
      acc += totalMinByModule.get(m.id as string) || 0;
    });
    return acc;
  }, 0);

  const fmtTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0 && m === 0) return "0h";
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-6 sm:py-12 lg:py-16 relative z-10">
          <ScrollReveal delay={0.05}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-cyan-500/50 shrink-0">
                  <img
                    src={user.user_metadata?.avatar_url || `${process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL}/images/Ingperfil.png`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">
                    Hola, {firstName}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Continúa tu aprendizaje en ingeniería estructural
                  </p>
                </div>
              </div>
            </div>
            <Link href="/cursos">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white h-9 sm:h-11 px-4 sm:px-6 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Explorar Cursos
              </Button>
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-2 mb-6 sm:mb-10">
        <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
          <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-2 sm:p-5">
            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400 mb-1 sm:mb-3" />
            <div className="text-sm sm:text-3xl font-bold">
              <span className="text-slate-400">{enrolledCount}</span>
              <span className="text-white">/{totalPublishedCourses}</span>
            </div>
            <div className="text-[9px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 leading-tight">
              {enrolledCount === 1 ? "Curso" : "Cursos"}
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-2 sm:p-5">
            <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 mb-1 sm:mb-3" />
            <div className="text-sm sm:text-3xl font-bold">
              <span className="text-slate-400">{totalCompletedLessons}</span>
              <span className="text-white">/{totalEnrolledLessons}</span>
            </div>
            <div className="text-[9px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 leading-tight">
              Lecciones
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-2 sm:p-5">
            <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-green-400 mb-1 sm:mb-3" />
            <div className="text-sm sm:text-3xl font-bold">
              <span className="text-slate-400">{certificates.length}</span>
              <span className="text-white">/{dashboardCourses.length}</span>
            </div>
            <div className="text-[9px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 leading-tight">Certificados</div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-2 sm:p-5">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400 mb-1 sm:mb-3" />
            <div className="text-[11px] sm:text-3xl font-bold leading-tight">
              <span className="text-slate-400">{fmtTime(totalCompletedMinutes)}</span>
              <span className="text-white hidden sm:inline"> / {fmtTime(totalEnrolledMinutes)}</span>
            </div>
            <div className="text-[9px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 leading-tight">Tiempo</div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      <div className="container mx-auto px-3 sm:px-4 pb-10 sm:pb-16">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main: Mis Cursos */}
          <ScrollReveal delay={0.05} className="lg:col-span-2 min-w-0">
          <div className="space-y-8 min-w-0">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  Mis Cursos
                </h2>
                {enrolledCount > 0 && (
                  <div className="bg-white/80 border border-slate-800 rounded px-3 py-1 flex items-center">
                    <Link
                      href="/cursos"
                      className="text-slate-800 hover:text-amber-500 text-sm flex items-center gap-1 transition-colors"
                    >
                      Ver todos
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {dashboardCourses.length > 0 ? (
                <div className="space-y-6">
                  {dashboardCourses.map((dc) => {
                    const { dbSlug, dbModules } = dc;

                    return (
                      <div
                        key={dc.id}
                        className="bg-slate-800/90 border border-slate-700/50 rounded-xl overflow-hidden"
                      >
                        {/* Course Header */}
                        <div className={`bg-gradient-to-r ${dc.gradient} px-3 sm:px-5 py-3 sm:py-4`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <div>
                              <h3 className="text-white font-bold text-sm sm:text-lg">
                                {dc.courseTitle}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  dc.hasFullCourse
                                    ? "bg-white/20 text-white"
                                    : "bg-amber-500/20 text-amber-200"
                                }`}>
                                  {dc.hasFullCourse
                                    ? "Curso Completo"
                                    : `${dc.purchasedModuleIds.length} de ${dbModules.length} módulos`}
                                </span>
                                <span className="text-white/70 text-xs">
                                  {dc.progress}% completado
                                </span>
                              </div>
                            </div>
                            {dbSlug && dc.hasFullCourse && (
                              <Link href={`/classroom/${dbSlug}`}>
                                <Button
                                  size="sm"
                                  className="bg-white/20 hover:bg-white/30 text-white border-none text-xs sm:text-sm h-8"
                                >
                                  Continuar
                                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
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
                        {dbModules.length > 0 && (
                          <div className="divide-y divide-slate-700/50">
                            {dbModules.map((mod: any) => {
                              // mod.order is 0-based; module position is order + 1
                              const modPos = (mod.order as number) + 1;
                              const isUnlocked = dc.hasFullCourse || dc.purchasedModuleIds.includes(modPos);
                              const modId = mod.id as string;
                              const totalInMod = totalByModule.get(modId) || 0;
                              const completedInMod = completedByModule.get(modId) || 0;
                              const moduleProgress = totalInMod > 0
                                ? Math.round((completedInMod / totalInMod) * 100)
                                : 0;
                              const modDurMin = totalMinByModule.get(modId) || 0;
                              const modDurLabel = modDurMin >= 60
                                ? `${(modDurMin / 60).toFixed(1)}h`
                                : modDurMin > 0
                                ? `${modDurMin} min`
                                : "";

                              return (
                                <div
                                  key={modId}
                                  className={`px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 ${
                                    isUnlocked
                                      ? "hover:bg-slate-800/70 transition-colors"
                                      : "opacity-60"
                                  }`}
                                >
                                  {/* Icon */}
                                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    isUnlocked
                                      ? moduleProgress === 100
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-cyan-500/20 text-cyan-400"
                                      : "bg-slate-700/50 text-slate-500"
                                  }`}>
                                    {isUnlocked ? (
                                      moduleProgress === 100 ? (
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                      ) : (
                                        <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                      )
                                    ) : (
                                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                        {totalInMod} lecciones
                                      </span>
                                      {modDurLabel && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {modDurLabel}
                                        </span>
                                      )}
                                      {isUnlocked && totalInMod > 0 && (
                                        <span className={moduleProgress === 100 ? "text-green-400" : "text-cyan-400"}>
                                          {moduleProgress}%
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action */}
                                  <div className="shrink-0">
                                    {isUnlocked ? (
                                      dbSlug ? (
                                        <Link href={`/classroom/${dbSlug}?module=${modPos}`}>
                                          <Button
                                            size="sm"
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                                          >
                                            <span className="hidden sm:inline">Ir al Classroom</span>
                                            <span className="sm:hidden">Entrar</span>
                                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
                                          </Button>
                                        </Link>
                                      ) : (
                                        <Button size="sm" className="bg-slate-700 text-slate-300 text-xs h-8" disabled>
                                          Próximamente
                                        </Button>
                                      )
                                    ) : (
                                      dbSlug ? (
                                        <Link href={`/checkout/${dbSlug}?module=${modPos}`}>
                                          <Button
                                            size="sm"
                                            className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                                          >
                                            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
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
                <div className="bg-slate-800/80 border border-slate-700/50 border-dashed rounded-xl p-6 sm:p-12 text-center">
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

            {/* Mis Certificados */}
            {certificates.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Mis Certificados
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <Link
                      key={cert.id}
                      href={`/certificados/${cert.id}`}
                      className="block"
                    >
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 rounded-xl p-5 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all group">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm line-clamp-2 mb-1">
                              {cert.course_title}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {new Date(cert.issued_at).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cursos recomendados — publicados en Supabase y no inscritos */}
            {recommendedCourses.length > 0 && (
              <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Recomendados para ti
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recommendedCourses.map((course) => (
                      <Link
                        key={course.slug}
                        href={`/cursos/${course.slug}`}
                        className="block"
                      >
                        <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/70 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group">
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
            )}
          </div>
          </ScrollReveal>

          {/* Sidebar */}
          <ScrollReveal delay={0.15} className="space-y-6">
            {/* Profile Card */}
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 h-20 relative">
                <div className="absolute -bottom-8 left-5">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden">
                    <img
                      src={user.user_metadata?.avatar_url || `${process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL}/images/Ingperfil.png`}
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

                <div className="flex gap-2 mt-5">
                  <Link href="/profile" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md text-xs sm:text-sm">
                      <Settings className="w-4 h-4 mr-1.5 text-white" />
                      Editar Perfil
                    </Button>
                  </Link>
                  {profile?.role === "instructor" && (
                    <Link href="/admin" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-400 text-white font-semibold hover:from-purple-700 hover:to-pink-700 border-none shadow-md text-xs sm:text-sm">
                        Panel Admin
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Link href="/cursos" className="block">
                  <Button className="w-full justify-start bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md">
                    <BookOpen className="h-4 w-4 mr-2 text-white" />
                    Explorar Cursos
                  </Button>
                </Link>
                <Link href="/community" className="block">
                  <Button className="w-full justify-start bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md">
                    <GraduationCap className="h-4 w-4 mr-2 text-white" />
                    Comunidad
                  </Button>
                </Link>
                <Link href="/tools" className="block">
                  <Button className="w-full justify-start bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-400 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 border-none shadow-md">
                    <Sparkles className="h-4 w-4 mr-2 text-white" />
                    Herramientas
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
