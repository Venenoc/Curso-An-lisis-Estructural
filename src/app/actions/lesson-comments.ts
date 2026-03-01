"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getUser } from "./auth";

export interface LessonComment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  isOwn: boolean;
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getCurrentProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await getAdmin()
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("user_id", user.id)
    .single();
  return data ?? null;
}

export async function getLessonComments(lessonDbId: string): Promise<LessonComment[]> {
  const profile = await getCurrentProfile();
  const supabase = getAdmin();

  const { data } = await supabase
    .from("lesson_comments")
    .select("id, content, created_at, user_id, profiles(id, full_name, avatar_url)")
    .eq("lesson_id", lessonDbId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id as string,
    content: row.content as string,
    created_at: row.created_at as string,
    user: {
      id: (row.profiles?.id ?? row.user_id) as string,
      full_name: (row.profiles?.full_name ?? "Usuario") as string,
      avatar_url: (row.profiles?.avatar_url ?? null) as string | null,
    },
    isOwn: profile ? row.user_id === profile.id : false,
  }));
}

export async function postLessonComment(
  lessonDbId: string,
  content: string
): Promise<{ success?: boolean; comment?: LessonComment; error?: string }> {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 2000) return { error: "Comentario inválido." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "No autenticado." };

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("lesson_comments")
    .insert({ lesson_id: lessonDbId, user_id: profile.id, content: trimmed })
    .select("id, content, created_at, user_id")
    .single();

  if (error || !data) return { error: "Error al publicar el comentario." };

  return {
    success: true,
    comment: {
      id: data.id as string,
      content: data.content as string,
      created_at: data.created_at as string,
      user: {
        id: profile.id,
        full_name: profile.full_name ?? "Usuario",
        avatar_url: profile.avatar_url ?? null,
      },
      isOwn: true,
    },
  };
}

export async function deleteLessonComment(
  commentId: string
): Promise<{ success?: boolean; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "No autenticado." };

  const supabase = getAdmin();
  const { error } = await supabase
    .from("lesson_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", profile.id);

  if (error) return { error: "Error al eliminar el comentario." };
  return { success: true };
}
