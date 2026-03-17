"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireInstructor() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "instructor") redirect("/dashboard");
  return profile;
}

/** Lista todas las excepciones */
export async function listExceptions() {
  await requireInstructor();
  const { data, error } = await admin
    .from("course_exceptions")
    .select("id, course_slug, note, granted_at, user_id, user_email, profiles(full_name)")
    .order("granted_at", { ascending: false });
  if (error) return { error: error.message };
  return { data: data ?? [] };
}

/** Busca un perfil por email — retorna también el auth_user_id para guardarlo en la excepción */
export async function findProfileByEmail(email: string) {
  await requireInstructor();
  const { data: authUsers } = await admin.auth.admin.listUsers();
  const match = authUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
  );
  if (!match) return { error: "No se encontró ningún usuario con ese email." };

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("user_id", match.id)
    .single();
  if (!profile) return { error: "El usuario no tiene perfil creado aún." };

  return {
    profile: {
      id: profile.id,           // profiles.id
      auth_user_id: match.id,   // auth.users.id — el que usamos para check en classroom
      full_name: profile.full_name,
      email: match.email ?? "",
    },
  };
}

/** Otorga acceso gratuito */
export async function grantException(formData: FormData) {
  await requireInstructor();
  const profileId    = formData.get("profile_id")    as string;
  const authUserId   = formData.get("auth_user_id")  as string;
  const courseSlug   = formData.get("course_slug")   as string;
  const userEmail    = formData.get("user_email")    as string;
  const note         = (formData.get("note") as string) || null;

  if (!profileId || !courseSlug) return { error: "Datos incompletos." };

  const { error } = await admin
    .from("course_exceptions")
    .upsert(
      {
        user_id: profileId,
        auth_user_id: authUserId || null,
        course_slug: courseSlug,
        user_email: userEmail || null,
        note,
      },
      { onConflict: "user_id,course_slug" }
    );

  if (error) return { error: error.message };
  return { success: true };
}

/** Revoca el acceso gratuito */
export async function revokeException(id: string) {
  await requireInstructor();
  const { error } = await admin.from("course_exceptions").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
