"use client"

import Link from 'next/link'

const C = {
  bg: '#020817',
  surface: '#0f172a',
  border: 'rgba(255,255,255,0.06)',
}

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/cursos_m', label: 'Cursos' },
  { href: '/community_m', label: 'Comunidad' },
  { href: '/tools_m', label: 'Herramientas' },
  { href: '/contact', label: 'Contacto' },
]

const platformLinks = [
  { href: '/cursos_m', label: 'Catálogo de cursos' },
  { href: '/tools_m', label: 'Herramientas' },
  { href: '/pricing', label: 'Precios' },
  { href: '/community_m', label: 'Comunidad' },
]

type SocialName = 'youtube' | 'facebook' | 'instagram' | 'tiktok'

const socialLinks: Array<{ label: SocialName; href: string }> = [
  { label: 'youtube', href: '#' },
  { label: 'facebook', href: 'https://www.facebook.com/profile.php?id=61582218750722' },
  { label: 'instagram', href: '#' },
  { label: 'tiktok', href: 'https://www.tiktok.com/@albert_structural' },
]

function SocialIcon({ name }: { name: SocialName }) {
  if (name === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8ZM9.7 14.5v-5.6l5.5 2.8-5.5 2.8Z" />
      </svg>
    )
  }

  if (name === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.6v8h2.9Z" />
      </svg>
    )
  }

  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm4.75-3a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
      </svg>
    )
  }

  // tiktok
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
      <path d="M14.8 3h2.7c.2 1 .9 2.1 1.7 2.8.9.8 2 1.2 3.1 1.3V10a8 8 0 0 1-4.8-1.6v6.3c0 1.6-.6 3.1-1.7 4.2-1.1 1.1-2.6 1.7-4.2 1.7s-3.1-.6-4.2-1.7c-1.1-1.1-1.7-2.6-1.7-4.2s.6-3.1 1.7-4.2c1.1-1.1 2.6-1.7 4.2-1.7.4 0 .8 0 1.2.1v3.1a3 3 0 0 0-1.2-.2 2.9 2.9 0 0 0-2 .8 2.9 2.9 0 0 0-.8 2 2.9 2.9 0 0 0 .8 2 2.9 2.9 0 0 0 2 .8 2.9 2.9 0 0 0 2-.8 2.9 2.9 0 0 0 .8-2V3Z" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative z-10 border-t pt-12 pb-4 px-4 text-white sm:px-6 md:pt-10 opacity-80"
      style={{ borderColor: C.border, background: C.bg }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 md:mb-14">

          {/* Branding */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-0 mb-5">
              <Link href="/" aria-label="Inicio" style={{
                fontFamily: "var(--font-orbitron), 'Orbitron', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                letterSpacing: '0.04em',
                background: 'linear-gradient(135deg, #e2eaf4 0%, #7cb9e8 50%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textDecoration: 'none',
                lineHeight: 1,
                paddingRight: '12px',
              }}>
                AE
              </Link>
              <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.22)', margin: '0 10px', flexShrink: 0 }} />
              <span style={{
                color: 'rgba(255,255,255,0.8)',
                fontFamily: "var(--font-sans), system-ui, sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                @Albert_Structural
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/35">
              Aprende análisis estructural con cursos prácticos y herramientas especializadas.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-blue-400">Navegación</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors text-white/35 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-blue-400">Plataforma</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors text-white/35 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-blue-400">Redes</h4>
            <div className="flex flex-wrap gap-2 mb-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all hover:bg-white hover:text-black"
                  style={{ background: C.surface, borderColor: C.border, color: 'rgba(255,255,255,0.35)' }}
                >
                  <SocialIcon name={social.label} />
                </a>
              ))}
            </div>
            <p className="text-xs text-white/35">Lima, Perú</p>
            <p className="text-xs mt-1 text-white/35">contacto@albertstructural.com</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t pt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
          style={{ borderColor: C.border }}
        >
          <p className="text-xs text-white/35">
            © {year} Albert_Structural Academy. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacidad" className="text-xs transition-colors text-white/35 hover:text-white">
              Política de privacidad
            </Link>
            <Link href="/terminos" className="text-xs transition-colors text-white/35 hover:text-white">
              Términos y condiciones
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs transition-colors text-white/35 hover:text-white uppercase tracking-widest"
            >
              ↑ Inicio
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
