import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
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

  return (
    <div className="flex min-h-screen flex-col">
      <PlatformNavbar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
