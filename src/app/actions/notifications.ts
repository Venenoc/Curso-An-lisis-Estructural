"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getUser } from "./auth";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: "certificate" | "quiz_passed" | "quiz_failed" | "info";
  read: boolean;
  created_at: string;
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getProfileId(): Promise<string | null> {
  const user = await getUser();
  if (!user) return null;
  const admin = getAdmin();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data?.id ?? null;
}

// Devuelve las últimas 20 notificaciones del usuario
export async function getNotifications(): Promise<Notification[]> {
  const profileId = await getProfileId();
  if (!profileId) return [];

  const admin = getAdmin();
  const { data } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data || []) as Notification[];
}

// Marca todas las notificaciones del usuario como leídas
export async function markAllNotificationsRead(): Promise<void> {
  const profileId = await getProfileId();
  if (!profileId) return;

  const admin = getAdmin();
  await admin
    .from("notifications")
    .update({ read: true })
    .eq("user_id", profileId)
    .eq("read", false);
}

// Crea una notificación para un usuario (llamada desde otras server actions)
export async function createNotification(
  profileId: string,
  title: string,
  body: string | null,
  type: Notification["type"] = "info"
): Promise<void> {
  const admin = getAdmin();
  await admin.from("notifications").insert({ user_id: profileId, title, body, type });
}
