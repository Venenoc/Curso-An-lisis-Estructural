import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cursos de Analisis Estructural',
  description: 'Explora todos nuestros cursos especializados en analisis estructural, metodos matriciales, elementos finitos, diseno sismico y software estructural.',
  alternates: { canonical: '/cursos_m' },
  openGraph: {
    url: '/cursos_m',
    title: 'Cursos de Analisis Estructural | Albert Structural',
    description: 'Formacion especializada en analisis estructural para ingenieros civiles y estudiantes. Cursos con certificado incluido.',
  },
};

import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getCatalogCoursesFromDB, getEnrolledSlugs } from "@/app/actions/courses";
import CourseCard from "@/components/courses/CourseCard";
import { BookOpen, GraduationCap, Clock, Award } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CountUp } from "@/components/ui/count-up";

export default async function CursosPage() {
  const [user, coursesRaw] = await Promise.all([getUser(), getCatalogCoursesFromDB()]);
  // Ordenar: publicados primero, luego los draft
  const courses = [...coursesRaw].sort((a, b) => {
    if (a.isDraft === b.isDraft) return 0;
    return a.isDraft ? 1 : -1;
  });
  let purchasedSlugs: string[] = [];

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("user_id", user.id).single();
    if (profile) purchasedSlugs = await getEnrolledSlugs(profile.id);
  }

  const totalLessons = courses.reduce((sum, c) => sum + c.lessonsCount, 0);

  return (
    <div
      className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black relative"
      style={{
        backgroundImage: "url('/images/Fondos%20de%20marketing/Fondo_cm.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-32 pb-10 lg:pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-black rounded-full px-4 py-2 mt-6 mb-10">
                <GraduationCap className="w-4 h-4 text-slate-800" />
                <span className="text-slate-800 text-sm font-medium">
                  Cursos especializados en Ingeniería Estructural
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-10 bg-gradient-to-r from-black via-slate-600 to-cyan-400 bg-clip-text text-transparent">
                Nuestros Cursos
              </h1>
              <p className="text-xl text-slate-800 mb-10 max-w-2xl mx-auto leading-relaxed">
                Domina el análisis estructural con cursos creados para ti.
                Desde los fundamentos hasta técnicas avanzadas de modelado.
              </p>
            </ScrollReveal>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: <BookOpen className="w-6 h-6 text-cyan-400 mx-auto mb-2" />, target: courses.length,  suffix: "",    label: "Cursos" },
                { icon: <GraduationCap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />, target: totalLessons, suffix: "+",  label: "Lecciones" },
                { icon: <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />,         target: 150,           suffix: "+",  label: "Horas de contenido" },
                { icon: <Award className="w-6 h-6 text-purple-800 mx-auto mb-2" />,        target: 100,           suffix: "%",  label: "Certificado" },
              ].map((stat, i) => (
                <ScrollReveal key={stat.label} delay={0.15 + i * 0.08}>
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                    {stat.icon}
                    <div className="text-2xl font-bold text-white">
                      <CountUp target={stat.target} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-black">{stat.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="relative z-10 py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course, i) => {
              // Mostrar la duración exactamente como viene de Supabase (ejemplo: '1938.0h')
              const durationString = typeof course.duration === "string" && course.duration.trim() !== "" ? course.duration : "0";

              if (course.isDraft) {
                return (
                  <ScrollReveal key={course.slug} delay={Math.min(i * 0.06, 0.3)} scale>
                    <div className="relative flex flex-col items-center justify-center bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 h-full min-h-[320px]">
                      <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700/80 flex items-center justify-center">
                          <Award className="w-6 h-6 text-slate-400" />
                        </div>
                        <span className="text-white text-base font-bold text-center px-4">En Desarrollo</span>
                        <span className="text-slate-400 text-xs text-center px-6">Este curso estará disponible próximamente</span>
                      </div>
                      <CourseCard
                        course={course}
                        purchased={false}
                        isAuthenticated={true}
                        variant="light"
                      />
                    </div>
                  </ScrollReveal>
                );
              }
              return (
                <ScrollReveal key={course.slug} delay={Math.min(i * 0.06, 0.3)} scale>
                  <div className="bg-slate-800/40 rounded-xl p-4">
                    <CourseCard
                      course={course}
                      purchased={purchasedSlugs.includes(course.slug)}
                      isAuthenticated={true}
                      variant="light"
                    />
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <ScrollReveal delay={0.1}>
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/40 rounded-2xl p-6">
            <h2 className="text-3xl font-bold text-white mb-4">
              Invierte en tu carrera profesional
            </h2>
            <p className="text-slate-900 mb-6">
              Cada curso incluye acceso de por vida, certificado de finalización
              y actualizaciones gratuitas del contenido.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-white">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Acceso de por vida
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Certificado incluido
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Soporte del instructor
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Actualizaciones gratis
              </span>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
