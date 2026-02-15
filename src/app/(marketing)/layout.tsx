import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getUser } from "@/app/actions/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
