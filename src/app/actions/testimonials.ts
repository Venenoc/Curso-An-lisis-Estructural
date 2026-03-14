"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function submitTestimonial(data: {
  courseId: string;
  courseTitle: string;
  content: string;
  rating: number;
  authorRole?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();
  if (!profile) return { error: "Perfil no encontrado" };

  const { error } = await getAdmin()
    .from("testimonials")
    .upsert(
      {
        user_id: profile.id,
        course_id: data.courseId,
        course_title: data.courseTitle,
        author_name: profile.full_name || "Estudiante",
        author_role: data.authorRole?.trim() || "",
        content: data.content.trim(),
        rating: data.rating,
        is_approved: false,
      },
      { onConflict: "user_id,course_id" }
    );

  if (error) return { error: error.message };
  return { success: true };
}

export async function getApprovedTestimonials(courseId?: string) {
  const admin = getAdmin();
  let query = admin
    .from("testimonials")
    .select("id, author_name, author_role, content, rating, course_title, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (courseId) query = query.eq("course_id", courseId);

  const { data } = await query.limit(24);
  return (data || []) as {
    id: string;
    author_name: string;
    author_role: string;
    content: string;
    rating: number;
    course_title: string;
    created_at: string;
  }[];
}

export async function hasUserSubmittedTestimonial(courseId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return false;

  const { data } = await getAdmin()
    .from("testimonials")
    .select("id")
    .eq("user_id", profile.id)
    .eq("course_id", courseId)
    .single();

  return !!data;
}

export async function approveTestimonial(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "instructor") return { error: "Sin permisos" };

  const { error } = await getAdmin()
    .from("testimonials")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectTestimonial(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "instructor") return { error: "Sin permisos" };

  const { error } = await getAdmin()
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getAllTestimonialsAdmin() {
  const admin = getAdmin();
  const { data } = await admin
    .from("testimonials")
    .select("id, author_name, author_role, content, rating, course_title, is_approved, created_at")
    .order("created_at", { ascending: false });
  return (data || []) as {
    id: string;
    author_name: string;
    author_role: string;
    content: string;
    rating: number;
    course_title: string;
    is_approved: boolean;
    created_at: string;
  }[];
}
