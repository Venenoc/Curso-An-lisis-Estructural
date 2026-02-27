"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import React, { useEffect, useState } from "react";
import { signout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { MessageCircle, Bell } from "lucide-react";

interface PlatformNavbarProps {
  user: User;
  profileAvatarUrl?: string | null;
  profileName?: string | null;
  profileId?: string | null;
}

const PlatformNavbar = ({ user, profileAvatarUrl, profileName, profileId }: PlatformNavbarProps) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    const supabase = createClient();

    async function fetchCounts() {
      const { count } = await supabase
        .from("direct_messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", profileId)
        .eq("read", false);
      setUnreadMessages(count ?? 0);
    }

    fetchCounts();

    // Actualizar en tiempo real cuando llegue un mensaje nuevo
    const channel = supabase
      .channel("navbar-unread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_messages", filter: `receiver_id=eq.${profileId}` },
        () => fetchCounts()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profileId]);
  return (
    <nav className="fixed w-full top-0 z-50 bg-black/90 backdrop-blur-sm border-b-2 border-white/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo y marca */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/images/Logo.jpg" alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">ANÁLISIS ESTRUCTURAL</span>
              <span className="text-blue-400 font-bold text-lg">PRO</span>
            </div>
          </Link>

          {/* Menú de navegación */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/dashboard"
              className={`text-slate-300 hover:text-white transition-colors font-bold text-lg border-b-2 ${
                isActive('/dashboard') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/cursos"
              className={`text-slate-300 hover:text-white transition-colors font-bold text-lg border-b-2 ${
                isActive('/cursos') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Cursos
            </Link>
            <Link 
              href="/community" 
              className={`text-slate-300 hover:text-white transition-colors font-bold text-lg border-b-2 ${
                isActive('/community') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Comunidad
            </Link>
            <Link 
              href="/tools" 
              className={`text-slate-300 hover:text-white transition-colors font-bold text-lg border-b-2 ${
                isActive('/tools') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Herramientas
            </Link>
            <Link 
              href="/profile" 
              className={`text-slate-300 hover:text-white transition-colors font-bold text-lg border-b-2 ${
                isActive('/profile') ? 'border-blue-500 text-white' : 'border-transparent'
              }`}
            >
              Perfil
            </Link>
          </div>

          {/* Perfil o botón de acceso */}
          <div className="flex items-center gap-3">
            {user && user.user_metadata ? (
              <>
                {/* Icono de mensajes */}
                <Link href="/community?tab=messages" className="relative p-2 text-slate-300 hover:text-white transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Icono de notificaciones */}
                <Popover open={openNotif} onOpenChange={setOpenNotif}>
                  <PopoverTrigger asChild>
                    <button className="relative p-2 text-slate-300 hover:text-white transition-colors focus:outline-none">
                      <Bell className="w-6 h-6" />
                      {unreadNotifications > 0 && (
                        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                          {unreadNotifications > 99 ? "99+" : unreadNotifications}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 p-0 bg-black/90 border border-white/20 rounded-lg shadow-lg">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white font-semibold text-sm">Notificaciones</p>
                    </div>
                    <div className="px-4 py-6 text-center">
                      <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No tienes notificaciones nuevas</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : null}

            {user && user.user_metadata ? (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none">
                    <span className="hidden sm:inline text-lg text-white font-bold">
                      {(profileName || user.user_metadata.full_name || "").split(" ")[0] || user.email}
                    </span>
                    <img
                      src={profileAvatarUrl || user.user_metadata.avatar_url || "/images/Ingperfil.png"}
                      alt="Foto de perfil"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0 w-56">
                  <nav className="flex flex-col divide-y divide-white/10 bg-black/90 rounded-lg shadow-lg overflow-hidden">
                    <Link href="/dashboard" onClick={handleClose} className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Dashboard</Link>
                    <Link href="/cursos" onClick={handleClose} className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Cursos</Link>
                    <Link href="/community" onClick={handleClose} className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Comunidad</Link>
                    <Link href="/tools" onClick={handleClose} className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Herramientas</Link>
                    <Link href="/profile" onClick={handleClose} className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Perfil</Link>
                    <Link href="/settings" onClick={handleClose} className="px-6 py-3 hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors">Configuración</Link>
                    <button className="px-6 py-3 text-left hover:bg-blue-600/80 hover:text-white text-slate-200 text-sm font-medium transition-colors" onClick={handleClose}>Apariencia</button>
                    <form action={signout} onSubmit={handleClose}>
                      <Button variant="ghost" type="submit" className="w-full justify-start px-6 py-3 text-red-500 hover:bg-red-100/10">Cerrar sesión</Button>
                    </form>
                  </nav>
                </PopoverContent>
              </Popover>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold">
                  Acceso a la Plataforma
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PlatformNavbar;
