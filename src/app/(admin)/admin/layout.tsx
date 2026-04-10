import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: `url('/images/Fondos%20de%20marketing/Fondo_ATm.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Frosted overlay */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-none z-0" />

      <AdminSidebar />

      {/* Main canvas */}
      <main className="relative z-10 flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
