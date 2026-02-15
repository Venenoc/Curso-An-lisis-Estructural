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
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
              Domina el <br/>
              <span className="bg-gradient-to-r from-indigo-50 to-cyan-400 bg-clip-text text-transparent">
                Análisis Estructural
              </span>
              <br/>
              del Futuro
            </h1>
            <div className="bg-black/60 backdrop-blur-sm border border-cyan-400/50 rounded-xl px-6 py-4 max-w-2xl mx-auto mb-10">
              <p className="text-xl font-bold text-white leading-relaxed">
                Aprende los fundamentos, técnicas avanzadas y herramientas profesionales 
                del Análisis Estructural con instructores expertos
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="outline"className="border-2 border-white bg-blue-600 hover:bg-blue-700 hover:text-white transition-colors text-white px-8 py-5 text-lg">
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
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-0 mt-20 pt-6">
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
        </div>
      </section>

      <DividerLine />

      {/* Features Section */}
      <section 
        className="relative py-12"
        style={{
          backgroundImage: "url('/images/courses-section.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container pl-[100px]">
          <div className="text-left mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              ¿Qué aprenderás?
            </h2>
            <p className="text-xl font-bold text-white leading-relaxed">
              Contenido especializado en Análisis Estructural desde lo básico hasta lo avanzado
            </p>
          </div>
          <div className="max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
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
        </div>
      </section>

      <DividerLine />

      {/* CTA Section */}
      <section 
        className="relative py-32 overflow-hidden"
        style={{
          backgroundImage: "url('/images/cta-section.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container mx-auto flex items-center justify-center relative z-10">
          <div className="max-w-3xl text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Comienza tu Carrera en Análisis Estructural
            </h2>
            <p className="text-slate-300 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
              Únete a cientos de ingenieros y estudiantes que están dominando 
              el análisis estructural con nuestros cursos especializados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="outline"className="border-2 border-white bg-blue-600 hover:bg-blue-700 hover:text-white transition-colors text-white px-8 py-5 text-lg">
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
    </div>
  );
}
