"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-black/70 backdrop-blur-sm border-b-2 border-white/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">ANÁLISIS ESTRUCTURAL</span>
              <span className="text-blue-400 font-bold text-lg">PRO</span>
            </div>
          </div>

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
              href="/cursos"
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/cursos') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Cursos
            </Link>
            <Link 
              href="/community" 
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/community') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Comunidad
            </Link>
            <Link 
              href="/tools" 
              className={`text-slate-300 hover:text-white transition-colors font-medium pb-1 border-b-2 ${
                isActive('/tools') ? 'border-blue-500 text-white' : 'border-transparent'
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

          {/* CTA Button */}
          <Link href="/login" className="hidden md:block">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold">
              Acceso a la Plataforma
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Acceso
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
