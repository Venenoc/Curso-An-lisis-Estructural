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
    .select("id, role")
    .eq("user_id", user.id)
    .single();
  return data;
}

// ── Posts ──

export async function createPost(title: string, content: string, imageUrl?: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (!title.trim()) return { error: "El título no puede estar vacío" };
  if (!content.trim()) return { error: "El contenido no puede estar vacío" };

  const supabase = getAdmin();
  const insertData: any = {
    user_id: profile.id,
    title: title.trim(),
    content: content.trim(),
  };
  if (imageUrl) insertData.image_url = imageUrl;

  const { error } = await supabase.from("community_posts").insert(insertData);

  if (error) return { error: "Error al crear publicación" };
  revalidatePath("/community");
  return { success: true };
}

export async function deletePost(postId: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const supabase = getAdmin();

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

// ── Pin ──

export async function togglePin(postId: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (profile.role !== "instructor" && profile.role !== "admin") {
    return { error: "Solo instructores pueden fijar publicaciones" };
  }

  const supabase = getAdmin();
  const { data: post } = await supabase
    .from("community_posts")
    .select("pinned")
    .eq("id", postId)
    .single();

  if (!post) return { error: "Publicación no encontrada" };

  const { error } = await supabase
    .from("community_posts")
    .update({ pinned: !post.pinned })
    .eq("id", postId);

  if (error) return { error: "Error al fijar publicación" };
  revalidatePath("/community");
  return { success: true, pinned: !post.pinned };
}

// ── Likes ──

export async function toggleLike(postId: string) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const supabase = getAdmin();

  // Check if already liked
  const { data: existing } = await supabase
    .from("community_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", profile.id)
    .single();

  if (existing) {
    // Unlike
    await supabase.from("community_likes").delete().eq("id", existing.id);
  } else {
    // Like
    await supabase
      .from("community_likes")
      .insert({ post_id: postId, user_id: profile.id });
  }

  revalidatePath("/community");
  return { success: true, liked: !existing };
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

// ── Image Upload ──

export async function uploadPostImage(formData: FormData) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No se seleccionó archivo" };

  // Validate file type and size
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Formato no soportado. Usa JPG, PNG, WebP o GIF" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no debe superar 5MB" };
  }

  const supabase = getAdmin();
  const ext = file.name.split(".").pop();
  const fileName = `${profile.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("community-images")
    .upload(fileName, file);

  if (error) return { error: "Error al subir imagen" };

  const { data: urlData } = supabase.storage
    .from("community-images")
    .getPublicUrl(fileName);

  return { success: true, url: urlData.publicUrl };
}
