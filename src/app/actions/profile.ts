"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getUser } from "./auth";
import { uploadToR2 } from "@/lib/r2";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function updateProfile(data: {
  full_name?: string;
  bio?: string;
  specialty?: string;
  location?: string;
}) {
  const user = await getUser();
  if (!user) return { error: "No autenticado" };

  const supabase = getAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Perfil no encontrado" };

  const updateData: Record<string, string> = {};
  if (data.full_name !== undefined) updateData.full_name = data.full_name.trim();
  if (data.bio !== undefined) updateData.bio = data.bio.trim();
  if (data.specialty !== undefined) updateData.specialty = data.specialty.trim();
  if (data.location !== undefined) updateData.location = data.location.trim();

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", profile.id);

  if (error) return { error: "Error al actualizar perfil" };

  revalidatePath("/profile");
  revalidatePath("/community");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "No autenticado" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No se selecciono archivo" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Formato no soportado. Usa JPG, PNG o WebP" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "La imagen no debe superar 2MB" };
  }

  const supabase = getAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Perfil no encontrado" };

  const ext = file.name.split(".").pop();
  const fileName = `avatars/${profile.id}/${Date.now()}.${ext}`;

  let publicUrl: string;
  try {
    publicUrl = await uploadToR2({ file, key: fileName, contentType: file.type });
  } catch {
    return { error: "Error al subir imagen" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", profile.id);

  if (updateError) return { error: "Error al actualizar avatar" };

  revalidatePath("/profile");
  revalidatePath("/community");
  revalidatePath("/dashboard");

  return { success: true, url: publicUrl };
}
