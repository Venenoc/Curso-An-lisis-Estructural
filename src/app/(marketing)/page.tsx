"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calculator, BarChart3, Layers, Users, BookOpen, Clock, Zap } from "lucide-react";
import Image from "next/image";
import { palette, gradients } from "@/lib/palette";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 1, ease: EASE, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const statItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: EASE } },
};

// ── Count-up animado ─────────────────────────────────────────────────────────
function CountUp({ target, suffix }: { target: number | null; suffix: string; display?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || target === null) return;
    const duration = 1600;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const eased = Math.round(target * (1 - Math.pow(1 - current / steps, 3)));
      setCount(eased);
      if (current >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {target === null ? suffix : `${count}${suffix}`}
    </span>
  );
}

const STATS = [
  { num: 1000, suffix: "+",   label: "Estudiantes", icon: Users },
  { num: 30,   suffix: "+",   label: "Cursos",      icon: BookOpen },
  { num: 80,   suffix: "+",   label: "Horas",       icon: Clock },
  { num: null, suffix: "24/7",label: "Acceso",      icon: Zap },
];

const MARQUEE_TAGS = [
  "Análisis Estructural",
  "Métodos Matriciales",
  "Elementos Finitos",
  "SAP2000",
  "ETABS",
  "Análisis Sísmico",
  "Rigidez Directa",
  "Diseño Estructural",
  "Cargas Dinámicas",
  "Modelado 3D",
];

const CARDS = [
  {
    delay: 0,
    icon: <Calculator className="w-5 h-5" style={{ color: palette.steel }} />,
    accent: palette.steel,
    title: "Métodos Matriciales",
    desc: "Análisis de estructuras con métodos computacionales",
    body: "Domina el análisis matricial de estructuras, rigidez directa y métodos numéricos aplicados a la ingeniería estructural.",
  },
  {
    delay: 0.12,
    icon: <Layers className="w-5 h-5" style={{ color: palette.cyan }} />,
    accent: palette.cyan,
    title: "Elementos Finitos",
    desc: "Modelado y análisis con software especializado",
    body: "Aprende a usar SAP2000, ETABS y otros software para el modelado y análisis avanzado de estructuras complejas.",
  },
  {
    delay: 0.24,
    icon: <BarChart3 className="w-5 h-5" style={{ color: palette.indigo }} />,
    accent: palette.indigo,
    title: "Análisis Dinámico",
    desc: "Comportamiento sísmico y cargas dinámicas",
    body: "Estudia el comportamiento de estructuras ante cargas sísmicas, viento y otras acciones dinámicas.",
  },
];

