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
        backgroundImage: `url('/images/Fondos%20de%20marketing/Fondo_ATm.webp')`,
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
              Hola que tal, te saluda Albert_Structural, B.Sc de la carrera de Ingeniería Civil por la Universidad Nacional de Ingeniería. Tuve la oportunidad de ser parte de proyectos de investigación por el vicerrectorado de investigación UNI y llevar estos proyectos  a  diversos  congresos  nacionales  e  internacionales,  desarrollando  habilidades  de comunicación efectiva.
              Mi persona presenta interés en la rama de estructuras, por el cual voy desarrollándome en el ámbito del análisis, diseño y reforzamiento estructural, con el fin de seguir aprendiendo y aportando conocimientos y soluciones a las diversas situaciones que se presentan en la carrera profesional.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Mi Misión</h2>
              <p>
                El poder crear un espacio donde pueda compartir todo loa prendido en las aulas y en el trabajo, en donde te muestre una ruta de aprendizaje en el área de las estructuras, por medio de un contenido didáctico y de muy buena calidad. El poder dejar una huella en el tiempo con lo que he podido aprender y con los que seguiré aprendiendo con los años.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Mi Metodología</h2>
              <p>
                Siempre he creído que la mejor manera de aprender algo es enseñándolo, es por eso que soy un apasionado por compartir información al detalle, combinando la teoría que es importante en esta rama de las estructuras, así como la parte practica con ejemplos reales, creyendo que la persona que me escucha sabe poco o nada del tema, con el fin de brindarle una mejor experiencia académica.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
