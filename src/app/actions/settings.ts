"use server";

import { createClient } from "@/lib/supabase/server";
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

export async function changePassword(currentPassword: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (currentPassword === newPassword) {
    return { error: "La nueva contraseña debe ser diferente a la actual" };
  }

  const user = await getUser();
  if (!user) return { error: "No autenticado" };

  // Re-authenticate with current password to verify it
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });
  if (signInError) return { error: "Contraseña actual incorrecta" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Error al actualizar la contraseña" };

  return { success: true };
}

export async function deleteAccount() {
  const user = await getUser();
  if (!user) return { error: "No autenticado" };

  const supabase = getAdmin();
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) return { error: "Error al eliminar la cuenta" };

  return { success: true };
}

export async function signOutAllDevices() {
  const user = await getUser();
  if (!user) return { error: "No autenticado" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) return { error: "Error al cerrar sesiones" };

  revalidatePath("/");
  return { success: true };
}
