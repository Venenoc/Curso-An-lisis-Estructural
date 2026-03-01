"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getUser } from "./auth";

export interface Certificate {
  id: string;
  user_id: string;
  course_slug: string;
  course_title: string;
  issued_at: string;
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  const supabase = getAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();
  return data;
}

export async function getUserCertificates(): Promise<Certificate[]> {
  const profile = await getProfile();
  if (!profile) return [];

  const supabase = getAdmin();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", profile.id)
    .order("issued_at", { ascending: false });

  return data || [];
}

export async function getCertificate(
  certificateId: string
): Promise<(Certificate & { holder_name: string | null }) | null> {
  const supabase = getAdmin();
  const { data } = await supabase
    .from("certificates")
    .select("*, profiles(full_name)")
    .eq("id", certificateId)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    course_slug: data.course_slug,
    course_title: data.course_title,
    issued_at: data.issued_at,
    holder_name: Array.isArray(data.profiles)
      ? data.profiles[0]?.full_name ?? null
      : (data.profiles as any)?.full_name ?? null,
  };
}

export async function checkAndIssueCertificate(
  courseSlug: string
): Promise<{ certificate?: Certificate; alreadyIssued?: boolean; notComplete?: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const supabase = getAdmin();

  // Check if certificate already exists
  const { data: existing } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", profile.id)
    .eq("course_slug", courseSlug)
    .single();

  if (existing) return { certificate: existing, alreadyIssued: true };

  // Find course in DB
  const { data: dbCourse } = await supabase
    .from("courses")
    .select("id, title")
    .eq("slug", courseSlug)
    .single();

  if (!dbCourse) return { error: "Curso no encontrado en base de datos" };

  // Get only lessons that are in the chapter hierarchy (chapter_uuid IS NOT NULL).
  // This matches exactly the set the dashboard uses for progress calculation —
  // lessons without chapter_uuid can't appear in the classroom so can never be completed.
  const { data: courseLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", dbCourse.id)
    .not("chapter_uuid", "is", null);

  const lessonIds = (courseLessons || []).map((l: any) => l.id as string);
  if (lessonIds.length === 0) return { notComplete: true };

  // Count how many of those lessons the user has completed
  // Note: progress PK is (user_id, lesson_id) — no standalone "id" column
  const { count: completedCount } = await supabase
    .from("progress")
    .select("lesson_id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("completed", true)
    .in("lesson_id", lessonIds);

  if ((completedCount ?? 0) < lessonIds.length) {
    return { notComplete: true };
  }

  // All lessons complete — issue certificate
  const { data: cert, error } = await supabase
    .from("certificates")
    .insert({
      user_id: profile.id,
      course_slug: courseSlug,
      course_title: dbCourse.title as string,
    })
    .select("*")
    .single();

  if (error) return { error: "Error al emitir el certificado" };

  return { certificate: cert };
}
