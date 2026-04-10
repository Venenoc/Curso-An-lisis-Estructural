import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getCatalogCoursesFromDB, getEnrolledSlugs, getCourseProgressMap } from "@/app/actions/courses";
import CourseCard from "@/components/courses/CourseCard";
import { GraduationCap, Award } from "lucide-react";
import CursosStats from "@/components/courses/CursosStats";
import { redirect } from "next/navigation";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import CursosCarouselWrapper from "@/components/courses/CursosCarouselWrapper";

export default async function CursosPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [coursesRaw, supabase] = await Promise.all([
    getCatalogCoursesFromDB(),
    createClient(),
  ]);
  // Ordenar: publicados primero, luego los draft
  const courses = [...coursesRaw].sort((a, b) => {
    if (a.isDraft === b.isDraft) return 0;
    return a.isDraft ? 1 : -1;
  });

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("user_id", user.id).single();

  const [purchasedSlugs, progressMap] = profile
    ? await Promise.all([getEnrolledSlugs(profile.id), getCourseProgressMap(profile.id)])
    : [[], {} as Record<string, number>];
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
        backgroundImage: `url('/images/FondoPlataforma/FondoPlatform_c.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
      }} />
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-10 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal delay={0.1}>
            <div className="max-w-4xl mx-auto bg-slate-900/80 border border-cyan-500/30 rounded-2xl px-4 sm:px-8 py-5 sm:py-8 mb-6 sm:mb-12 shadow-xl">
              <div className="hidden sm:inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">
                  Cursos especializados en Ingeniería Estructural
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-3 sm:mb-6 bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Nuestros Cursos
              </h1>
              <p className="text-sm sm:text-xl text-white leading-relaxed">
                Domina el análisis y diseño estructural con cursos creados por ingenieros
                expertos. Desde los fundamentos hasta técnicas avanzadas de modelado.
              </p>
            </div>
            </ScrollReveal>
            {/* Stats con count-up */}
            <CursosStats coursesCount={courses.length} lessonsCount={totalLessons} />
          </div>
        </div>
      </section>

      {/* Courses Grid (desktop) + Carousel (mobile) */}
      <section className="py-6 sm:py-10 lg:py-10">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Mobile carousel */}
          <CursosCarouselWrapper
            courses={courses}
            purchasedSlugs={purchasedSlugs}
            progressMap={progressMap}
          />
          {/* Desktop grid */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, i) => {
              if (course.isDraft) {
                return (
                  <ScrollReveal key={course.slug} delay={Math.min(i * 0.06, 0.3)} scale>
                  <div className="relative bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden min-h-[320px]">
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
                  </ScrollReveal>
                );
              }
              return (
                <ScrollReveal key={course.slug} delay={Math.min(i * 0.06, 0.3)} scale>
                <div className="bg-slate-800/80 rounded-xl">
                  <CourseCard
                    course={course}
                    purchased={purchasedSlugs.includes(course.slug)}
                    isAuthenticated={true}
                    variant="platform"
                    progress={progressMap[course.slug] ?? 0}
                  />
                </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 lg:py-10">
        <div className="container mx-auto px-4">
          <ScrollReveal delay={0.1}>
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-cyan-900/80 to-blue-900/80 border border-cyan-500/80 rounded-2xl p-6 sm:p-10">
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
          </ScrollReveal>
        </div>
      </section>
      </div>
    </div>
  );
}
