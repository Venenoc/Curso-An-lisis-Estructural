import ToolsNav from "@/components/tools/ToolsNav";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <ToolsNav />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
