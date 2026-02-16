"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getUser } from "./auth";

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
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data;
}

// ── Posts ──

export async function createPost(content: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (!content.trim()) return { error: "El contenido no puede estar vacío" };

  const supabase = getAdmin();
  const { error } = await supabase
    .from("community_posts")
    .insert({ user_id: profile.id, content: content.trim() });

  if (error) return { error: "Error al crear publicación" };
  revalidatePath("/community");
  return { success: true };
}

export async function deletePost(postId: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const supabase = getAdmin();

  // Verify ownership
  const { data: post } = await supabase
    .from("community_posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== profile.id) return { error: "No autorizado" };

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);

  if (error) return { error: "Error al eliminar" };
  revalidatePath("/community");
  return { success: true };
}

// ── Replies ──

export async function createReply(postId: string, content: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (!content.trim()) return { error: "El contenido no puede estar vacío" };

  const supabase = getAdmin();
  const { error } = await supabase
    .from("community_replies")
    .insert({ post_id: postId, user_id: profile.id, content: content.trim() });

  if (error) return { error: "Error al responder" };
  revalidatePath("/community");
  return { success: true };
}

export async function deleteReply(replyId: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const supabase = getAdmin();

  const { data: reply } = await supabase
    .from("community_replies")
    .select("user_id")
    .eq("id", replyId)
    .single();

  if (!reply || reply.user_id !== profile.id) return { error: "No autorizado" };

  const { error } = await supabase
    .from("community_replies")
    .delete()
    .eq("id", replyId);

  if (error) return { error: "Error al eliminar" };
  revalidatePath("/community");
  return { success: true };
}

// ── Direct Messages ──

export async function sendMessage(receiverId: string, content: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (!content.trim()) return { error: "El mensaje no puede estar vacío" };

  const supabase = getAdmin();
  const { error } = await supabase
    .from("direct_messages")
    .insert({
      sender_id: profile.id,
      receiver_id: receiverId,
      content: content.trim(),
    });

  if (error) return { error: "Error al enviar mensaje" };
  revalidatePath("/community");
  return { success: true };
}

export async function markMessagesRead(otherUserId: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const supabase = getAdmin();
  await supabase
    .from("direct_messages")
    .update({ read: true })
    .eq("sender_id", otherUserId)
    .eq("receiver_id", profile.id)
    .eq("read", false);

  revalidatePath("/community");
  return { success: true };
}
