"use client";

import { MessageCircle, Users, Star, HeartHandshake, Award, Rocket, Lightbulb } from "lucide-react";

export default function CommunityLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100">
      {/* Banner principal */}
      <section
        className="w-full relative pt-60 py-20 px-4 text-center shadow-lg flex items-center justify-center min-h-[400px]"
        style={{
          backgroundImage: "url('/images/Fondo_comm.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="relative z-10 w-full">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-cyan-900 mb-20 drop-shadow-lg px-4 rounded">
            La Comunidad de <br />
            <span className="block mt-8">Análisis Estructural más Activa</span>
          </h1>
          <p className="text-xl text-cyan-900 max-w-2xl mx-auto mb-20 px-4 rounded">Conecta, aprende y crece junto a miles de ingenieros y estudiantes. Publicaciones, chats, mentoría, eventos y mucho más en un solo lugar.</p>
          <a href="/register" className="inline-block bg-cyan-700 text-white font-bold px-8 py-4 rounded-full shadow-lg text-lg hover:bg-cyan-800 transition">Únete Aquí</a>
        </div>
      </section>

      {/* Sección de beneficios */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-cyan-700 text-center mb-12">¿Qué encontrarás en nuestra comunidad?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100">
            <MessageCircle className="w-12 h-12 text-cyan-500 mb-2" />
            <h3 className="text-xl font-bold text-cyan-700 mb-1">Publicaciones y Foros</h3>
            <p className="text-slate-600">Comparte tus dudas, experiencias y proyectos. Recibe retroalimentación de la comunidad.</p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100">
            <Users className="w-12 h-12 text-cyan-500 mb-2" />
            <h3 className="text-xl font-bold text-cyan-700 mb-1">Chats y Mensajes Directos</h3>
            <p className="text-slate-600">Conversa en tiempo real con otros miembros, crea grupos de estudio y haz networking profesional.</p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100">
            <Star className="w-12 h-12 text-cyan-500 mb-2" />
            <h3 className="text-xl font-bold text-cyan-700 mb-1">Reconocimientos y Logros</h3>
            <p className="text-slate-600">Gana medallas y premios por tu participación, ayuda y aportes destacados.</p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100">
            <HeartHandshake className="w-12 h-12 text-cyan-500 mb-2" />
            <h3 className="text-xl font-bold text-cyan-700 mb-1">Colaboración y Mentoría</h3>
            <p className="text-slate-600">Encuentra mentores, colabora en proyectos y resuelve retos junto a otros ingenieros.</p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100">
            <Award className="w-12 h-12 text-cyan-500 mb-2" />
            <h3 className="text-xl font-bold text-cyan-700 mb-1">Eventos y Webinars</h3>
            <p className="text-slate-600">Participa en eventos exclusivos, webinars y masterclasses con expertos del sector.</p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100">
            <Lightbulb className="w-12 h-12 text-cyan-500 mb-2" />
            <h3 className="text-xl font-bold text-cyan-700 mb-1">Ideas y Tendencias</h3>
            <p className="text-slate-600">Mantente actualizado con las últimas tendencias, ideas y novedades en ingeniería civil.</p>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-cyan-700 text-center mb-12">Testimonios de la comunidad</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/90 rounded-2xl shadow p-8 border border-cyan-100">
            <p className="text-slate-700 italic mb-4">“Gracias a la comunidad, resolví dudas complejas y encontré colegas con los que ahora colaboro en proyectos reales.”</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">👷‍♂️</span>
              <div>
                <div className="font-bold text-cyan-700">Carlos Mendoza</div>
                <div className="text-slate-500 text-sm">Ingeniero Estructural</div>
              </div>
            </div>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-8 border border-cyan-100">
            <p className="text-slate-700 italic mb-4">“Los eventos y webinars me han permitido aprender de expertos y mantenerme actualizado en mi área.”</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">👷‍♀️</span>
              <div>
                <div className="font-bold text-cyan-700">Ana Torres</div>
                <div className="text-slate-500 text-sm">Estudiante de Ingeniería Civil</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-cyan-700 mb-6">¿Listo para formar parte?</h2>
        <a href="/community" className="inline-block bg-cyan-600 text-white font-bold px-10 py-5 rounded-full shadow-lg text-xl hover:bg-cyan-700 transition">Suscribete y accede</a>
      </section>
    </div>
  );
}