const TESTIMONIALS = [
  {
    name: "Carlos Mendoza",
    role: "Ingeniero Civil, Lima",
    quote: "Los cursos de Albert me ayudaron a entender el análisis matricial de una forma que nunca encontré en la universidad. Directo, claro y aplicable desde el primer día.",
  },
  {
    name: "Valeria Torres",
    role: "Estudiante de Ingeniería, Arequipa",
    quote: "En pocas semanas avancé más que en todo un semestre. La metodología práctica hace que conceptos difíciles sean completamente comprensibles.",
  },
  {
    name: "Diego Quispe",
    role: "Proyectista Estructural, Cusco",
    quote: "Uso SAP2000 a diario y gracias a estos cursos finalmente entiendo qué hace el software por dentro. Una inversión que vale cada sol.",
  },
];

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Si el splash ya corrió en esta sesión, activar de inmediato
    if (sessionStorage.getItem("splash:done")) {
      setSplashDone(true);
      return;
    }
    const handler = () => {
      sessionStorage.setItem("splash:done", "1");
      setSplashDone(true);
    };
    window.addEventListener("splash:done", handler);
    return () => window.removeEventListener("splash:done", handler);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="relative w-full z-10">
        <section className="relative min-h-screen flex flex-col overflow-hidden">

          {/* ── Video fondo ── */}
          <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover"
              onCanPlayThrough={() => {
                window.dispatchEvent(new Event("splash:video-ready"));
              }}
            >
              <source src="https://egeyywlbbckdpoxtmznv.supabase.co/storage/v1/object/public/course-videos/Fondo4.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0"
              style={{ background: `rgba(0,0,0,0.10)` }} />
          </div>

          <div className="relative z-10 w-full px-6 lg:px-16 xl:px-24 pt-28 lg:pt-32 pb-16">

              {/* ── Badge ── */}
              <motion.div
                initial="hidden"
                animate={splashDone ? "visible" : "hidden"}
                variants={fadeUp} custom={0}
                className="flex justify-center mt-20 mb-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                  style={{
                    background: `${palette.slate}99`,
                    border: `1px solid ${palette.steel}44`,
                    color: palette.steel,
                    backdropFilter: "blur(12px)",
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: palette.cyan, display: "inline-block" }} />
                  Plataforma de Análisis Estructural
                </div>
              </motion.div>

              {/* ── Título principal (ancho completo, centrado) ── */}
              <motion.h1
                initial="hidden"
                animate={splashDone ? "visible" : "hidden"}
                variants={fadeUp} custom={0.1}
                className="text-center font-bold tracking-tight leading-none mt-20 mb-20"
                style={{
                  fontFamily: "var(--font-orbitron), 'Orbitron', system-ui, sans-serif",
                  fontSize: "clamp(40px, 7.5vw, 110px)",
                  letterSpacing: "0.02em",
                  color: "#ffffff",
                }}
              >
                @Albert_Structural
              </motion.h1>

              {/* ── 2 columnas: frase+botones | stats ── */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">

                {/* Columna izquierda */}
                <motion.div
                  initial="hidden"
                  animate={splashDone ? "visible" : "hidden"}
                  variants={fadeUp} custom={0.2}
                >
                  <p className="text-2xl lg:text-4xl font-light leading-snug mt-20 mb-10"
                    style={{ color: "#ffffff" }}>
                    &ldquo;La mejor manera de<br />
                    aprender es enseñando&rdquo;
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/register">
                      <Button size="lg"
                        className="font-semibold px-10 py-6 text-base rounded-xl border-0 transition-all duration-200 hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${palette.steel} 0%, ${palette.blue} 55%, ${palette.indigo} 100%)`,
                          color: "#fff",
                          boxShadow: `0 8px 32px ${palette.blue}50`,
                        }}>
                        Comenzar Ahora
                      </Button>
                    </Link>
                    <Link href="/cursos_m">
                      <Button size="lg"
                        className="font-semibold px-10 py-6 text-base rounded-xl transition-all duration-200 hover:scale-105"
                        style={{
                          background: `${palette.slate}55`,
                          border: `1px solid ${palette.steel}44`,
                          color: palette.ice,
                          backdropFilter: "blur(12px)",
                        }}>
                        Ver Cursos
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Columna derecha: stat cards en fila horizontal */}
                <motion.div
                  className="flex flex-row justify-end items-end gap-3 mt-auto pt-20"
                  initial="hidden"
                  animate={splashDone ? "visible" : "hidden"}
                  variants={staggerContainer}
                >
                  {STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        variants={statItem}
                        className="relative rounded-xl px-3 py-3 flex flex-col items-center gap-1.5 overflow-hidden"
                        style={{
                          background: `${palette.slate}55`,
                          border: `1px solid ${palette.steel}44`,
                          backdropFilter: "blur(12px)",
                          minWidth: "80px",
                        }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-px"
                          style={{ background: `linear-gradient(90deg, transparent, ${palette.steel}55, transparent)` }} />

                        <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center"
                          style={{ background: `${palette.steel}18`, border: `1px solid ${palette.steel}33` }}>
                          <Icon className="w-3 h-3" style={{ color: palette.steel }} />
                        </div>

                        <span className="text-lg font-bold leading-none"
                          style={{
                            background: `linear-gradient(135deg, ${palette.ice}, ${palette.steel})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontFamily: "var(--font-orbitron), system-ui",
                          }}>
                          <CountUp target={stat.num} suffix={stat.suffix} />
                        </span>
                        <span className="text-[10px] font-medium tracking-widest uppercase text-center"
                          style={{ color: "#ffffff" }}>
                          {stat.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* ── MARQUEE ── */}
              <div
                className="overflow-hidden py-3 sm:py-4 mb-10"
                style={{
                  borderTop: `1px solid rgba(110,189,233,0.12)`,
                  borderBottom: `1px solid rgba(110,189,233,0.12)`,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex w-max gap-8 whitespace-nowrap sm:gap-14"
                  style={{ animation: "marquee 28s linear infinite" }}>
                  {[...MARQUEE_TAGS, ...MARQUEE_TAGS].map((tag, i) => (
                    <span key={i} className="flex items-center gap-8 sm:gap-14"
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#ffffff",
                      }}>
                      {tag}
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: palette.steel, opacity: 0.5, display: "inline-block", flexShrink: 0 }} />
                    </span>
                  ))}
                </div>
              </div>

              {/* ── SOBRE NOSOTROS ── */}
              <div className="py-16 md:py-24 mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                  {/* Texto */}
                  <motion.div
                    key={`about-${splashDone}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={fadeUp}
                    custom={0}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 block"
                      style={{ color: palette.steel }}>
                      Sobre Nosotros
                    </span>
                    <h2 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-0 tracking-tight text-white">
                      Aprender estructuras
                    </h2>
                    <h2 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-8 tracking-tight text-white">
                      con quién las vive.
                    </h2>
                    <p className="text-lg leading-relaxed mb-6 text-white/80">
                      Soy Albert, ingeniero civil graduado de la UNI con experiencia en proyectos reales. Comencé a enseñar porque descubrí que explicar bien es la forma más poderosa de aprender profundo.
                    </p>
                    <p className="text-base leading-relaxed mb-10 text-white/80">
                      Cada curso que creo nace de lo que yo mismo necesité entender. Con lenguaje directo, ejemplos reales y sin rodeos — para que tú avances más rápido de lo que yo lo hice.
                    </p>
                    <Link href="/about">
                      <Button
                        className="font-semibold px-8 py-5 text-base rounded-xl border-0 transition-all duration-200 hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${palette.steel} 0%, ${palette.blue} 55%, ${palette.indigo} 100%)`,
                          color: "#fff",
                          boxShadow: `0 8px 32px ${palette.blue}40`,
                        }}>
                        Conoce más
                      </Button>
                    </Link>
                  </motion.div>

                  {/* Imagen */}
                  <motion.div
                    key={`about-img-${splashDone}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={fadeUp}
                    custom={0.15}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                    style={{ border: `1px solid ${palette.slate}88` }}
                  >
                    <Image
                      src="/images/Albert.jpg"
                      alt="Albert Structural"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* Overlay degradado */}
                    <div className="absolute inset-0"
                      style={{ background: `linear-gradient(135deg, ${palette.navy}44 0%, transparent 60%)` }} />
                  </motion.div>

                </div>
              </div>

              {/* ── QUÉ APRENDERÁS ── */}
              <motion.div
                key={`learn-${splashDone}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={0}
                className="text-center mb-10"
              >
                <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: palette.steel }}>
                  Contenido del programa
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  ¿Qué aprenderás?
                </h2>
                <p className="text-base max-w-xl mx-auto" style={{ color: `${palette.ice}88` }}>
                  Contenido especializado en Análisis Estructural desde lo básico hasta lo avanzado
                </p>
              </motion.div>

              {/* ── CARDS ── */}
              <div key={`cards-${splashDone}`} className="grid md:grid-cols-3 gap-5 mb-24">
                {CARDS.map((card) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1, ease: EASE, delay: card.delay }}
                    className="group relative rounded-2xl p-6 overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                    style={{
                      background: `${palette.slate}55`,
                      border: `1px solid ${palette.steel}44`,
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${card.accent}18 0%, transparent 70%)` }} />
                    <div className="absolute top-0 left-6 right-6 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${card.accent}88, transparent)` }} />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                        style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}33` }}>
                        {card.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                      <p className="text-sm mb-3" style={{ color: palette.steel }}>{card.desc}</p>
                      <p className="text-sm leading-relaxed" style={{ color: `${palette.ice}77` }}>{card.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── TESTIMONIOS ── */}
              <motion.div
                key={`testi-${splashDone}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={0}
                className="text-center mb-10"
              >
                <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: palette.steel }}>
                  Lo que dicen mis alumnos
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Testimonios
                </h2>
              </motion.div>

              <div key={`testi-cards-${splashDone}`} className="grid md:grid-cols-3 gap-5 mb-24">
                {TESTIMONIALS.map((t: typeof TESTIMONIALS[number], i: number) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1, ease: EASE, delay: i * 0.12 }}
                    className="relative rounded-2xl p-6 overflow-hidden"
                    style={{
                      background: `${palette.slate}55`,
                      border: `1px solid ${palette.steel}44`,
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div className="absolute top-0 left-6 right-6 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${palette.steel}66, transparent)` }} />
                    {/* Estrellas */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg key={s} className="w-4 h-4" fill={palette.steel} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: `${palette.ice}99` }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: `linear-gradient(135deg, ${palette.steel}, ${palette.blue})`, color: "#fff" }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        <p className="text-xs" style={{ color: palette.steel }}>{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── CTA FINAL ── */}
              <motion.div
                key={`cta-${splashDone}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={0}
                className="mb-24"
              >
                <div className="relative rounded-2xl px-8 py-14 text-center overflow-hidden"
                  style={{
                    background: `${palette.slate}55`,
                    border: `1px solid ${palette.steel}44`,
                    backdropFilter: "blur(20px)",
                  }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${palette.steel}88, transparent)` }} />
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${palette.blue}11 0%, transparent 60%)` }} />
                  <div className="relative z-10">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                      Comienza tu Carrera en el<br />
                      <span style={{ background: gradients.brand, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        Análisis Estructural
                      </span>
                    </h2>
                    <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: `${palette.ice}88` }}>
                      Únete a cientos de ingenieros y estudiantes que están dominando el análisis estructural
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/register">
                        <Button size="lg"
                          className="font-semibold px-8 py-5 text-base rounded-xl border-0 transition-all duration-200 hover:scale-105"
                          style={{ background: gradients.bar, color: "#fff", boxShadow: `0 8px 32px ${palette.cyan}33` }}>
                          Registrarse Gratis
                        </Button>
                      </Link>
                      <Link href="/cursos_m">
                        <Button size="lg"
                          className="font-semibold px-8 py-5 text-base rounded-xl transition-all duration-200 hover:scale-105"
                          style={{
                            background: `${palette.slate}55`,
                            border: `1px solid ${palette.steel}44`,
                            color: palette.ice,
                            backdropFilter: "blur(12px)",
                          }}>
                          Ver Todos los Cursos
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
        </section>
      </main>
    </div>
  );
}
