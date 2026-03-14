import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminCoursesClient from "@/components/admin/AdminCoursesClient";

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  // Single auth call — middleware already protects this route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile + courses queries in parallel
  const profilePromise = supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await profilePromise;
  if (profile?.role !== "instructor") redirect("/dashboard");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, price, status, slug, level, total_duration, total_lessons, subscription_only, image_url, gradient, created_at, lessons(count)")
    .eq("instructor_id", profile.id)
    .order("created_at", { ascending: false });

  return <AdminCoursesClient courses={courses ?? []} />;
}
