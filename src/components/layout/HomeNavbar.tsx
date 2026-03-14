"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { signout } from "@/app/actions/auth";
import type { User } from "@supabase/supabase-js";

interface HomeNavbarProps {
  user?: User | null | undefined;
  profileAvatarUrl?: string | null;
  profileName?: string | null;
}

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/cursos_m", label: "Cursos" },
  { href: "/community_m", label: "Comunidad" },
  { href: "/tools_m", label: "Herramientas" },
];

const mobileMenuLinks = navLinks;

function MobileMenuIcon({ href }: { href: string }) {
  if (href === "/") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12L12 4l9 8" /><path d="M5 10v9h5v-5h4v5h5v-9" /></svg>
  );
  if (href === "/cursos_m") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3L2 8l10 5 10-5-10-5z" /><path d="M2 8v6c0 3 4.5 5 10 5s10-2 10-5V8" /></svg>
  );
  if (href === "/community_m") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6" /><circle cx="16" cy="7" r="3" /><path d="M13 14c2.7.4 5 2.7 5 6" /><path d="M9 14h6" /></svg>
  );
  if (href === "/tools_m") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>
  );
  if (href === "/about") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
  );
}

// ─── Audio Wave Button ───────────────────────────────────────────────────────
const BAR_DELAYS = ["0ms", "120ms", "240ms", "120ms", "0ms"];

