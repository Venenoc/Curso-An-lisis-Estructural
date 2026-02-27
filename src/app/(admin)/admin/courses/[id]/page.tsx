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
    .select("*")
    .eq("id", id)
    .eq("instructor_id", profile.id)
    .single();

  if (!course) {
    redirect("/admin/courses");
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, video_url, order, duration")
    .eq("course_id", id)
    .order("order");

  return (
    <div>
      <div className="container pt-8">
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a Mis Cursos
        </Link>
      </div>

      <AdminCourseClient
        course={{
          id: course.id,
          title: course.title,
          description: course.description || "",
          price: course.price,
          status: course.status,
          slug: course.slug,
        }}
        lessons={lessons || []}
      />
    </div>
  );
}
