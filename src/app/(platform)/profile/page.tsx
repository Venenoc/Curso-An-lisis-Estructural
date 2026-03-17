import { getUser } from "@/app/actions/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { calcularNivel, calcularScore } from "@/lib/community-levels";
import type { UserStats } from "@/lib/community-levels";
import ProfilePageClient from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, role, specialty, location, created_at")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Community stats
  const { data: userPosts } = await supabase
    .from("community_posts")
    .select("id")
    .eq("user_id", profile.id);

  const { data: userReplies } = await supabase
    .from("community_replies")
    .select("id")
    .eq("user_id", profile.id);

  // Likes received on user's posts
  const postIds = (userPosts || []).map((p: any) => p.id);
  let likesReceived = 0;
  if (postIds.length > 0) {
    const { data: likes } = await supabase
      .from("community_likes")
      .select("id")
      .in("post_id", postIds);
    likesReceived = likes?.length || 0;
  }

  const postsCount = userPosts?.length || 0;
  const repliesCount = userReplies?.length || 0;

  const communityStats: UserStats = {
    posts: postsCount,
    replies: repliesCount,
    likesReceived,
    level: calcularNivel(postsCount, repliesCount, likesReceived),
    score: calcularScore(postsCount, repliesCount, likesReceived),
  };

  // Course progress
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses(title)")
    .eq("user_id", profile.id);

  const { data: moduleEnrollments } = await supabase
    .from("module_enrollments")
    .select("course_id, module_id, courses(title)")
    .eq("user_id", profile.id);

  // Get completed lessons
  const { data: progress } = await supabase
    .from("progress")
    .select("lesson_id, lessons(title, course_id)")
    .eq("user_id", profile.id)
    .eq("completed", true);

  const completedTitles = new Set(
    (progress || []).map((p: any) => p.lessons?.title).filter(Boolean)
  );

  // Build enrolled courses info
  const enrolledCoursesTitles = new Set<string>();
  (enrollments || []).forEach((e: any) => {
    if (e.courses?.title) enrolledCoursesTitles.add(e.courses.title);
  });
  (moduleEnrollments || []).forEach((me: any) => {
    if (me.courses?.title) enrolledCoursesTitles.add(me.courses.title);
  });

  const enrolledCoursesCount = enrolledCoursesTitles.size;
  const completedLessonsCount = completedTitles.size;

  // Compute course completion for badges — use certificates table
  const { count: _certCount } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id);
  const completedCoursesCount = _certCount ?? 0;

  // Build achievements/badges
  const achievements = [
    {
      id: "first_post",
      label: "Primera Publicacion",
      description: "Publicaste tu primer post en la comunidad",
      earned: postsCount >= 1,
      icon: "FileText",
    },
    {
      id: "first_reply",
      label: "Colaborador",
      description: "Respondiste a tu primer post",
      earned: repliesCount >= 1,
      icon: "MessageSquare",
    },
    {
      id: "popular",
      label: "Popular",
      description: "Recibiste 10 o mas likes en tus publicaciones",
      earned: likesReceived >= 10,
      icon: "Heart",
    },
    {
      id: "active_poster",
      label: "Autor Activo",
      description: "Publicaste 10 o mas posts",
      earned: postsCount >= 10,
      icon: "PenTool",
    },
    {
      id: "helper",
      label: "Gran Ayudante",
      description: "Respondiste 20 o mas veces",
      earned: repliesCount >= 20,
      icon: "HelpCircle",
    },
    {
      id: "enrolled",
      label: "Estudiante Inscrito",
      description: "Te inscribiste en tu primer curso",
      earned: enrolledCoursesCount >= 1,
      icon: "BookOpen",
    },
    {
      id: "lesson_complete",
      label: "Primera Leccion",
      description: "Completaste tu primera leccion",
      earned: completedLessonsCount >= 1,
      icon: "CheckCircle2",
    },
    {
      id: "course_complete",
      label: "Curso Completado",
      description: "Completaste un curso entero",
      earned: completedCoursesCount >= 1,
      icon: "Trophy",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-hidden relative mt-16">
      {/* Fondo fijo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundImage: `url(${process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL}/images/FondoPlataforma/FondoPlatform_p.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
      }} />
      <ProfilePageClient
        email={user.email || ""}
        profile={{
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          role: profile.role,
          specialty: profile.specialty || "",
          location: profile.location || "",
          created_at: profile.created_at,
        }}
        communityStats={communityStats}
        achievements={achievements}
        enrolledCoursesCount={enrolledCoursesCount}
        completedLessonsCount={completedLessonsCount}
        completedCoursesCount={completedCoursesCount}
      />
    </div>
  );
}
