"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Calculator, BarChart3, Layers } from "lucide-react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-cyan-50 via-white to-cyan-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent border-b-blue-400 border-r-cyan-200 rounded-full animate-spin shadow-lg bg-white/80"></div>
            <span className="text-cyan-700 font-bold text-lg flex items-center gap-2">
              <span>Preparando la plataforma</span>
              <span className="text-2xl">🔧</span>
            </span>
            <img src="/images/Ingeniero.gif" alt="Cargando construcción" className="w-32 h-24 object-contain mt-2 rounded" />
          </div>
        </div>
      )}
      {/* Video de fondo solo en la sección principal */}
      <main className="relative w-full z-10">
        {/* Sección única fusionada */}
        <section className="relative py-20 lg:py-32 flex flex-col items-center justify-center overflow-hidden">
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
              <source src="/images/Fondo2.mp4" type="video/mp4" />
              Tu navegador no soporta el video de fondo.
            </video>
          </div>
          <div className="container relative z-10">
            {/* HERO */}
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
                Domina el <br/>
                <span className="bg-gradient-to-r from-indigo-50 to-cyan-400 bg-clip-text text-transparent">
                  Análisis Estructural
                </span>
                <br/>
                del Futuro
              </h1>
              <div className="bg-slate-900/40 backdrop-blur-sm border border-white rounded-xl px-6 py-6 max-w-2xl mx-auto mt-20 mb-20">
                <p className="text-xl font-semibold text-white leading-relaxed">
                  Aprende los fundamentos, técnicas avanzadas y herramientas profesionales 
                  del Análisis Estructural con instructores expertos
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 mt-8">
                <Link href="/register">
                  <Button size="lg" variant="outline"className="border-2 border-white bg-blue-400/60 hover:bg-black-700 hover:text-white transition-colors text-black px-8 py-5 text-lg">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link href="/cursos_m">
                  <Button size="lg" variant="outline" className="border-2 bg-black/30 border-white text-white hover:bg-black/50 hover:text-white transition-colors px-8 py-5 text-lg">
                    Ver Cursos
                  </Button>
                </Link>
              </div>
              {/* Stats in Hero */}
              <div className="flex flex-col sm:flex-row justify-center items-stretch gap-0 mt-20 pt-10 pb-10">
                <div className="flex-1 px-6 py-4 border-l-2 border-r-2 border-blue-400/60 bg-slate-900/40 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-white">1000+</div>
                  <div className="text-slate-300 text-sm mt-1">Estudiantes</div>
                </div>
                <div className="flex-1 px-6 py-4 border-l-2 border-r-2 border-blue-400/60 bg-slate-900/40 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-white">30+</div>
                  <div className="text-slate-300 text-sm mt-1">Cursos</div>
                </div>
                <div className="flex-1 px-6 py-4 border-l-2 border-r-2 border-blue-400/60 bg-slate-900/40 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-white">80+</div>
                  <div className="text-slate-300 text-sm mt-1">Horas</div>
                </div>
                <div className="flex-1 px-6 py-4 border-l-2 border-r-2 border-blue-400/60 bg-slate-900/40 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-slate-300 text-sm mt-1">Acceso</div>
                </div>
              </div>
            </div>
            {/* ¿QUÉ APRENDERÁS? */}
            <div className="text-center mb-24 mt-32">
              <h2 className="text-4xl lg:text-6xl font-bold mb-4 text-white">
                ¿Qué aprenderás?
              </h2>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm border border-white rounded-xl px-12 py-3 max-w-4xl mx-auto mt-20 mb-20">
              <p className="text-xl font-semibold text-white leading-relaxed">
                Contenido especializado en Análisis Estructural desde lo básico hasta lo avanzado
              </p>
            </div>
            <div className="max-w-6xl mx-auto mb-24">
              <div className="grid md:grid-cols-2 gap-12 mb-24">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Calculator className="w-6 h-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-white">Métodos Matriciales</CardTitle>
                    <CardDescription className="text-slate-400">
                      Análisis de estructuras con métodos computacionales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-slate-300">
                    Domina el análisis matricial de estructuras, rigidez directa y 
                    métodos numéricos aplicados a la ingeniería estructural.
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Layers className="w-6 h-6 text-cyan-400" />
                    </div>
                    <CardTitle className="text-white">Elementos Finitos</CardTitle>
                    <CardDescription className="text-slate-400">
                      Modelado y análisis con software especializado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-slate-300">
                    Aprende a usar SAP2000, ETABS y otros software para el modelado 
                    y análisis avanzado de estructuras complejas.
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <CardTitle className="text-white">Análisis Dinámico</CardTitle>
                    <CardDescription className="text-slate-400">
                      Comportamiento sísmico y cargas dinámicas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-slate-300">
                    Estudia el comportamiento de estructuras ante cargas sísmicas, 
                    viento y otras acciones dinámicas.
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* CTA */}
            <div className="max-w-3xl text-center mx-auto mt-32 mb-24">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                Comienza tu Carrera en Análisis Estructural
              </h2>
              <div className="bg-slate-900/40 backdrop-blur-sm border border-white rounded-xl px-6 py-4 max-w-4xl mx-auto mt-20 mb-20">
                <p className="text-xl font-semibold text-white leading-relaxed">
                  Únete a cientos de ingenieros y estudiantes que están dominando 
                  el análisis estructural con nuestros cursos especializados
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 justify-center mt-8 mb-8">
                <Link href="/register">
                  <Button size="lg" variant="outline"className="border-2 border-white bg-blue-400/60 hover:bg-black-700 hover:text-white transition-colors text-black px-8 py-5 text-lg">
                    Registrarse Gratis
                  </Button>
                </Link>
                <Link href="/cursos_m">
                  <Button size="lg" variant="outline" className="border-2 bg-black/30 border-white text-white hover:bg-black/50 hover:text-white transition-colors px-8 py-5 text-lg">
                    Ver Todos los Cursos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}
