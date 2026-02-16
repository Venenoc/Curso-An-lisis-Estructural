import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { coursesCatalog } from "@/data/courses-catalog";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Clock,
  Signal,
  ShoppingCart,
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default async function CursoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = coursesCatalog.find((c) => c.slug === slug);

  if (!course) notFound();

  const user = await getUser();
  if (!user) redirect(`/login?redirectTo=/cursos/${slug}`);

  let isPurchased = false;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profile) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses(title)")
      .eq("user_id", profile.id);

    if (enrollments) {
      isPurchased = enrollments.some(
        (e: any) => e.courses?.title === course.title
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${course.gradient} opacity-10`}
        />
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a cursos
          </Link>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${course.gradient} text-white`}
                >
                  <Signal className="w-3 h-3" />
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {course.title}
              </h1>

              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 text-slate-300">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  {course.lessonsCount} lecciones
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-cyan-400" />
                  {course.modules?.length || 0} módulos
                </span>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-8 sticky top-24 backdrop-blur-sm">
                <div
                  className={`h-36 bg-gradient-to-br ${course.gradient} rounded-xl flex items-center justify-center mb-6`}
                >
                  <BookOpen className="w-12 h-12 text-white/80" />
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${course.price}
                    </span>
                    <span className="text-slate-500">USD</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">Pago único - acceso de por vida</p>
                </div>

                {isPurchased ? (
                  <div className="space-y-3">
                    <Link href={`/classroom/${course.slug}`} className="block">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Ir al Classroom
                      </Button>
                    </Link>
                    <Link href="/dashboard" className="block">
                      <Button
                        className="w-full  bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                        <span className="flex items-center gap-2 justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
                          Ir al Dashboard
                        </span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={`/checkout/${course.slug}`} className="block">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Comprar con MercadoPago
                    </Button>
                  </Link>
                )}

                <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    Acceso inmediato al contenido
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    Certificado de finalización
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    Actualizaciones gratuitas
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    Soporte del instructor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      {course.modules && course.modules.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-2">
              Contenido del Curso
            </h2>
            <p className="text-slate-400 mb-10">
              {course.modules.length} módulos - {course.lessonsCount} lecciones - {course.duration} de contenido
            </p>

            <div className="space-y-4 max-w-4xl">
              {course.modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/70 transition-all"
                >
                  <div className="p-5 flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${course.gradient} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-white font-bold text-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {module.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {module.description}
                      </p>
                      <div className="flex gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3.5 h-3.5" />
                          {module.lessonsCount} lecciones
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {module.duration}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 self-center">
                      {isPurchased ? (
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      {!isPurchased && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div
              className={`max-w-3xl mx-auto text-center bg-gradient-to-r ${course.gradient} rounded-2xl p-10`}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Comienza a aprender hoy
              </h2>
              <p className="text-white/80 mb-6">
                Accede a las {course.lessonsCount} lecciones y domina{" "}
                {course.title.toLowerCase()}
              </p>
              <Link href={`/checkout/${course.slug}`}>
                <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 text-base font-semibold">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Comprar por ${course.price} USD
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
