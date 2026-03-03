import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function ToolsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col" style={{background: 'linear-gradient(to bottom, #F6F9FF 0%, #CCDBEC 100%)'}}>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
