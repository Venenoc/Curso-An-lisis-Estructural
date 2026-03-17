import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { listExceptions } from "@/app/actions/exceptions";
import AdminExceptionsClient from "@/components/admin/AdminExceptionsClient";

export default async function AdminExceptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "instructor") redirect("/dashboard");

  // Cursos disponibles en DB para el selector
  const { data: courses } = await supabase
    .from("courses")
    .select("slug, title")
    .order("title");

  const { data: exceptions } = await listExceptions();

  return (
    <AdminExceptionsClient
      courses={courses ?? []}
      exceptions={(exceptions ?? []) as any}
    />
  );
}
