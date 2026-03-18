"use client";

import { MessageCircle, Users, Star, HeartHandshake, Award, Lightbulb } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function CommunityLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100">
      {/* Banner principal */}
      <section
        className="w-full relative pt-60 py-20 px-4 text-center shadow-lg flex items-center justify-center min-h-[400px]"
        style={{
          backgroundImage: `url('/images/Fondos%20de%20marketing/Fondo_comm.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <ScrollReveal delay={0.1} className="relative z-10 w-full">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-800 mb-20 drop-shadow-lg px-4 rounded">
            La Comunidad de <br />
            <span className="block mt-8">{"Análisis Estructural más Activa"}</span>
          </h1>
          <p className="text-xl text-cyan-900 max-w-2xl mx-auto mb-20 px-4 rounded">
            Conecta, aprende y crece junto a miles de ingenieros y estudiantes. Publicaciones, chats,
            mentoría, eventos y mucho más en un solo lugar.
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-cyan-700 font-bold px-8 py-4 rounded-full shadow-lg mb-20 mt-10 text-lg hover:bg-cyan-50 transition"
          >
            {"Únete Aquí"}
          </a>
        </ScrollReveal>
      </section>

      {/* Sección de beneficios */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl font-bold text-cyan-700 text-center mb-12">
            {"¿Qué encontrarás en nuestra comunidad?"}
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <MessageCircle className="w-12 h-12 text-cyan-500 mb-2" />,
              title: "Publicaciones y Foros",
              desc: "Comparte tus dudas, experiencias y proyectos. Recibe retroalimentación de la comunidad.",
            },
            {
              icon: <Users className="w-12 h-12 text-cyan-500 mb-2" />,
              title: "Chats y Mensajes Directos",
              desc: "Conversa en tiempo real con otros miembros, crea grupos de estudio y haz networking profesional.",
            },
            {
              icon: <Star className="w-12 h-12 text-cyan-500 mb-2" />,
              title: "Reconocimientos y Logros",
              desc: "Gana medallas y premios por tu participación, ayuda y aportes destacados.",
            },
            {
              icon: <HeartHandshake className="w-12 h-12 text-cyan-500 mb-2" />,
              title: "Colaboración y Mentoría",
              desc: "Encuentra mentores, colabora en proyectos y resuelve retos junto a otros ingenieros.",
            },
            {
              icon: <Award className="w-12 h-12 text-cyan-500 mb-2" />,
              title: "Eventos y Webinars",
              desc: "Participa en eventos exclusivos, webinars y masterclasses con expertos del sector.",
            },
            {
              icon: <Lightbulb className="w-12 h-12 text-cyan-500 mb-2" />,
              title: "Ideas y Tendencias",
              desc: "Mantente actualizado con las últimas tendencias, ideas y novedades en ingeniería civil.",
            },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={Math.min(i * 0.08, 0.3)} scale>
              <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100 h-full">
                {item.icon}
                <h3 className="text-xl font-bold text-cyan-700 mb-1">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl font-bold text-cyan-700 text-center mb-12">
            Testimonios de la comunidad
          </h2>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal delay={0} scale>
            <div className="bg-white/90 rounded-2xl shadow p-8 border border-cyan-100">
              <p className="text-slate-700 italic mb-4">
                &ldquo;Gracias a la comunidad, resolví dudas complejas y encontré colegas con los que
                ahora colaboro en proyectos reales.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">👷‍♂️</span>
                <div>
                  <div className="font-bold text-cyan-700">Carlos Mendoza</div>
                  <div className="text-slate-500 text-sm">Ingeniero Estructural</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.12} scale>
            <div className="bg-white/90 rounded-2xl shadow p-8 border border-cyan-100">
              <p className="text-slate-700 italic mb-4">
                &ldquo;Los eventos y webinars me han permitido aprender de expertos y mantenerme
                actualizado en mi área.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">👷‍♀️</span>
                <div>
                  <div className="font-bold text-cyan-700">Ana Torres</div>
                  <div className="text-slate-500 text-sm">Estudiante de Ingeniería Civil</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full py-16 px-4 text-center">
        <ScrollReveal delay={0.1}>
          <h2 className="text-3xl font-bold text-cyan-700 mb-6">
            {"¿Listo para formar parte?"}
          </h2>
          <a
            href="/community"
            className="inline-block bg-white text-cyan-700 font-bold px-8 py-4 rounded-full shadow-lg mb-20 mt-10 text-lg hover:bg-cyan-50 transition"
          >
            Suscribete y accede
          </a>
        </ScrollReveal>
      </section>
    </div>
  );
}
