import { notFound, redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import ClassroomView from "@/components/classroom/ClassroomView";
import { getQuizzesForCourse } from "@/app/actions/quizzes";
import type { QuizWithQuestions } from "@/app/actions/quizzes";
import { getFaqsByLessonIds } from "@/app/actions/courses";
import type { LessonFaq } from "@/app/actions/courses";
import type { CatalogCourse, CourseLesson, CourseChapter, CourseModule, CourseSession } from "@/data/courses-catalog";

function fmtMin(minutes: number | null): string {
  if (!minutes) return "";
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes} min`;
}

export default async function ClassroomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { slug } = await params;
  const { module: moduleParam } = await searchParams;

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── Fetch course from Supabase ──────────────────────────────────────────────
  const { data: dbCourse } = await admin
    .from("courses")
    .select("id, slug, title, description, price, gradient, level, total_duration, total_lessons")
    .eq("slug", slug)
    .single();

  if (!dbCourse) notFound();

  // ── Fetch modules, chapters, lessons (flat queries — no FK dependency) ─────────
  const { data: rawModules } = await admin
    .from("modules")
    .select("id, title, order, price")
    .eq("course_id", dbCourse.id)
    .order("order");

  const moduleIds = (rawModules || []).map((m: any) => m.id as string);

  const { data: rawChapters } = moduleIds.length
    ? await admin
        .from("chapters")
        .select("id, title, order, module_id")
        .in("module_id", moduleIds)
        .order("order")
    : { data: [] as any[] };

  const chapterIds = (rawChapters || []).map((ch: any) => ch.id as string);

  // ── Fetch sessions for all chapters ──────────────────────────────────────────
  let rawSessions: any[] | null = null;
  if (chapterIds.length) {
    const { data } = await admin
      .from("sessions")
      .select("id, title, type, video_url, order, chapter_id")
      .in("chapter_id", chapterIds)
      .order("order");
    rawSessions = data;
  }

  const sessionIds = (rawSessions || []).map((s: any) => s.id as string);

  // ── Fetch lessons by session_id (and fallback: chapter_uuid for legacy rows) ──
  let rawLessons: any[] | null = null;
  if (sessionIds.length || chapterIds.length) {
    // Primary: lessons with session_id
    const queries: PromiseLike<any>[] = [];
    if (sessionIds.length) {
      queries.push(
        admin
          .from("lessons")
          .select("id, title, video_url, duration, order, chapter_uuid, session_id, materials")
          .in("session_id", sessionIds)
          .order("order")
      );
    }
    // Fallback: lessons without session_id but with chapter_uuid (pre-migration)
    if (chapterIds.length) {
      queries.push(
        admin
          .from("lessons")
          .select("id, title, video_url, duration, order, chapter_uuid, session_id, materials")
          .in("chapter_uuid", chapterIds)
          .is("session_id", null)
          .order("order")
      );
    }
    const results = await Promise.all(queries);
    const allRows: any[] = [];
    for (const r of results) {
      if (r.data) allRows.push(...r.data);
    }
    rawLessons = allRows;
  }

  // ── Build course structure with sequential numeric IDs ───────────────────────
  // dbIdToNumericId maps lesson UUID → sequential integer for progress tracking
  const dbIdToNumericId = new Map<string, number>();
  let lessonCounter = 0;
  let chapterCounter = 0;

  // Group lessons by session_id (primary) or chapter_uuid (fallback)
  const lessonsBySession = new Map<string, any[]>();
  const lessonsByChapterFallback = new Map<string, any[]>();
  for (const l of rawLessons || []) {
    if (l.session_id) {
      if (!lessonsBySession.has(l.session_id)) lessonsBySession.set(l.session_id, []);
      lessonsBySession.get(l.session_id)!.push(l);
    } else {
      const chKey = l.chapter_uuid as string;
      if (!chKey) continue;
      if (!lessonsByChapterFallback.has(chKey)) lessonsByChapterFallback.set(chKey, []);
      lessonsByChapterFallback.get(chKey)!.push(l);
    }
  }

  // Group sessions by chapter_id
  const sessionsByChapter = new Map<string, any[]>();
  for (const s of rawSessions || []) {
    if (!sessionsByChapter.has(s.chapter_id)) sessionsByChapter.set(s.chapter_id, []);
    sessionsByChapter.get(s.chapter_id)!.push(s);
  }

  // Group chapters by module UUID
  const chaptersByModule = new Map<string, any[]>();
  for (const ch of rawChapters || []) {
    if (!chaptersByModule.has(ch.module_id)) chaptersByModule.set(ch.module_id, []);
    chaptersByModule.get(ch.module_id)!.push(ch);
  }

  const modules: CourseModule[] = (rawModules || []).map((m: any) => {
    const sortedChapters = [...(chaptersByModule.get(m.id) || [])].sort(
      (a: any, b: any) => a.order - b.order
    );

    const chapters: CourseChapter[] = sortedChapters.map((ch: any) => {
      chapterCounter++;
      const chId = chapterCounter;

      // Build sessions for this chapter
      const sortedSessions = [...(sessionsByChapter.get(ch.id) || [])].sort(
        (a: any, b: any) => a.order - b.order
      );

      const sessions: CourseSession[] = sortedSessions.map((s: any) => {
        const sortedSessLessons = [...(lessonsBySession.get(s.id) || [])].sort(
          (a: any, b: any) => a.order - b.order
        );
        const sessLessons: CourseLesson[] = sortedSessLessons.map((l: any) => {
          lessonCounter++;
          dbIdToNumericId.set(l.id as string, lessonCounter);
          return {
            id: lessonCounter,
            dbId: l.id as string,
            title: l.title as string,
            videoUrl: (l.video_url as string) || "",
            duration: fmtMin(l.duration),
            materials: (l.materials as { title: string; url: string }[]) || [],
          };
        });
        return {
          dbId: s.id as string,
          title: s.title as string,
          type: (s.type as 'session' | 'taller') || 'session',
          videoUrl: (s.video_url as string) || undefined,
          lessons: sessLessons,
        };
      });

      // Fallback: lessons not assigned to any session (pre-migration)
      const fallbackLessons = [...(lessonsByChapterFallback.get(ch.id) || [])].sort(
        (a: any, b: any) => a.order - b.order
      );
      const fallbackCourseLesson: CourseLesson[] = fallbackLessons.map((l: any) => {
        lessonCounter++;
        dbIdToNumericId.set(l.id as string, lessonCounter);
        return {
          id: lessonCounter,
          dbId: l.id as string,
          title: l.title as string,
          videoUrl: (l.video_url as string) || "",
          duration: fmtMin(l.duration),
          materials: (l.materials as { title: string; url: string }[]) || [],
        };
      });

      // Flat lesson list: all sessions' lessons + fallback lessons (for allLessons / progress)
      const flatLessons: CourseLesson[] = [
        ...sessions.flatMap((s) => s.lessons),
        ...fallbackCourseLesson,
      ];

      return {
        id: chId,
        dbId: ch.id as string,
        title: ch.title as string,
        lessons: flatLessons,
        sessions: sessions.length > 0 ? sessions : undefined,
      };
    });

    const allLessons = chapters.flatMap((ch) => ch.lessons);

    return {
      id: (m.order as number) + 1,
      title: m.title as string,
      description: "",
      price: Number(m.price) || 0,
      lessonsCount: allLessons.length,
      duration: "",
      chapters,
    };
  });

  // Only 404 if course has no modules at all — empty chapters/lessons is OK
  if ((rawModules || []).length === 0) notFound();

  const course: CatalogCourse = {
    slug: dbCourse.slug as string,
    title: dbCourse.title as string,
    description: (dbCourse.description as string) || "",
    price: Number(dbCourse.price),
    gradient: (dbCourse.gradient as string) || "from-cyan-500 to-blue-600",
    level: (dbCourse.level as CatalogCourse["level"]) || "Principiante",
    lessonsCount: lessonCounter,
    duration: (dbCourse.total_duration as string) || "",
    modules,
    inDb: true,
  };

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const user = await getUser();
  if (!user) redirect(`/login?redirectTo=/classroom/${slug}`);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect(`/cursos/${slug}`);

  // ── Enrollment check by course_id (reliable, no title matching) ──────────────
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", profile.id)
    .eq("course_id", dbCourse.id);

  const hasFullCourse = (enrollments?.length ?? 0) > 0;

  // ── Module enrollments ────────────────────────────────────────────────────────
  let purchasedModuleIds: number[] = [];
  if (!hasFullCourse) {
    const { data: moduleEnrollments } = await admin
      .from("module_enrollments")
      .select("module_id")
      .eq("user_id", profile.id)
      .eq("course_id", dbCourse.id);

    purchasedModuleIds = (moduleEnrollments || []).map((me: any) => Number(me.module_id));
  }

  if (!hasFullCourse && purchasedModuleIds.length === 0) {
    redirect(`/cursos/${slug}`);
  }

  // ── Progress (by lesson UUID, mapped to sequential numeric IDs) ───────────────
  const { data: progressData } = await admin
    .from("progress")
    .select("lesson_id")
    .eq("user_id", profile.id)
    .eq("completed", true);

  const completedLessonIds = (progressData || [])
    .map((p: any) => {
      const numId = dbIdToNumericId.get(p.lesson_id as string);
      return numId !== undefined ? String(numId) : null;
    })
    .filter((id): id is string => id !== null);

  // ── Initial lesson (if module query param provided) ───────────────────────────
  const moduleId = moduleParam ? parseInt(moduleParam, 10) : null;
  let initialLessonId: number | undefined;
  if (moduleId) {
    const targetModule = modules.find((m) => m.id === moduleId);
    const firstLesson = targetModule?.chapters?.[0]?.lessons?.[0];
    if (firstLesson) initialLessonId = firstLesson.id;
  }

  // ── Quizzes (keyed by catalog_lesson_id which maps to sequential numeric ID) ──
  const quizList = await getQuizzesForCourse(slug);
  const quizzesByCatalogLessonId: Record<number, QuizWithQuestions> = {};
  quizList.forEach((quiz) => {
    if (quiz.catalog_lesson_id) {
      quizzesByCatalogLessonId[quiz.catalog_lesson_id] = quiz;
    }
  });

  // ── FAQs (keyed by lesson dbId / UUID) ───────────────────────────────────────
  const allLessonDbIds = (rawLessons || []).map((l: any) => l.id as string);
  const faqsByLessonDbId: Record<string, LessonFaq[]> = await getFaqsByLessonIds(allLessonDbIds);

  return (
    <ClassroomView
      course={course}
      completedLessonIds={completedLessonIds}
      profileId={profile.id}
      hasFullCourse={!!hasFullCourse}
      purchasedModuleIds={purchasedModuleIds}
      initialLessonId={initialLessonId}
      quizzesByCatalogLessonId={quizzesByCatalogLessonId}
      faqsByLessonDbId={faqsByLessonDbId}
    />
  );
}
