import type { Metadata } from 'next';
import { getApprovedTestimonials } from '@/app/actions/testimonials';
import JsonLd from '@/components/seo/JsonLd';
import { createClient as createAdminClientMeta } from '@supabase/supabase-js';
import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Signal,
  CheckCircle2,
  Lock,
  Play,
  ShoppingCart,
  Award,
  ChevronLeft,
  Users,
  FileText,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

function getLevelColor(level: string) {
  switch (level) {
    case "Principiante":
      // Color especial para resaltar en fondo blanco
      return "bg-orange-400/20 text-orange-600 border-orange-400/40";
    case "Intermedio":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Avanzado":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
}

// Eliminar función getFirstVideoUrl, no se usa y depende de coursesCatalog

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClientMeta(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: course } = await admin
    .from('courses')
    .select('title, description, level, total_duration, total_lessons, image_url')
    .eq('slug', slug)
    .single();

  if (!course) {
    return { title: 'Curso no encontrado' };
  }

  const title = course.title;
  const description = course.description
    ? course.description.slice(0, 160)
    : `Curso de ${title}: formacion especializada en analisis estructural con certificado incluido.`;

  return {
    title,
    description,
    alternates: { canonical: `/cursos_m/${slug}` },
    openGraph: {
      type: 'website',
      url: `/cursos_m/${slug}`,
      title: `${title} | Albert Structural`,
      description,
      images: course.image_url
        ? [{ url: course.image_url, width: 1200, height: 630, alt: title }]
        : [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Albert Structural`,
      description,
      images: course.image_url ? [course.image_url] : ['/images/og-image.jpg'],
    },
  };
}

export default async function CourseSyllabusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Step 1: fetch course metadata (no deep nesting to avoid Supabase quirks)
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, price, level, gradient, total_duration, total_lessons, image_url, slug, presentation_video_url, status")
    .eq("slug", slug)
    .single();
  if (!course) notFound();

  // Step 2: fetch modules → chapters → lessons using admin client to bypass RLS
  // (lessons RLS only allows enrolled users/instructors; marketing page is public)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: modulesRaw } = await admin
    .from("modules")
    .select(`
      id, title, order, price,
      chapters(
        id, title, order,
        sessions(
          id, title, order,
          lessons(id, title, order, duration, duration_text)
        ),
        lessons(id, title, order, duration, duration_text)
      )
    `)
    .eq("course_id", course.id)
    .order("order", { ascending: true });

  const modules = (modulesRaw || []).map((m: any) => ({
    ...m,
    chapters: [...(m.chapters || [])]
      .sort((a: any, b: any) => a.order - b.order)
      .map((c: any) => {
        // Si el capítulo tiene sesiones, aplanar lecciones en orden sesión → lección
        const sessions = [...(c.sessions || [])].sort((a: any, b: any) => a.order - b.order);
        const directLessons = [...(c.lessons || [])].sort((a: any, b: any) => a.order - b.order);
        const flatLessons = sessions.length > 0
          ? sessions.flatMap((s: any) =>
              [...(s.lessons || [])].sort((a: any, b: any) => a.order - b.order)
            )
          : directLessons;
        return { ...c, sessions, lessons: flatLessons };
      }),
  }));

  // Testimonials for this course
  const courseTestimonials = await getApprovedTestimonials(course.id);

  const user = await getUser();
  let purchased = false;

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("courses(title)")
        .eq("user_id", profile.id);

      if (enrollments) {
        const purchasedTitles = enrollments
          .map((e: any) => e.courses?.title)
          .filter(Boolean);
        purchased = purchasedTitles.includes(course.title);
      }
    }
  }

  // Usar el video de presentación de la tabla courses si existe
  const introVideoUrl = course.presentation_video_url || "";
  const buyLink = user
    ? `/checkout/${course.slug}`
    : `/login?redirectTo=/checkout/${course.slug}`;

  const totalLessons =
    modules.length > 0
      ? modules.reduce((acc: number, mod: any) =>
          acc + mod.chapters.reduce((a: number, ch: any) => a + ch.lessons.length, 0), 0)
      : (course.total_lessons ?? 0);

  const isFirstCourse =
    course.title ===
    "Conceptos Fundamentales en el Comportamiento y Diseño de Vigas";

  return (
    <div
      className="relative min-h-screen bg-gradient-to-b from-white via-slate-100 to-slate-200"
      style={{
        backgroundImage: 'url(/images/Fondos%20de%20marketing/Fondo_cslugm.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Back link */}
      <div className="relative z-10 pt-24 pb-0 container mx-auto px-4 max-w-6xl">
        <Link
          href="/cursos_m"
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-cyan-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cursos
        </Link>
      </div>

      {/* Hero */}
      <section className="relative z-10 py-10 border-b border-slate-300/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal delay={0.1}>
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg px-8 py-8 text-center">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mb-5 ${getLevelColor(course.level)}`}
              >
                <Signal className="w-3 h-3" />
                {course.level}
              </span>
              <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-5 leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-700 text-lg mb-7 leading-relaxed max-w-2xl mx-auto">
                {course.description}
              </p>
              <div className="flex flex-wrap justify-center gap-5 text-sm text-slate-700">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-700" />
                  {totalLessons} lecciones
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-700" />
                  {course.total_duration}
                </span>
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-700" />
                  Certificado incluido
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-700" />
                  Acceso de por vida
                </span>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left column: video + syllabus */}
            <div className="lg:col-span-2 space-y-10">
              {/* Intro video */}
              {introVideoUrl && (
                <ScrollReveal delay={0.1}>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-cyan-400" />
                    Video de introducción
                  </h2>
                  <div className="rounded-2xl overflow-hidden bg-slate-800 shadow-xl shadow-black/40 aspect-video">
                    <video
                      src={introVideoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                </ScrollReveal>
              )}

              {/* Syllabus */}
              {modules.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-5">
                    Contenido del curso
                  </h2>
                  <div className="space-y-3">
                    {modules.map((mod: any, modIndex: number) => (
                      <ScrollReveal key={mod.id} delay={Math.min(modIndex * 0.07, 0.35)}>
                      <details
                        className="group bg-slate-800/90 border border-slate-700/60 rounded-xl overflow-hidden"
                        open={modIndex === 0}
                      >
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-700/30 transition-colors list-none select-none">
                          <div className="flex items-center gap-4">
                            <div className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm font-bold flex items-center justify-center flex-shrink-0">
                              {`Módulo ${modIndex + 1}:`}
                            </div>
                            <div>
                              <div className="font-semibold text-white leading-snug">
                                {mod.title}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {mod.chapters?.reduce(
                                  (a: number, ch: any) => a + ch.lessons.length,
                                  0
                                ) ?? mod.lessonsCount} {" "}
                                lecciones · {mod.duration}
                              </div>
                            </div>
                          </div>
                          <span className="text-slate-500 text-xs transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-3">
                            ▼
                          </span>
                        </summary>

                        <div className="px-5 pb-5">
                          {mod.description && (
                            <p className="text-slate-400 text-sm mb-4 pl-13">
                              {mod.description}
                            </p>
                          )}
                          {mod.chapters?.map((chapter: any) => (
                            <div key={chapter.id} className="mt-4">
                              <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-2 pl-2">
                                {chapter.title}
                              </div>
                              <div className="space-y-0.5">
                                {chapter.lessons.map((lesson: any) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-700/25 transition-colors"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-300 flex-1 leading-snug">
                                      {lesson.title}
                                    </span>
                                    <span className="text-xs text-slate-600 flex-shrink-0">
                                      {lesson.duration_text ?? ""}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                      </ScrollReveal>
                    ))}
                  </div>

                  {/* Botón temario PDF */}
                  <div className="mt-5">
                    <a
                      href="/images/Temariodecursos/Curso1tema.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-cyan-500/40 bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-800 transition-colors"
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      Ver temario completo (PDF)
                    </a>
                  </div>
                </div>
              )}

              {/* What you'll learn — shown when no modules detail available */}
              {modules.length === 0 && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">
                    Acerca de este curso
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {course.description}
                  </p>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {totalLessons} lecciones en video
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {course.total_duration} de contenido
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      Acceso de por vida
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      Certificado de finalización
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: price card (sticky) */}
            <ScrollReveal delay={0.15} className="lg:col-span-1 pt-10">
            <div className="lg:col-span-1 pt-10">
              <div className="sticky top-24">
                <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                  {/* Thumbnail */}
                  {isFirstCourse ? (
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: "url(/images/Fondocurso1.jpg)",
                      }}
                    />
                  ) : (
                    <div
                      className={`h-48 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}
                    >
                      <BookOpen className="w-14 h-14 text-white/30" />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Price */}
                    <div className="mb-5 flex items-baseline gap-1">
                      <span className="text-white text-2xl font-semibold">S/.</span>
                      <span className="text-4xl font-bold text-white">
                        {course.price}
                      </span>
                    </div>

                    {/* CTA */}
                    {purchased ? (
                      <Link href={`/cursos/${course.slug}`}>
                        <Button className="w-full bg-green-600 hover:bg-green-500 text-white h-12 text-base font-semibold">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Acceder al Curso
                        </Button>
                      </Link>
                    ) : (
                      <Link href={buyLink}>
                        <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-12 text-base font-semibold">
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Comprar Ahora
                        </Button>
                      </Link>
                    )}

                    {!user && (
                      <p className="mt-3 text-xs text-slate-500 text-center">
                        Al comprar se te pedirá{" "}
                        <Link
                          href="/login"
                          className="text-cyan-400 hover:underline"
                        >
                          iniciar sesión
                        </Link>
                      </p>
                    )}

                    {/* Features */}
                    <div className="mt-6 pt-5 border-t border-slate-700/50 space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Este curso incluye
                      </p>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <BookOpen className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        {totalLessons} lecciones en video
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <Clock className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        {course.total_duration} de contenido
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        Acceso de por vida
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-400">
                        <Award className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        Certificado de finalización
                      </div>
                    </div>

                    {/* Compra por módulos */}
                    {!purchased && modules.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                          O compra solo un módulo
                        </p>
                        <div className="space-y-3">
                          {modules.map((mod: any, modIndex: number) => (
                            <div key={mod.id} className="bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 flex flex-col items-start">
                              <div>
                                <div className="font-semibold text-white text-sm">{mod.title}</div>
                                <div className="text-xs text-slate-400">
                                  {mod.chapters?.reduce((a: number, ch: any) => a + ch.lessons.length, 0)} lecciones · {
                                    (() => {
                                      const totalMinutes = mod.chapters?.reduce((sum: number, ch: any) => {
                                        return sum + ch.lessons.reduce((s: number, l: any) => s + (typeof l.duration === "number" ? l.duration : 0), 0);
                                      }, 0) ?? 0;
                                      if (totalMinutes >= 60) {
                                        const hours = Math.floor(totalMinutes / 60);
                                        const minutes = totalMinutes % 60;
                                        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
                                      }
                                      return `${totalMinutes} min`;
                                    })()
                                  }
                                </div>
                              </div>
                                <span className="text-base font-bold text-cyan-400 mt-2">{mod.price !== undefined ? `S/. ${mod.price}` : "Sin precio"}</span>
                              <Link
                                href={user
                                  ? `/checkout/${course.slug}?module=${mod.id}`
                                  : `/login?redirectTo=/checkout/${course.slug}%3Fmodule%3D${mod.id}`
                                }
                                className="w-full mt-2"
                              >
                                <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-9 px-4 font-semibold">
                                  {`Comprar módulo ${modIndex + 1}`}
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile buy button (shown below card on small screens, hidden on lg) */}
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-12 border-t border-slate-300/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <ScrollReveal delay={0.05}>
            <h2 className="text-2xl font-bold text-slate-900 mb-1 text-center">Lo que dicen nuestros estudiantes</h2>
            <p className="text-slate-500 text-sm text-center mb-10">Opiniones reales de quienes ya completaron el curso</p>
          </ScrollReveal>
          {(() => {
            const fallback = [
              { id: "f1", author_name: "Carlos M.", author_role: "Ingeniero Civil", content: "El curso superó todas mis expectativas. La forma en que explican los conceptos es clara y directa.", rating: 5 },
              { id: "f2", author_name: "Andrea P.", author_role: "Estudiante de Ing. Civil", content: "Excelente material didáctico. Los ejercicios son muy similares a los que se encuentran en la práctica profesional.", rating: 5 },
              { id: "f3", author_name: "Luis F.", author_role: "Proyectista Estructural", content: "Llevaba años buscando un curso que explicara bien el análisis estructural. Este lo hace de forma magistral.", rating: 5 },
            ];
            const items = courseTestimonials.length > 0 ? courseTestimonials : fallback;
            return (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((t, i) => (
                  <ScrollReveal key={t.id || i} delay={Math.min(0.08 + i * 0.07, 0.4)}>
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <svg key={j} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5">&ldquo;{t.content}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {t.author_name[0]}
                        </div>
                        <div>
                          <p className="text-slate-900 text-sm font-semibold">{t.author_name}</p>
                          {t.author_role && <p className="text-slate-400 text-xs">{t.author_role}</p>}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            );
          })()}
        </div>
      </section>


      {/* Course Schema Markup */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description,
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Albert Structural',
          sameAs: process.env.NEXT_PUBLIC_SITE_URL || 'https://albertstructural.com',
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'es',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PEN',
          price: course.price,
          availability: 'https://schema.org/InStock',
        },
        educationalLevel: course.level,
        timeRequired: course.total_duration,
      }} />

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-50">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <div>
            <div className="text-xl font-bold text-white">S/. {course.price}</div>
          </div>
          {purchased ? (
            <Link href={`/cursos/${course.slug}`} className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-500 text-white h-11 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acceder al Curso
              </Button>
            </Link>
          ) : (
            <Link href={buyLink} className="flex-1">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-11 font-semibold">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar Ahora
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
