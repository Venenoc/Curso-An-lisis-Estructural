import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlatformNavbar from "@/components/layout/PlatformNavbar";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, avatar_url, full_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col overflow-hidden relative">
      {/* Fondo fijo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundImage: 'url(/images/FondoPlatform_d.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
      }} />
      <div className="relative z-10 flex min-h-screen flex-col overflow-hidden">
        <PlatformNavbar user={user} profileAvatarUrl={profile?.avatar_url} profileName={profile?.full_name} profileId={profile?.id} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