function AudioWaveButton() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/images/intro.mp3");
    audioRef.current.loop = true;
    audioRef.current.addEventListener("ended", () => setPlaying(false));
    return () => {
      audioRef.current?.pause();
    };
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
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        gap: "3px",
        height: "28px",
        opacity: playing ? 1 : 0.55,
        transition: "opacity 0.2s",
      }}
    >
      {BAR_DELAYS.map((delay, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: "3px",
            borderRadius: "2px",
            background: playing ? "#22d3ee" : "rgba(255,255,255,0.8)",
            height: playing ? undefined : "8px",
            animation: playing ? `hn-bar 0.7s ease-in-out ${delay} infinite alternate` : "none",
            transition: "background 0.3s",
          }}
        />
      ))}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HomeNavbar({ user, profileAvatarUrl, profileName }: HomeNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const showBg = pathname !== "/";

  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  const displayName =
    (profileName || user?.user_metadata?.full_name || "").split(" ").slice(0, 2).join(" ") ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <>
      <style>{`
        @keyframes hn-bar {
          0%   { height: 4px; }
          100% { height: 18px; }
        }

        .hn-nav {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          z-index: 50;
          padding: 0 32px;
          height: 68px;
          display: flex;
          align-items: center;
        }

        .hn-inner {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* ── Left brand cluster ── */
        .hn-brand-cluster {
          display: flex;
          align-items: center;
          gap: 0;
          flex-shrink: 0;
        }

        .hn-ae {
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
        }

        .hn-divider {
          width: 1px;
          height: 22px;
          background: rgba(255,255,255,0.22);
          margin: 0 10px;
          flex-shrink: 0;
        }

        /* ── Center pill container ── */
        .hn-center-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .hn-center {
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

        .hn-link {
          font-family: var(--font-sans), system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.62);
          text-decoration: none;
          position: relative;
          padding: 6px 0;
          width: 120px;
          text-align: center;
          display: inline-block;
          border-radius: 50px;
          transition: color 0.22s, background 0.22s;
          white-space: nowrap;
        }

        .hn-link-text {
          position: relative;
          display: inline-block;
        }

        .hn-link-text::after {
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

        .hn-link:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.07);
        }

        .hn-link:hover .hn-link-text::after {
          width: 100%;
        }

        .hn-link.active {
          color: #ffffff;
          background: rgba(110,189,233,0.12);
        }

        .hn-link.active .hn-link-text::after {
          width: 100%;
        }

        /* ── Right user ── */
        .hn-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .hn-user-name {
          color: rgba(255,255,255,0.82);
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }
      `}</style>

      {/* ─── Desktop Nav ─── */}
      <nav
        className="hn-nav hidden lg:flex"
        aria-label="Navegación principal"
        style={{
          background: showBg ? "rgba(14,30,54,0.30)" : "transparent",
          backdropFilter: showBg ? "blur(18px)" : "none",
          WebkitBackdropFilter: showBg ? "blur(18px)" : "none",
          borderBottom: showBg ? "1px solid rgba(110,189,233,0.12)" : "none",
          transition: "background 0.35s ease, border-color 0.35s ease",
        }}
      >
        <div className="hn-inner">

          {/* LEFT: AE | divider | wave | divider | @Albert_Structural */}
          <div className="hn-brand-cluster">
            <Link href="/" className="hn-ae" aria-label="Inicio">AS</Link>
            <div className="hn-divider" aria-hidden="true" />
            <AudioWaveButton />
            <div className="hn-divider" aria-hidden="true" />
            <span style={{
              color: "rgba(255,255,255,0.8)",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}>
              @Albert_Structural
            </span>
          </div>

          {/* CENTER: pill container */}
          <div className="hn-center-wrap">
            <ul className="hn-center">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`hn-link ${isActive(link.href) ? "active" : ""}`}>
                    <span className="hn-link-text">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: nombre + foto */}
          <div className="hn-right">
            {user && user.user_metadata ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-0 focus:outline-none group">
                    <span className="hn-user-name pr-3">{displayName}</span>
                    <div className="hn-divider" aria-hidden="true" />
                    <div style={{
                      marginLeft: "12px",
                      padding: "1.5px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #6EBDE9 0%, #3b82f6 60%, #6366f1 100%)",
                      flexShrink: 0,
                    }}>
                      <img
                        src={profileAvatarUrl || user.user_metadata.avatar_url || "/images/Ingperfil.png"}
                        alt="Foto de perfil"
                        style={{ borderRadius: "8px", display: "block", transition: "opacity 0.2s" }}
                        className="w-9 h-9 object-cover group-hover:opacity-90"
                      />
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0 w-52 border-0 shadow-2xl" style={{
                  background: "rgba(10,22,40,0.92)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(110,189,233,0.15)",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}>
                  {/* Header con avatar */}
                  <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(110,189,233,0.10)" }}>
                    <div style={{ padding: "1.5px", borderRadius: "8px", background: "linear-gradient(135deg, #6EBDE9, #3b82f6, #6366f1)", flexShrink: 0 }}>
                      <img
                        src={profileAvatarUrl || user.user_metadata.avatar_url || "/images/Ingperfil.png"}
                        alt="Perfil"
                        style={{ borderRadius: "6px", display: "block" }}
                        className="w-8 h-8 object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(110,189,233,0.7)" }}>{user.email}</p>
                    </div>
                  </div>

                  {/* Links */}
                  <nav className="flex flex-col p-2 gap-0.5">
                    {[
                      { href: "/dashboard",  label: "Dashboard",     icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
                      { href: "/cursos",     label: "Mis Cursos",    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
                      { href: "/community",  label: "Comunidad",     icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6"/><circle cx="16" cy="7" r="3"/><path d="M13 14c2.7.4 5 2.7 5 6"/></svg> },
                      { href: "/tools",      label: "Herramientas",  icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> },
                      { href: "/profile",    label: "Perfil",        icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
                      { href: "/settings",   label: "Configuración", icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
                    ].map(({ href, label, icon }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(110,189,233,0.10)"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
                      >
                        <span style={{ color: "#6EBDE9", flexShrink: 0 }}>{icon}</span>
                        {label}
                      </Link>
                    ))}

                    {/* Divider + Cerrar sesión */}
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
            ) : (
              <Link href="/login">
                <Button
                  className="border-0 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #6EBDE9 0%, #3b82f6 55%, #6366f1 100%)",
                    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                  }}
                >
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Mobile top bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-[60] lg:hidden" style={{
        background: showBg ? "rgba(14,30,54,0.72)" : "transparent",
        backdropFilter: showBg ? "blur(18px)" : "none",
        WebkitBackdropFilter: showBg ? "blur(18px)" : "none",
        transition: "background 0.35s ease",
      }}>
        <div className="relative h-16 w-full px-4 flex items-center border-b border-white/15">
          {/* Brand left */}
          <div className="flex items-center gap-0">
            <Link href="/" className="hn-ae" style={{ fontSize: 20 }}>AS</Link>
            <div className="hn-divider" style={{ margin: "0 8px" }} aria-hidden="true" />
            <AudioWaveButton />
          </div>
          {/* Hamburger right */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 rounded-md border border-white/20 bg-black/70 px-2.5 py-2 backdrop-blur-sm transition-colors hover:bg-black/90"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </header>

      {/* ─── Mobile overlay ─── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* ─── Mobile drawer ─── */}
      <nav
        className={`fixed top-0 right-0 h-full w-auto z-[70] bg-black/95 backdrop-blur-sm flex flex-col pt-20 pb-8 px-3 transition-transform duration-300 lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Menú móvil"
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-3 flex-1">
          {mobileMenuLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-label={link.label}
                className={`flex items-center justify-center rounded-md border px-4 py-4 transition-colors ${
                  active
                    ? "text-cyan-400 border-cyan-400/60 bg-cyan-400/10"
                    : "text-white/85 border-white/15 hover:text-white hover:border-white/40 hover:bg-white/5"
                }`}
              >
                <MobileMenuIcon href={link.href} />
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          {user && user.user_metadata ? (
            <>
              <Link href="/dashboard" onClick={closeMenu} className="flex items-center justify-center rounded-md border border-white/20 px-4 py-3 transition-colors hover:bg-white/10">
                <img
                  src={profileAvatarUrl || user.user_metadata.avatar_url || "/images/Ingperfil.png"}
                  alt="Perfil"
                  className="w-7 h-7 rounded-full object-cover border-2 border-cyan-400"
                />
              </Link>
              <form action={signout}>
                <button type="submit" className="w-full flex items-center justify-center rounded-md border border-red-500/40 px-4 py-3 text-red-400 transition-colors hover:bg-red-500/10">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" onClick={closeMenu} className="flex items-center justify-center rounded-md bg-cyan-500 px-4 py-3 text-white transition-colors hover:bg-cyan-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
