"use client";

import { Wrench, Calculator, BarChart3, FileText, Layers, Ruler, BookOpen, Cloud, ShieldCheck, Users } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100 py-0">
      {/* Banner */}
      <section
        className="w-full relative py-16 px-4 text-center shadow-lg flex items-center justify-center min-h-[400px]"
        style={{
          backgroundImage: "url('/images/Fondos%20de%20marketing/Fondo_hm.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <ScrollReveal delay={0.1} className="relative z-10 w-full">
          <h1 className="text-4xl lg:text-7xl font-extrabold text-slate-800 mt-40 mb-4 drop-shadow-lg px-4 rounded">
            Herramientas Profesionales<br />
            <span className="block mt-6">para Análisis Estructural</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mt-20 mb-20 px-4 rounded">Optimiza tu trabajo y lleva tu análisis estructural al siguiente nivel con utilidades exclusivas para suscriptores.</p>
          <a href="/register" className="inline-block bg-white text-cyan-700 font-bold px-8 py-4 rounded-full shadow-lg mb-20 mt-10 text-lg hover:bg-cyan-50 transition">Suscríbete y accede a todo</a>
        </ScrollReveal>
      </section>

      {/* Herramientas destacadas */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl font-bold text-cyan-700 text-center mb-12">¿Qué encontrarás en nuestra suite de herramientas?</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { icon: <Calculator className="w-12 h-12 text-cyan-500 mb-2" />, title: "Calculadoras Estructurales", desc: "Calculadoras de cargas, combinaciones, secciones, pernos, soldaduras y más, listas para tus proyectos." },
            { icon: <BarChart3 className="w-12 h-12 text-cyan-500 mb-2" />, title: "Gráficas y Diagramas", desc: "Genera diagramas de momento, cortante, interacción y visualiza resultados de manera profesional." },
            { icon: <FileText className="w-12 h-12 text-cyan-500 mb-2" />, title: "Plantillas y Reportes", desc: "Descarga plantillas editables, reportes automáticos y formatos listos para entregar a tus clientes." },
            { icon: <Layers className="w-12 h-12 text-cyan-500 mb-2" />, title: "Modelado y BIM", desc: "Herramientas para integración con software BIM, exportación de modelos y visualización 3D." },
            { icon: <Ruler className="w-12 h-12 text-cyan-500 mb-2" />, title: "Normativas y Códigos", desc: "Consulta rápida de normas internacionales, tablas y parámetros de diseño actualizados." },
            { icon: <BookOpen className="w-12 h-12 text-cyan-500 mb-2" />, title: "Biblioteca Técnica", desc: "Acceso a libros, manuales, papers y recursos técnicos exclusivos para miembros." },
            { icon: <Cloud className="w-12 h-12 text-cyan-500 mb-2" />, title: "Almacenamiento en la Nube", desc: "Guarda tus archivos, modelos y reportes de manera segura y accede desde cualquier lugar." },
            { icon: <ShieldCheck className="w-12 h-12 text-cyan-500 mb-2" />, title: "Seguridad y Respaldo", desc: "Tus datos y proyectos siempre protegidos con backups automáticos y cifrado profesional." },
            { icon: <Users className="w-12 h-12 text-cyan-500 mb-2" />, title: "Comunidad y Soporte", desc: "Acceso a foros, soporte técnico, mentoría y colaboración con otros especialistas." },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={Math.min(i * 0.07, 0.35)} scale>
              <div className="bg-white/90 rounded-2xl shadow p-8 flex flex-col items-center text-center border border-cyan-100 h-full">
                {item.icon}
                <h3 className="text-xl font-bold text-cyan-700 mb-1">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Beneficios de la suscripción */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl font-bold text-cyan-700 text-center mb-12">Beneficios exclusivos para suscriptores</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <ul className="grid md:grid-cols-2 gap-8 text-lg text-cyan-900 font-semibold">
            <li className="flex items-center gap-3"><span className="text-cyan-600 text-2xl">✔️</span>Acceso ilimitado a todas las herramientas</li>
            <li className="flex items-center gap-3"><span className="text-cyan-600 text-2xl">✔️</span>Actualizaciones y nuevas utilidades cada mes</li>
            <li className="flex items-center gap-3"><span className="text-cyan-600 text-2xl">✔️</span>Soporte técnico y consultoría personalizada</li>
            <li className="flex items-center gap-3"><span className="text-cyan-600 text-2xl">✔️</span>Descuentos en cursos, eventos y certificaciones</li>
            <li className="flex items-center gap-3"><span className="text-cyan-600 text-2xl">✔️</span>Participación en sorteos y concursos exclusivos</li>
            <li className="flex items-center gap-3"><span className="text-cyan-600 text-2xl">✔️</span>Networking con expertos y empresas del sector</li>
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={0.15} className="text-center mt-12">
          <a href="/register" className="inline-block bg-white text-cyan-700 font-bold px-8 py-4 rounded-full shadow-lg mb-20 mt-10 text-lg hover:bg-cyan-50 transition">Suscríbete y accede a todo</a>
        </ScrollReveal>
      </section>
    </div>
  );
}
