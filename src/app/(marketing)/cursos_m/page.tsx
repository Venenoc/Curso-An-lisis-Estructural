import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { coursesCatalog } from "@/data/courses-catalog";
import CourseCard from "@/components/courses/CourseCard";
import { BookOpen, GraduationCap, Clock, Award } from "lucide-react";

export default async function CursosPage() {
  const user = await getUser();
  let purchasedSlugs: string[] = [];

  if (user) {
    const supabase = await createClient();

    // Obtener perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      // Obtener cursos comprados
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id, courses(title)")
        .eq("user_id", profile.id);

      if (enrollments) {
        const purchasedTitles = enrollments
          .map((e: any) => e.courses?.title)
          .filter(Boolean);

        purchasedSlugs = coursesCatalog
          .filter((c) => purchasedTitles.includes(c.title))
          .map((c) => c.slug);
      }
    }
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black relative"
      style={{
        backgroundImage: "url('/images/Fondo_cm.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-40 pb-20 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-black rounded-full px-4 py-2 mb-6">
              <GraduationCap className="w-4 h-4 text-slate-800" />
              <span className="text-slate-800 text-sm font-medium">
                Cursos especializados en Ingeniería Estructural
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-20 bg-gradient-to-r from-black via-slate-600 to-cyan-400 bg-clip-text text-transparent">
              Nuestros Cursos
            </h1>
            <p className="text-xl text-slate-800 mb-20 max-w-2xl mx-auto leading-relaxed">
              Domina el análisis estructural con cursos creados por ingenieros
              expertos. Desde los fundamentos hasta técnicas avanzadas de modelado.
            </p>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <BookOpen className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-xs text-black">Cursos</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <GraduationCap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">225+</div>
                <div className="text-xs text-black">Lecciones</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-xs text-black">Horas de contenido</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <Award className="w-6 h-6 text-purple-800 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-black">Certificado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coursesCatalog.map((course) => (
              <CourseCard
                key={course.slug}
                course={course}
                purchased={purchasedSlugs.includes(course.slug)}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 rounded-2xl p-10">
            <h2 className="text-3xl font-bold text-slate-600 mb-4">
              Invierte en tu carrera profesional
            </h2>
            <p className="text-slate-600 mb-6">
              Cada curso incluye acceso de por vida, certificado de finalización
              y actualizaciones gratuitas del contenido.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white">
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
        </div>
      </section>
    </div>
  );
}
