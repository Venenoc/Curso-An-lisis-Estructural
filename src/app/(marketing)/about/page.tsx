import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acerca de',
  description: 'Conoce a Albert Structural, el ingeniero estructural detras de los mejores cursos de analisis estructural en espanol. Formacion practica y especializada.',
  alternates: { canonical: '/about' },
  openGraph: {
    url: '/about',
    title: 'Acerca de Albert Structural',
    description: 'Conoce la historia y metodologia detras de Albert Structural, formacion especializada en ingenieria estructural.',
  },
};

import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function AboutPage() {
  return (
    <div
      className="relative flex flex-col min-h-[calc(100vh-150px)] bg-gradient-to-b from-cyan-50 via-white to-cyan-100 py-40"
      style={{
        backgroundImage: `url(${process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL}/images/Fondos%20de%20marketing/Fondo_ATm.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
      <ScrollReveal delay={0.1} className="relative z-10 w-full">
        <div className="mx-auto max-w-3xl bg-white/60 border border-cyan-300/40 rounded-2xl p-10 shadow-lg">
          <ScrollReveal delay={0.15}>
            <h1 className="text-5xl font-extrabold mb-8 text-slate-800 text-center">
              Sobre mí
            </h1>
          </ScrollReveal>
          <div className="prose prose-gray max-w-none text-slate-700">
            <ScrollReveal delay={0.2}>
              <p className="text-lg mb-6">
                Soy Albert, ingeniero civil graduado de la UNI con experiencia en proyectos reales.
                Comencé a enseñar porque descubrí que explicar bien es la forma más poderosa de aprender profundo.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Mi Misión</h2>
              <p>
                Enseñar análisis estructural con lenguaje directo, ejemplos reales y sin rodeos.
                Quiero que tú avances más rápido de lo que yo lo hice, con formación práctica aplicable desde el primer día.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Mi Metodología</h2>
              <p>
                Cada curso que creo nace de lo que yo mismo necesité entender en la práctica.
                Rigor técnico, lenguaje accesible y casos reales — para estudiantes e ingenieros que buscan resultados concretos.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
