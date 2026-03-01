import { getUser } from "@/app/actions/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import SettingsPageClient from "@/components/settings/SettingsPageClient";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch full course purchases
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, enrolled_at, payment_type, courses(title, price, slug)")
    .eq("user_id", profile.id)
    .order("enrolled_at", { ascending: false });

  // Fetch module purchases
  const { data: moduleEnrollments } = await supabase
    .from("module_enrollments")
    .select("id, enrolled_at, payment_type, price, module_title, module_id, courses(title, slug)")
    .eq("user_id", profile.id)
    .order("enrolled_at", { ascending: false });

  // Build unified purchase history
  type Purchase = {
    id: string;
    date: string;
    type: "course" | "module";
    itemName: string;
    courseName: string;
    courseSlug: string;
    price: number;
    paymentType: string;
  };

  const purchases: Purchase[] = [
    ...(enrollments || []).map((e: any) => ({
      id: e.id,
      date: e.enrolled_at,
      type: "course" as const,
      itemName: e.courses?.title || "Curso",
      courseName: e.courses?.title || "Curso",
      courseSlug: e.courses?.slug || "",
      price: e.courses?.price || 0,
      paymentType: e.payment_type,
    })),
    ...(moduleEnrollments || []).map((me: any) => ({
      id: me.id,
      date: me.enrolled_at,
      type: "module" as const,
      itemName: me.module_title,
      courseName: me.courses?.title || "Curso",
      courseSlug: me.courses?.slug || "",
      price: Number(me.price),
      paymentType: me.payment_type,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = purchases.reduce((acc, p) => acc + p.price, 0);

  return (
    <SettingsPageClient
      email={user.email || ""}
      fullName={profile.full_name || ""}
      role={profile.role}
      avatarUrl={profile.avatar_url}
      createdAt={profile.created_at}
      purchases={purchases}
      totalSpent={totalSpent}
    />
  );
}
