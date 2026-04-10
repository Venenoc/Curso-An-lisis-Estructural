import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminMessages } from "@/app/actions/community";
import AdminMessagesClient from "@/components/admin/AdminMessagesClient";

export const metadata = { title: "Mensajes | Admin" };

export default async function AdminMensajesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "instructor" && profile?.role !== "admin") redirect("/dashboard");

  const { data: posts } = await getAdminMessages();

  return <AdminMessagesClient posts={posts as any} />;
}
