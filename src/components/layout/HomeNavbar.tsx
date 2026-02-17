"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { signout } from "@/app/actions/auth";

interface HomeNavbarProps {
  user?: User | null | undefined;
}

export default function HomeNavbar({ user }: HomeNavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed w-full top-0 z-50 border-b-2 border-white/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/images/Logo.jpg" alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">ALBERT_STRUCTURAL</span>
              <span className="text-dark font-bold text-lg">PRO</span>
            </div>
          </Link>
          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`font-bold text-lg transition-colors pb-1 border-b-2 hover:text-black ${
                isActive('/') ? 'border-black text-black' : 'border-transparent text-white'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/cursos_m"
              className={`font-bold text-lg transition-colors pb-1 border-b-2 hover:text-black ${
                isActive('/cursos_m') ? 'border-black text-black' : 'border-transparent text-white'
              }`}
            >
              Cursos
            </Link>
            <Link
              href="/community_m"
              className={`font-bold text-lg transition-colors pb-1 border-b-2 hover:text-black ${
                isActive('/community_m') ? 'border-black text-black' : 'border-transparent text-white'
              }`}
            >
              Comunidad
            </Link>
            <Link
              href="/tools_m"
              className={`font-bold text-lg transition-colors pb-1 border-b-2 hover:text-black ${
                isActive('/tools_m') ? 'border-black text-black' : 'border-transparent text-white'
              }`}
            >
              Herramientas
            </Link>
            <Link
              href="/about"
              className={`font-bold text-lg transition-colors pb-1 border-b-2 hover:text-black ${
                isActive('/about') ? 'border-black text-black' : 'border-transparent text-white'
              }`}
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/testimonials"
              className={`font-bold text-lg transition-colors pb-1 border-b-2 hover:text-black ${
                isActive('/testimonials') ? 'border-black text-black' : 'border-transparent text-white'
              }`}
            >
              Testimonios
            </Link>
          </div>
          {/* Perfil o botón de acceso */}
          {user && user.user_metadata ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none">
                  <span className="hidden sm:inline text-lg text-white font-semibold">
                    {user.user_metadata.full_name
                      ? user.user_metadata.full_name.split(" ")[0]
                      : user.email}
                  </span>
                  <img
                    src={user.user_metadata.avatar_url || "/images/Ingperfil.png"}
                    alt="Foto de perfil"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0 w-56">
                <nav className="flex flex-col divide-y divide-white/10 bg-black/90 rounded-lg shadow-lg overflow-hidden">
                  <Link href="/dashboard" className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Dashboard</Link>
                  <Link href="/cursos" className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Cursos</Link>
                  <Link href="/community" className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Comunidad</Link>
                  <Link href="/tools" className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Herramientas</Link>
                  <Link href="/profile" className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Perfil</Link>
                  <Link href="/settings" className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Configuración</Link>
                  <button className="px-6 py-3 text-left hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Apariencia</button>
                  <form action={signout}>
                    <Button variant="ghost" type="submit" className="w-full justify-start px-6 py-3 text-red-500 hover:bg-red-100/10">Cerrar sesión</Button>
                  </form>
                </nav>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold">
                  Iniciar sesión
                </Button>
              </Link>
              <div className="md:hidden">
                <Link href="/login">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Acceso
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
