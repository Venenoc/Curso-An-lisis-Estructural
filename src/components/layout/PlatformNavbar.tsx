"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useEffect, useState, useCallback, useRef } from "react";
import { signout } from "@/app/actions/auth";
import { markAllNotificationsRead } from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { MessageCircle, Bell, GraduationCap, ClipboardCheck, AlertCircle, Info } from "lucide-react";
import type { Notification } from "@/app/actions/notifications";

interface PlatformNavbarProps {
  user: User;
  profileAvatarUrl?: string | null;
  profileName?: string | null;
  profileId?: string | null;
}

function NotifIcon({ type }: { type: Notification["type"] }) {
  if (type === "certificate") return <GraduationCap className="w-4 h-4 text-cyan-400" />;
  if (type === "quiz_passed") return <ClipboardCheck className="w-4 h-4 text-green-400" />;
  if (type === "quiz_failed") return <AlertCircle className="w-4 h-4 text-red-400" />;
  return <Info className="w-4 h-4 text-slate-400" />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

// ─── Audio Wave Button ────────────────────────────────────────────────────────
const BAR_DELAYS = ["0ms", "120ms", "240ms", "120ms", "0ms"];

function AudioWaveButton() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/images/Platform.mp3");
    audioRef.current.loop = true;
    audioRef.current.addEventListener("ended", () => setPlaying(false));
    return () => { audioRef.current?.pause(); };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Pausar audio" : "Reproducir audio"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "2px",
        height: "28px",
        opacity: playing ? 1 : 0.55,
        transition: "opacity 0.2s",
      }}
    >
      {BAR_DELAYS.map((delay, i) => (
        <span key={i} style={{
          display: "block",
          width: "3px",
          borderRadius: "2px",
          background: playing ? "#22d3ee" : "rgba(255,255,255,0.8)",
          height: playing ? undefined : "8px",
          animation: playing ? `pn-bar 0.7s ease-in-out ${delay} infinite alternate` : "none",
          transition: "background 0.3s",
        }} />
      ))}
    </button>
  );
}

// ─── Avatar Dropdown — componente independiente, cada instancia tiene su Popover ─
interface AvatarDropdownProps {
  avatarSrc: string;
  displayName: string;
  email: string;
  size?: "sm" | "md";
}

