import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function AboutPage() {
  return (
    <div
      className="flex flex-col min-h-[calc(100vh-150px)] bg-gradient-to-b from-cyan-50 via-white to-cyan-100 py-40"
      style={{
        backgroundImage: 'url(/images/Fondos%20de%20marketing/Fondo_ATm.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <ScrollReveal delay={0.1}>
        <div className="mx-auto max-w-3xl bg-white/60 border border-cyan-300/40 rounded-2xl p-10 shadow-lg">
          <ScrollReveal delay={0.15}>
            <h1 className="text-5xl font-extrabold mb-8 text-slate-800 text-center">
              Sobre Nosotros
            </h1>
          </ScrollReveal>
          <div className="prose prose-gray max-w-none text-slate-700">
            <ScrollReveal delay={0.2}>
              <p className="text-lg mb-6">
                Somos una plataforma dedicada a la educación y capacitación de profesionales
                en ingeniería civil en la especialidad de Análisis Estructural.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Nuestra Misión</h2>
              <p>
                Proporcionar educación de calidad, herramientas profesionales y consultoría
                especializada para impulsar el desarrollo de ingenieros civiles en toda
                Latinoamérica.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Nuestro Equipo</h2>
              <p>
                Contamos con un equipo de instructores certificados con amplia experiencia
                en análisis estructural, diseño sísmico y más áreas de la
                ingeniería civil.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
