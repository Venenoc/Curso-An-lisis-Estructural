import { notFound, redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { coursesCatalog } from "@/data/courses-catalog";
import ClassroomView from "@/components/classroom/ClassroomView";
import { getQuizzesForCourse } from "@/app/actions/quizzes";
import type { QuizWithQuestions } from "@/app/actions/quizzes";

export default async function ClassroomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { slug } = await params;
  const { module: moduleParam } = await searchParams;
  const course = coursesCatalog.find((c) => c.slug === slug);

  if (!course) notFound();
  if (!course.modules || course.modules.length === 0) notFound();

  const user = await getUser();
  if (!user) redirect(`/login?redirectTo=/classroom/${slug}`);

  const supabase = await createClient();

  // Check enrollment
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect(`/cursos/${slug}`);

  // Check full course enrollment
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses(title)")
    .eq("user_id", profile.id);

  const hasFullCourse = enrollments?.some(
    (e: any) => e.courses?.title === course.title
  );

  // Use admin client to bypass RLS (needed for module-only purchases)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Find course in DB (needed for module enrollments and progress filtering)
  const { data: dbCourse } = await supabaseAdmin
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .single();

  // Check module enrollments
  let purchasedModuleIds: number[] = [];
  if (!hasFullCourse && dbCourse) {
    const { data: moduleEnrollments } = await supabaseAdmin
      .from("module_enrollments")
      .select("module_id")
      .eq("user_id", profile.id)
      .eq("course_id", dbCourse.id);

    purchasedModuleIds = (moduleEnrollments || []).map((me: any) => me.module_id);
  }

  // If no full course and no modules purchased, redirect
  if (!hasFullCourse && purchasedModuleIds.length === 0) {
    redirect(`/cursos/${slug}`);
  }

  // Get progress — join with lessons to get titles, filter by course
  const { data: progressData } = await supabaseAdmin
    .from("progress")
    .select("lesson_id, completed, lessons(title, course_id)")
    .eq("user_id", profile.id)
    .eq("completed", true);

  // Build a set of completed lesson titles for this course only
  const completedTitles = new Set(
    (progressData || [])
      .filter((p: any) => !dbCourse || p.lessons?.course_id === dbCourse.id)
      .map((p: any) => p.lessons?.title)
      .filter(Boolean)
  );

  // Map completed titles back to catalog lesson IDs (traversing module → chapter → lesson)
  const allCatalogLessons = course.modules?.flatMap((m) =>
    (m.chapters || []).flatMap((ch) => ch.lessons)
  ) || [];
  const completedLessonIds = allCatalogLessons
    .filter((l) => completedTitles.has(l.title))
    .map((l) => String(l.id));

  // Find the first lesson of the requested module (if param provided)
  const moduleId = moduleParam ? parseInt(moduleParam, 10) : null;
  let initialLessonId: number | undefined;
  if (moduleId && course.modules) {
    const targetModule = course.modules.find((m) => m.id === moduleId);
    const firstLesson = targetModule?.chapters?.[0]?.lessons?.[0];
    if (firstLesson) initialLessonId = firstLesson.id;
  }

  // Fetch quizzes for this course and build a map by catalog lesson ID
  const quizList = await getQuizzesForCourse(slug);
  const quizzesByCatalogLessonId: Record<number, QuizWithQuestions> = {};
  quizList.forEach((quiz) => {
    if (quiz.catalog_lesson_id) {
      quizzesByCatalogLessonId[quiz.catalog_lesson_id] = quiz;
    }
  });

  return (
    <ClassroomView
      course={course}
      completedLessonIds={completedLessonIds}
      profileId={profile.id}
      hasFullCourse={!!hasFullCourse}
      purchasedModuleIds={purchasedModuleIds}
      initialLessonId={initialLessonId}
      quizzesByCatalogLessonId={quizzesByCatalogLessonId}
    />
  );
}
