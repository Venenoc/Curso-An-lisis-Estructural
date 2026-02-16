import { notFound, redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { coursesCatalog } from "@/data/courses-catalog";
import ClassroomView from "@/components/classroom/ClassroomView";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses(title)")
    .eq("user_id", profile.id);

  const isPurchased = enrollments?.some(
    (e: any) => e.courses?.title === course.title
  );

  if (!isPurchased) redirect(`/cursos/${slug}`);

  // Get progress — join with lessons to get titles, then map to catalog IDs
  const { data: progressData } = await supabase
    .from("progress")
    .select("lesson_id, completed, lessons(title, course_id)")
    .eq("user_id", profile.id)
    .eq("completed", true);

  // Build a set of completed lesson titles for this course
  const completedTitles = new Set(
    (progressData || [])
      .map((p: any) => p.lessons?.title)
      .filter(Boolean)
  );

  // Map completed titles back to catalog lesson IDs
  const allCatalogLessons = course.modules?.flatMap((m) => m.lessons || []) || [];
  const completedLessonIds = allCatalogLessons
    .filter((l) => completedTitles.has(l.title))
    .map((l) => String(l.id));

  return (
    <ClassroomView
      course={course}
      completedLessonIds={completedLessonIds}
      profileId={profile.id}
    />
  );
}
