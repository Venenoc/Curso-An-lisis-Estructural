"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Calculator, BarChart3, Layers } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const statItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const DividerLine = () => (
  <div className="relative h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent overflow-hidden -mt-12">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse"></div>
  </div>
);

export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Loader de pantalla completa */}
      {!videoLoaded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundImage: 'url(/images/Fondos%20de%20marketing/Fondo_ATm.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent border-b-blue-400 border-r-cyan-200 rounded-full animate-spin shadow-lg bg-white/80"></div>
            <span className="text-cyan-700 font-bold text-lg flex items-center gap-2">
              <span>Preparando la plataforma</span>
              <span className="text-2xl">🔧</span>
            </span>
          </div>
        </div>
      )}
      {/* Video de fondo solo en la sección principal */}
      <main className="relative w-full z-10">
        {/* Sección única fusionada */}
        <section className="relative pt-32 lg:pt-44 pb-10 lg:pb-5 flex flex-col items-center justify-center overflow-hidden">
          <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" style={{maxHeight: '100vh'}}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{maxHeight: '100vh'}}
              onCanPlayThrough={() => setVideoLoaded(true)}
            >
              <source src="https://egeyywlbbckdpoxtmznv.supabase.co/storage/v1/object/public/course-videos/Fondo4.mp4" type="video/mp4" />
              Tu navegador no soporta el video de fondo.
            </video>
          </div>
          {videoLoaded && <div className="container relative z-10">
            {/* HERO */}
            <div className="pt-10 mx-auto max-w-4xl text-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.3}
                className="bg-slate-900/50 backdrop-blur-sm rounded-2xl px-10 py-4 w-full max-w-4xl mx-auto flex flex-col items-center justify-center mb-16 mt-8"
              >
                <span
                  className="mb-6 bg-gradient-to-r from-indigo-50 to-cyan-400 bg-clip-text text-transparent text-4xl lg:text-8xl font-bold tracking-tight py-2"
                  style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}
                >
                  @Albert_Structural
                </span>
                <p className="text-2xl font-semibold text-white leading-relaxed mb-8">
                  "La mejor manera de aprender es enseñando"
                </p>
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-9 py-5 text-lg rounded-xl shadow-lg shadow-cyan-500/30 border-0 transition-all duration-200 hover:scale-105 hover:shadow-cyan-400/40">
                      Comenzar Ahora
                    </Button>
                  </Link>
                  <Link href="/cursos_m">
                    <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/40 hover:border-white/70 text-white font-semibold px-9 py-5 text-lg rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105">
                      Ver Cursos
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Stats in Hero */}
              <motion.div
                className="flex flex-col sm:flex-row justify-center items-stretch gap-0 mt-10 pt-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={staggerContainer}
              >
                {[
                  { value: "1000+", label: "Estudiantes" },
                  { value: "30+", label: "Cursos" },
                  { value: "80+", label: "Horas" },
                  { value: "24/7", label: "Acceso" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={statItem}
                    className="flex-1 px-6 py-4 border-l-2 border-r-2 border-blue-400/60 bg-slate-900/40 backdrop-blur-sm"
                  >
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-300 text-sm mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ¿QUÉ APRENDERÁS? */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={0}
              className="text-center mt-20"
            >
              <h2 className="text-4xl lg:text-6xl font-bold mb-4 text-white">
                ¿Qué aprenderás?
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={0.15}
              className="bg-slate-900/50 backdrop-blur-sm border border-white rounded-xl px-12 py-3 max-w-4xl mx-auto mt-10 mb-10"
            >
              <p className="text-xl font-semibold text-slate-200 leading-relaxed">
                Contenido especializado en Análisis Estructural desde lo básico hasta lo avanzado
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto mb-10">
              <div className="grid md:grid-cols-2 gap-12 mb-24">
                {[
                  {
                    delay: 0,
                    icon: <Calculator className="w-6 h-6 text-blue-400" />,
                    iconBg: "bg-blue-500/20",
                    title: "Métodos Matriciales",
                    desc: "Análisis de estructuras con métodos computacionales",
                    body: "Domina el análisis matricial de estructuras, rigidez directa y métodos numéricos aplicados a la ingeniería estructural.",
                  },
                  {
                    delay: 0.15,
                    icon: <Layers className="w-6 h-6 text-cyan-400" />,
                    iconBg: "bg-cyan-500/20",
                    title: "Elementos Finitos",
                    desc: "Modelado y análisis con software especializado",
                    body: "Aprende a usar SAP2000, ETABS y otros software para el modelado y análisis avanzado de estructuras complejas.",
                  },
                  {
                    delay: 0.3,
                    icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
                    iconBg: "bg-purple-500/20",
                    title: "Análisis Dinámico",
                    desc: "Comportamiento sísmico y cargas dinámicas",
                    body: "Estudia el comportamiento de estructuras ante cargas sísmicas, viento y otras acciones dinámicas.",
                  },
                ].map((card) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.75, ease: EASE, delay: card.delay }}
                  >
                    <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm hover:bg-slate-900/80 transition-all">
                      <CardHeader>
                        <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                          {card.icon}
                        </div>
                        <CardTitle className="text-white">{card.title}</CardTitle>
                        <CardDescription className="text-slate-400">{card.desc}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-slate-300">{card.body}</CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={0}
              className="max-w-4xl text-center mx-auto mt-10"
            >
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl px-10 py-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center mb-24">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white text-center">
                  Comienza tu Carrera en el Análisis y Diseño Estructural
                </h2>
                <p className="text-xl font-semibold text-slate-200 leading-relaxed mb-8 text-center">
                  Únete a cientos de ingenieros y estudiantes que están dominando el análisis estructural con nuestros cursos especializados
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-9 py-5 text-lg rounded-xl shadow-lg shadow-cyan-500/30 border-0 transition-all duration-200 hover:scale-105 hover:shadow-cyan-400/40">
                      Registrarse Gratis
                    </Button>
                  </Link>
                  <Link href="/cursos_m">
                    <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/40 hover:border-white/70 text-white font-semibold px-9 py-5 text-lg rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105">
                      Ver Todos los Cursos
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          }
        </section>
      </main>


    </div>
  );
}
