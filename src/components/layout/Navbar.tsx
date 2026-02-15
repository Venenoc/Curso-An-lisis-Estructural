"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { signout } from "@/app/actions/auth";

interface NavbarProps {
  user?: User | null | undefined;
}
  
export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <nav className="fixed w-full top-0 z-50 bg-black/70 backdrop-blur-sm border-b-2 border-white/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">ANÁLISIS ESTRUCTURAL</span>
              <span className="text-blue-400 font-bold text-lg">PRO</span>
            </div>
          </Link>
          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Inicio
            </Link>
            <Link 
              href="/cursos_m"
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/cursos_m') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Cursos
            </Link>
            <Link 
              href="/community_m" 
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/community_m') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Comunidad
            </Link>
            <Link 
              href="/tools_m" 
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/tools_m') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Herramientas
            </Link>
            <Link 
              href="/about" 
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/about') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Sobre Nosotros
            </Link>
            <Link 
              href="/testimonials" 
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/testimonials') ? 'border-blue-500 text-white' : 'border-transparent'
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
                  <span className="hidden sm:inline text-sm text-white font-semibold">
                    {user.user_metadata.full_name
                      ? user.user_metadata.full_name.split(" ")[0]
                      : user.email}
                  </span>
                  <img
                    src={user.user_metadata.avatar_url || "/images/Ingperfil.png"}
                    alt="Foto de perfil"
                    className="w-8 h-8 rounded-full object-cover border"
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
