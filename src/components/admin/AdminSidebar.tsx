"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageCircle, Star, ShieldCheck, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin/courses", label: "Cursos", icon: BookOpen },
  { href: "/admin/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/admin/testimonials", label: "Testimonios", icon: Star },
  { href: "/admin/exceptions", label: "Accesos", icon: ShieldCheck },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col z-40 bg-slate-900/85 backdrop-blur-md border-r border-white/10">
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mb-1">
          Panel de Gestión
        </p>
        <h2 className="text-white font-bold text-base leading-tight">Albert Structural</h2>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                active
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Ir al Dashboard
        </Link>
      </div>
    </aside>
  );
}
