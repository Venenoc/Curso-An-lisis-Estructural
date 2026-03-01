import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getCatalogCoursesFromDB, getEnrolledSlugs } from "@/app/actions/courses";
import CourseCard from "@/components/courses/CourseCard";
import { BookOpen, GraduationCap, Clock, Award } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CursosPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [courses, supabase] = await Promise.all([
    getCatalogCoursesFromDB(),
    createClient(),
  ]);

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("user_id", user.id).single();

  const purchasedSlugs = profile ? await getEnrolledSlugs(profile.id) : [];
  const totalLessons = courses.reduce((sum, c) => sum + c.lessonsCount, 0);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Fondo fijo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundImage: 'url(/images/FondoPlatform_c.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
      }} />
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="max-w-4xl mx-auto bg-slate-900/80 border border-cyan-500/30 rounded-2xl px-8 py-8 mb-12 shadow-xl">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">
                  Cursos especializados en Ingeniería Estructural
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Nuestros Cursos
              </h1>
              <p className="text-xl text-white leading-relaxed">
                Domina el análisis estructural con cursos creados por ingenieros
                expertos. Desde los fundamentos hasta técnicas avanzadas de modelado.
              </p>
            </div>
            {/* Stats dinámicos desde Supabase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
                <BookOpen className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <div className="text-xs text-slate-400">Cursos</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
                <GraduationCap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{totalLessons}+</div>
                <div className="text-xs text-slate-400">Lecciones</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
                <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-xs text-slate-400">Horas de contenido</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
                <Award className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Certificado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-10 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => {
              if (course.isDraft) {
                return (
                  <div key={course.slug} className="relative bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden min-h-[320px]">
                    <CourseCard
                      course={course}
                      purchased={false}
                      isAuthenticated={true}
                      variant="platform"
                    />
                    <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-700/80 flex items-center justify-center">
                        <Award className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="text-white text-base font-bold text-center px-4">En Desarrollo</span>
                      <span className="text-slate-400 text-xs text-center px-6">Este curso estará disponible próximamente</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={course.slug} className="bg-slate-800/80 rounded-xl">
                  <CourseCard
                    course={course}
                    purchased={purchasedSlugs.includes(course.slug)}
                    isAuthenticated={true}
                    variant="platform"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-cyan-900/80 to-blue-900/80 border border-cyan-500/80 rounded-2xl p-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Invierte en tu carrera profesional
            </h2>
            <p className="text-slate-400 mb-6">
              Cada curso incluye acceso de por vida, certificado de finalización
              y actualizaciones gratuitas del contenido.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
              {[
                "Acceso de por vida",
                "Certificado incluido",
                "Soporte del instructor",
                "Actualizaciones gratis"
              ].map((text, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
