import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import AdminCourseClient from "@/components/admin/AdminCourseClient";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "instructor" && profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, price, status, slug, level, total_duration, subscription_only, image_url, gradient, presentation_video_url")
    .eq("id", id)
    .eq("instructor_id", profile.id)
    .single();

  if (!course) {
    redirect("/admin/courses");
  }

  // Fetch modules → chapters → sessions → lessons hierarchy
  const { data: modulesRaw } = await supabase
    .from("modules")
    .select(`
      id, title, order, course_id, presentation_video_url,
      chapters(
        id, title, order, module_id,
        sessions(
          id, title, type, video_url, order, chapter_id,
          lessons(id, title, video_url, order, duration, chapter_uuid, session_id, materials)
        )
      )
    `)
    .eq("course_id", id)
    .order("order", { ascending: true });

  // Sort nested relations
  const modules = (modulesRaw || []).map((m: any) => ({
    ...m,
    chapters: [...(m.chapters || [])].sort((a: any, b: any) => a.order - b.order).map((c: any) => ({
      ...c,
      sessions: [...(c.sessions || [])].sort((a: any, b: any) => a.order - b.order).map((s: any) => ({
        ...s,
        lessons: [...(s.lessons || [])].sort((a: any, b: any) => a.order - b.order),
      })),
    })),
  }));

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative py-12"
      style={{
        backgroundImage: "url('/images/Fondos de marketing/Fondo_ATm.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="pt-8">
          <Link
            href="/admin/courses"
            className="flex items-center gap-2 text-muted-black hover:text-foreground mb-2 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a Mis Cursos
          </Link>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-md">
          <AdminCourseClient
            course={{
              id: course.id,
              title: course.title,
              description: course.description || "",
              price: course.price,
              status: course.status,
              slug: course.slug,
              level: course.level || "Principiante",
              total_duration: course.total_duration || "",
              subscription_only: course.subscription_only ?? false,
              image_url: course.image_url || "",
              gradient: course.gradient || "from-cyan-500 to-blue-600",
              presentation_video_url: course.presentation_video_url || "",
            }}
            modules={modules}
          />
        </div>
      </div>
    </div>
  );
}
