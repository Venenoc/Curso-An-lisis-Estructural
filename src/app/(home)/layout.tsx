import HomeNavbar from "@/components/layout/HomeNavbar";
import Footer from "@/components/layout/Footer";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  let profileAvatarUrl: string | null = null;
  let profileName: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("user_id", user.id)
      .single();
    profileAvatarUrl = profile?.avatar_url || null;
    profileName = profile?.full_name || null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HomeNavbar user={user} profileAvatarUrl={profileAvatarUrl} profileName={profileName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