function AvatarDropdown({ avatarSrc, displayName, email, size = "md" }: AvatarDropdownProps) {
  const imgCls = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-0 focus:outline-none group">
          {size === "md" && (
            <>
              <span className="pn-user-name pr-3 hidden sm:inline">{displayName}</span>
              <div className="pn-divider hidden sm:block" aria-hidden="true" />
            </>
          )}
          <div style={{ marginLeft: size === "md" ? "12px" : "4px", padding: "1.5px", borderRadius: "10px", background: "linear-gradient(135deg, #6EBDE9 0%, #3b82f6 60%, #6366f1 100%)", flexShrink: 0 }}>
            <img src={avatarSrc} alt="Foto de perfil"
              style={{ borderRadius: "8px", display: "block", transition: "opacity 0.2s" }}
              className={`${imgCls} object-cover group-hover:opacity-90`}
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-52 border-0 shadow-2xl" style={{
        background: "rgba(10,22,40,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(110,189,233,0.15)",
        borderRadius: "16px",
        overflow: "hidden",
      }}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(110,189,233,0.10)" }}>
          <div style={{ padding: "1.5px", borderRadius: "8px", background: "linear-gradient(135deg, #6EBDE9, #3b82f6, #6366f1)", flexShrink: 0 }}>
            <img src={avatarSrc} alt="Perfil" style={{ borderRadius: "6px", display: "block" }} className="w-8 h-8 object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs truncate" style={{ color: "rgba(110,189,233,0.7)" }}>{email}</p>
          </div>
        </div>
        <nav className="flex flex-col p-2 gap-0.5">
          {[
            { href: "/dashboard",  label: "Dashboard",     icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { href: "/cursos",     label: "Mis Cursos",    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
            { href: "/community",  label: "Comunidad",     icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6"/><circle cx="16" cy="7" r="3"/><path d="M13 14c2.7.4 5 2.7 5 6"/></svg> },
            { href: "/asesorias",  label: "Asesorías",     icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg> },
            { href: "/tools",      label: "Herramientas",  icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> },
            { href: "/profile",    label: "Perfil",        icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
            { href: "/settings",   label: "Configuración", icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(110,189,233,0.10)"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
            >
              <span style={{ color: "#6EBDE9", flexShrink: 0 }}>{icon}</span>
              {label}
            </Link>
          ))}
          <div style={{ height: "1px", background: "rgba(110,189,233,0.10)", margin: "4px 0" }} />
          <form action={signout}>
            <button type="submit"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{ color: "rgba(239,68,68,0.75)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "rgb(239,68,68)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.75)"; }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </form>
        </nav>
      </PopoverContent>
    </Popover>
  );
}

const navLinks = [
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/cursos",     label: "Cursos" },
  { href: "/community",  label: "Comunidad" },
  { href: "/asesorias",  label: "Asesorías" },
  { href: "/tools",      label: "Herramientas" },
];

const PlatformNavbar = ({ user, profileAvatarUrl, profileName, profileId }: PlatformNavbarProps) => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openNotif, setOpenNotif] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!profileId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data || []) as Notification[]);
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;
    let isMounted = true;
    const supabase = createClient();

    async function fetchMessages() {
      const { count } = await supabase
        .from("direct_messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", profileId)
        .eq("read", false);
      if (isMounted) setUnreadMessages(count ?? 0);
    }

    fetchMessages();
    fetchNotifications();

    const channel = supabase
      .channel("navbar-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages", filter: `receiver_id=eq.${profileId}` }, () => { if (isMounted) fetchMessages(); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${profileId}` }, () => { if (isMounted) fetchNotifications(); })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchNotifications]);

  async function handleOpenNotif(isOpen: boolean) {
    setOpenNotif(isOpen);
    if (isOpen && unreadNotifications > 0) {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  const displayName =
    (profileName || user?.user_metadata?.full_name || "").split(" ")[0] ||
    user?.email?.split("@")[0] || "";

  const avatarSrc = profileAvatarUrl || user.user_metadata?.avatar_url || "/images/Ingperfil.png";

  return (
    <>
      <style>{`
        @keyframes pn-bar {
          0%   { height: 4px; }
          100% { height: 18px; }
        }

        .pn-nav {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          z-index: 50;
          padding: 0 32px;
          height: 68px;
          display: flex;
          align-items: center;
          background: rgba(14,30,54,0.55);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(110,189,233,0.12);
        }

        .pn-inner {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
        }

        .pn-ae {
          font-family: var(--font-orbitron), 'Orbitron', system-ui, sans-serif;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: 0.04em;
          background: linear-gradient(135deg, #e2eaf4 0%, #7cb9e8 50%, #22d3ee 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          line-height: 1;
          padding-right: 12px;
          flex-shrink: 0;
        }

        .pn-divider {
          width: 1px;
          height: 22px;
          background: rgba(255,255,255,0.22);
          margin: 0 10px;
          flex-shrink: 0;
        }

        .pn-brand-label {
          color: rgba(255,255,255,0.8);
          font-family: var(--font-sans), system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.02em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .pn-user-name {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        .pn-center-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .pn-center {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
          margin: 0;
          padding: 5px 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 50px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .pn-link {
          font-family: var(--font-sans), system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.62);
          text-decoration: none;
          position: relative;
          padding: 6px 0;
          width: 110px;
          text-align: center;
          display: inline-block;
          border-radius: 50px;
          transition: color 0.22s, background 0.22s;
          white-space: nowrap;
        }

        .pn-link-text {
          position: relative;
          display: inline-block;
        }

        .pn-link-text::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #6EBDE9;
          border-radius: 2px;
          transition: width 0.28s ease;
        }

        .pn-link:hover { color: #ffffff; background: rgba(255,255,255,0.07); }
        .pn-link:hover .pn-link-text::after { width: 100%; }
        .pn-link.active { color: #ffffff; background: rgba(110,189,233,0.12); }
        .pn-link.active .pn-link-text::after { width: 100%; }

        .pn-right {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .pn-icon-btn {
          position: relative;
          padding: 8px;
          color: rgba(255,255,255,0.62);
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: color 0.22s, background 0.22s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pn-icon-btn:hover { color: #ffffff; background: rgba(255,255,255,0.07); }

        .pn-badge {
          position: absolute;
          top: 2px; right: 2px;
          min-width: 16px;
          height: 16px;
          padding: 0 3px;
          border-radius: 9999px;
          background: #ef4444;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
      `}</style>

      {/* ─── Desktop Nav ─── */}
      <nav className="pn-nav hidden lg:flex" aria-label="Navegación plataforma">
        <div className="pn-inner">

          {/* LEFT: AE | divider | wave | divider | @Albert_Structural */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Link href="/" className="pn-ae" aria-label="Inicio">AE</Link>
            <div className="pn-divider" aria-hidden="true" />
            <AudioWaveButton />
            <div className="pn-divider" aria-hidden="true" />
            <span className="pn-brand-label">@Albert_Structural</span>
          </div>

          {/* CENTER: pill nav */}
          <div className="pn-center-wrap">
            <ul className="pn-center">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`pn-link ${isActive(link.href) ? "active" : ""}`}>
                    <span className="pn-link-text">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: mensajes + notificaciones + avatar */}
          <div className="pn-right">

            {/* Mensajes */}
            <Link href="/community?tab=messages" className="pn-icon-btn" aria-label="Mensajes">
              <MessageCircle className="w-5 h-5" />
              {unreadMessages > 0 && <span className="pn-badge">{unreadMessages > 99 ? "99+" : unreadMessages}</span>}
            </Link>

            {/* Notificaciones */}
            <Popover open={openNotif} onOpenChange={handleOpenNotif}>
              <PopoverTrigger asChild>
                <button className="pn-icon-btn" aria-label="Notificaciones">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && <span className="pn-badge">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 bg-black/90 border border-white/20 rounded-lg shadow-lg">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <p className="text-white font-semibold text-sm">Notificaciones</p>
                  {notifications.length > 0 && <span className="text-slate-500 text-xs">{notifications.length} total</span>}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No tienes notificaciones nuevas</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.map((n) => (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? "bg-white/5" : ""}`}>
                        <div className="shrink-0 mt-0.5"><NotifIcon type={n.type} /></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${n.read ? "text-slate-400" : "text-white"}`}>{n.title}</p>
                          {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                          <p className="text-xs text-slate-600 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.read && <div className="shrink-0 w-2 h-2 rounded-full bg-cyan-400 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <div className="pn-divider" style={{ margin: "0 6px" }} aria-hidden="true" />

            {/* Avatar + dropdown */}
            <AvatarDropdown avatarSrc={avatarSrc} displayName={displayName} email={user.email ?? ""} size="md" />
          </div>
        </div>
      </nav>

      {/* ─── Mobile Nav ─── */}
      <nav className="lg:hidden fixed top-0 left-0 w-full z-50" style={{
        background: "rgba(14,30,54,0.55)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(110,189,233,0.12)",
      }}>
        <div className="h-16 w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <Link href="/" className="pn-ae" style={{ fontSize: 20 }}>AE</Link>
            <div className="pn-divider" style={{ margin: "0 8px" }} aria-hidden="true" />
            <AudioWaveButton />
          </div>
          <div className="flex items-center gap-1">
            <Link href="/community?tab=messages" className="pn-icon-btn" aria-label="Mensajes">
              <MessageCircle className="w-5 h-5" />
              {unreadMessages > 0 && <span className="pn-badge">{unreadMessages}</span>}
            </Link>
            <Popover open={openNotif} onOpenChange={handleOpenNotif}>
              <PopoverTrigger asChild>
                <button className="pn-icon-btn" aria-label="Notificaciones">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && <span className="pn-badge">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0 bg-black/90 border border-white/20 rounded-lg shadow-lg">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <p className="text-white font-semibold text-sm">Notificaciones</p>
                  {notifications.length > 0 && <span className="text-slate-500 text-xs">{notifications.length}</span>}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Bell className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">Sin notificaciones</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                    {notifications.map((n) => (
                      <div key={n.id} className={`flex items-start gap-2.5 px-3 py-2.5 ${!n.read ? "bg-white/5" : ""}`}>
                        <div className="shrink-0 mt-0.5"><NotifIcon type={n.type} /></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${n.read ? "text-slate-400" : "text-white"}`}>{n.title}</p>
                          {n.body && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                          <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.read && <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1" />}
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <AvatarDropdown avatarSrc={avatarSrc} displayName={displayName} email={user.email ?? ""} size="sm" />
          </div>
        </div>
      </nav>
    </>
  );
};

export default PlatformNavbar;
