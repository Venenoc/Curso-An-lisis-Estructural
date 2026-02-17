import HomeNavbar from "@/components/layout/HomeNavbar";
import Footer from "@/components/layout/Footer";
import { getUser } from "@/app/actions/auth";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNavbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
