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
  Compass,
  Scale,
  Landmark,
  PenTool,
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
  let purchasedModuleIds: number[] = [];

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

    // Check individual module purchases
    if (!isPurchased) {
      const { data: dbCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", slug)
        .single();

      if (dbCourse) {
        const { data: moduleEnrollments } = await supabase
          .from("module_enrollments")
          .select("module_id")
          .eq("user_id", profile.id)
          .eq("course_id", dbCourse.id);

        purchasedModuleIds = (moduleEnrollments || []).map((me: any) => me.module_id);

        // If all modules are purchased individually, treat as full course purchased
        const totalModules = course.modules?.length || 0;
        if (totalModules > 0 && purchasedModuleIds.length >= totalModules) {
          isPurchased = true;
        }
      }
    }
  }

  // Calculate remaining price (full price minus purchased modules' prices)
  const purchasedModulesTotal = (course.modules || [])
    .filter((m) => purchasedModuleIds.includes(m.id))
    .reduce((sum, m) => sum + m.price, 0);
  const remainingPrice = Math.max(0, course.price - purchasedModulesTotal);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* Modules - Orbital Layout (now first section) */}
      {course.modules && course.modules.length > 0 && (() => {
        const displayModules = course.modules.slice(0, 4);
        const moduleIcons = [Compass, Scale, Landmark, PenTool];

        return (
          <section className="relative overflow-hidden pt-8 pb-16 lg:pb-24">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${course.gradient} opacity-10`}
            />
            <div className="container mx-auto px-4 relative z-10">
              {/* Back link */}
              <Link
                href="/cursos"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a cursos
              </Link>

              {/* Course header info */}
              <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${course.gradient} text-white`}
                  >
                    <Signal className="w-3 h-3" />
                    {course.level}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {course.title}
                </h1>

                <p className="text-lg text-slate-400 mb-6 leading-relaxed max-w-2xl mx-auto">
                  {course.description}
                </p>

                <div className="flex flex-wrap justify-center gap-6 text-slate-300">
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

              {/* Orbital grid layout */}
              <div className="relative max-w-6xl mx-auto">
                {/* Desktop orbital layout */}
                <div className="hidden lg:block relative" style={{ height: '700px' }}>
                  {/* Connection lines (decorative) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 700">
                    <line x1="200" y1="150" x2="420" y2="280" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="800" y1="150" x2="580" y2="280" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="200" y1="550" x2="420" y2="420" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="800" y1="550" x2="580" y2="420" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="6 4" />
                  </svg>

                  {/* Central course card */}
                  {(() => {
                    const courseVideoUrl = course.modules?.flatMap((m) => m.lessons || []).find((l) => l.videoUrl)?.videoUrl || "";
                    return (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[380px]">
                        <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-1 shadow-2xl shadow-cyan-500/20`}>
                          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden">
                            {/* Video or gradient header */}
                            {courseVideoUrl ? (
                              <video
                                className="w-full h-44 object-cover bg-black"
                                controls
                                preload="metadata"
                              >
                                <source src={courseVideoUrl} type="video/mp4" />
                              </video>
                            ) : (
                              <div className={`h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                                <BookOpen className="w-12 h-12 text-white/70" />
                              </div>
                            )}
                            <div className="p-5 text-center">
                              <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">{course.level}</p>
                              <h3 className="text-white font-bold text-lg leading-snug">
                                {course.title}
                              </h3>
                              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  {course.lessonsCount} lecciones
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {course.duration}
                                </span>
                              </div>
                              {/* Price and purchase */}
                              <div className="mt-4 pt-4 border-t border-slate-700/50">
                                {isPurchased ? (
                                  <Link href={`/classroom/${course.slug}`}>
                                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-10 text-sm">
                                      <PlayCircle className="w-4 h-4 mr-2" />
                                      Ir al Classroom
                                    </Button>
                                  </Link>
                                ) : (
                                  <>
                                    <div className="flex items-baseline justify-center gap-1 mb-3">
                                      {purchasedModuleIds.length > 0 ? (
                                        <>
                                          <span className="text-sm text-slate-500 line-through">${course.price}</span>
                                          <span className="text-2xl font-bold text-white">${remainingPrice.toFixed(2)}</span>
                                        </>
                                      ) : (
                                        <span className="text-2xl font-bold text-white">${course.price}</span>
                                      )}
                                      <span className="text-slate-500 text-xs">USD</span>
                                    </div>
                                    <Link href={`/checkout/${course.slug}`}>
                                      <Button className={`w-full bg-gradient-to-r ${course.gradient} hover:opacity-90 text-white h-10 text-sm font-semibold`}>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Comprar Curso Completo
                                      </Button>
                                    </Link>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Module cards positioned in orbital pattern */}
                  {displayModules.map((module, index) => {
                    const ModuleIcon = moduleIcons[index];
                    const isModuleOwned = isPurchased || purchasedModuleIds.includes(module.id);
                    const firstVideoUrl = module.lessons?.find((l) => l.videoUrl)?.videoUrl || "";
                    const positions = [
                      'left-[2%] top-[4%]',
                      'right-[2%] top-[4%]',
                      'left-[2%] bottom-[4%]',
                      'right-[2%] bottom-[4%]',
                    ];
                    const rotations = ['-rotate-2', 'rotate-2', 'rotate-1', '-rotate-1'];

                    return (
                      <div
                        key={module.id}
                        className={`absolute ${positions[index]} z-20 w-[280px] group`}
                      >
                        <div className={`${rotations[index]} hover:rotate-0 transition-all duration-500 ease-out`}>
                          <div className={`bg-slate-800/80 border rounded-xl overflow-hidden backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
                            isModuleOwned
                              ? "border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/10"
                              : "border-slate-700/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                          }`}>
                            <div className="relative overflow-hidden">
                              {firstVideoUrl ? (
                                <video
                                  className="w-full h-40 object-cover bg-black"
                                  controls
                                  preload="metadata"
                                  poster=""
                                >
                                  <source src={firstVideoUrl} type="video/mp4" />
                                </video>
                              ) : (
                                <div className={`h-32 bg-gradient-to-br ${course.gradient} opacity-80 relative`}>
                                  <div className="absolute inset-0 bg-black/20" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <ModuleIcon className="w-12 h-12 text-white/70" />
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">
                                Módulo {String(index + 1).padStart(2, "0")}
                              </div>
                              <div className="absolute bottom-3 right-3 z-10">
                                {isModuleOwned ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Lock className="w-4 h-4 text-white/60" />
                                )}
                              </div>
                              {isModuleOwned && (
                                <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">
                                  Adquirido
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">
                                {module.title}
                              </h4>
                              <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">
                                {module.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-3 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <PlayCircle className="w-3 h-3" />
                                    {module.lessonsCount} lecciones
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {module.duration}
                                  </span>
                                </div>
                                {isModuleOwned ? (
                                  <Link href={`/classroom/${course.slug}`}>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 hover:text-green-300 transition-colors cursor-pointer">
                                      <PlayCircle className="w-3 h-3" />
                                      Ir al Classroom
                                    </span>
                                  </Link>
                                ) : (
                                  <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">
                                      <ShoppingCart className="w-3 h-3" />
                                      ${module.price}
                                    </span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Decorative dots */}
                  <div className="absolute left-[45%] top-[8%] w-2 h-2 rounded-full bg-cyan-500/30" />
                  <div className="absolute right-[30%] top-[15%] w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
                  <div className="absolute left-[35%] bottom-[12%] w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
                  <div className="absolute right-[42%] bottom-[8%] w-2 h-2 rounded-full bg-cyan-500/30" />
                </div>

                {/* Tablet layout */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
                  {(() => {
                    const courseVideoUrl = course.modules?.flatMap((m) => m.lessons || []).find((l) => l.videoUrl)?.videoUrl || "";
                    return (
                      <div className="col-span-2 flex justify-center mb-4">
                        <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-1 shadow-2xl shadow-cyan-500/20 w-full max-w-lg`}>
                          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden">
                            {courseVideoUrl ? (
                              <video className="w-full h-48 object-cover bg-black" controls preload="metadata">
                                <source src={courseVideoUrl} type="video/mp4" />
                              </video>
                            ) : (
                              <div className={`h-28 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                                <BookOpen className="w-10 h-10 text-white/70" />
                              </div>
                            )}
                            <div className="p-5 text-center">
                              <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">{course.level}</p>
                              <h3 className="text-white font-bold text-lg">{course.title}</h3>
                              <div className="mt-3 pt-3 border-t border-slate-700/50">
                                {isPurchased ? (
                                  <Link href={`/classroom/${course.slug}`}>
                                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-10 text-sm">
                                      <PlayCircle className="w-4 h-4 mr-2" />
                                      Ir al Classroom
                                    </Button>
                                  </Link>
                                ) : (
                                  <>
                                    <div className="flex items-baseline justify-center gap-1 mb-2">
                                      <span className="text-2xl font-bold text-white">${course.price}</span>
                                      <span className="text-slate-500 text-xs">USD</span>
                                    </div>
                                    <Link href={`/checkout/${course.slug}`}>
                                      <Button className={`w-full bg-gradient-to-r ${course.gradient} hover:opacity-90 text-white h-10 text-sm font-semibold`}>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Comprar Curso Completo
                                      </Button>
                                    </Link>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {displayModules.map((module, index) => {
                    const ModuleIcon = moduleIcons[index];
                    const isModuleOwned = isPurchased || purchasedModuleIds.includes(module.id);
                    const firstVideoUrl = module.lessons?.find((l) => l.videoUrl)?.videoUrl || "";
                    return (
                      <div key={module.id} className={`bg-slate-800/80 border rounded-xl overflow-hidden transition-all ${
                        isModuleOwned ? "border-green-500/30 hover:border-green-500/50" : "border-slate-700/50 hover:border-cyan-500/30"
                      }`}>
                        <div className="relative">
                          {firstVideoUrl ? (
                            <video className="w-full h-36 object-cover bg-black" controls preload="metadata">
                              <source src={firstVideoUrl} type="video/mp4" />
                            </video>
                          ) : (
                            <div className={`h-28 bg-gradient-to-br ${course.gradient} opacity-80 relative`}>
                              <div className="absolute inset-0 bg-black/20" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ModuleIcon className="w-10 h-10 text-white/70" />
                              </div>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">
                            Módulo {String(index + 1).padStart(2, "0")}
                          </div>
                          {isModuleOwned && (
                            <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white z-10">
                              Adquirido
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{module.title}</h4>
                          <p className="text-slate-400 text-xs line-clamp-2 mb-2">{module.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-3 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />{module.lessonsCount} lecciones</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                            </div>
                            {isModuleOwned ? (
                              <Link href={`/classroom/${course.slug}`}>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 hover:text-green-300 transition-colors">
                                  <PlayCircle className="w-3 h-3" />Ir al Classroom
                                </span>
                              </Link>
                            ) : (
                              <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                  <ShoppingCart className="w-3 h-3" />${module.price}
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile layout */}
                <div className="md:hidden space-y-4">
                  {(() => {
                    const courseVideoUrl = course.modules?.flatMap((m) => m.lessons || []).find((l) => l.videoUrl)?.videoUrl || "";
                    return (
                      <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl p-1 shadow-xl shadow-cyan-500/20`}>
                        <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden">
                          {courseVideoUrl ? (
                            <video className="w-full h-44 object-cover bg-black" controls preload="metadata">
                              <source src={courseVideoUrl} type="video/mp4" />
                            </video>
                          ) : (
                            <div className={`h-24 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                              <BookOpen className="w-8 h-8 text-white/70" />
                            </div>
                          )}
                          <div className="p-4 text-center">
                            <p className="text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-1">{course.level}</p>
                            <h3 className="text-white font-bold text-base">{course.title}</h3>
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              {isPurchased ? (
                                <Link href={`/classroom/${course.slug}`}>
                                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-9 text-sm">
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Ir al Classroom
                                  </Button>
                                </Link>
                              ) : (
                                <>
                                  <div className="flex items-baseline justify-center gap-1 mb-2">
                                    {purchasedModuleIds.length > 0 ? (
                                      <>
                                        <span className="text-xs text-slate-500 line-through">${course.price}</span>
                                        <span className="text-xl font-bold text-white">${remainingPrice.toFixed(2)}</span>
                                      </>
                                    ) : (
                                      <span className="text-xl font-bold text-white">${course.price}</span>
                                    )}
                                    <span className="text-slate-500 text-xs">USD</span>
                                  </div>
                                  <Link href={`/checkout/${course.slug}`}>
                                    <Button className={`w-full bg-gradient-to-r ${course.gradient} hover:opacity-90 text-white h-9 text-sm font-semibold`}>
                                      <ShoppingCart className="w-4 h-4 mr-2" />
                                      Comprar Curso Completo
                                    </Button>
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {displayModules.map((module, index) => {
                    const ModuleIcon = moduleIcons[index];
                    const isModuleOwned = isPurchased || purchasedModuleIds.includes(module.id);
                    const firstVideoUrl = module.lessons?.find((l) => l.videoUrl)?.videoUrl || "";
                    return (
                      <div key={module.id} className={`bg-slate-800/80 border rounded-xl overflow-hidden ${
                        isModuleOwned ? "border-green-500/30" : "border-slate-700/50"
                      }`}>
                        {firstVideoUrl ? (
                          <div className="relative">
                            <video className="w-full h-40 object-cover bg-black" controls preload="metadata">
                              <source src={firstVideoUrl} type="video/mp4" />
                            </video>
                            <div className="absolute top-2 left-2 bg-black/60 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white z-10">
                              Módulo {String(index + 1).padStart(2, "0")}
                            </div>
                            {isModuleOwned && (
                              <div className="absolute top-2 right-2 bg-green-500/80 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white z-10">
                                Adquirido
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex">
                            <div className={`w-24 shrink-0 bg-gradient-to-br ${course.gradient} opacity-80 relative flex items-center justify-center`}>
                              <ModuleIcon className="w-8 h-8 text-white/70" />
                              <div className="absolute top-2 left-2 bg-black/40 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">
                                {String(index + 1).padStart(2, "0")}
                              </div>
                              {isModuleOwned && (
                                <div className="absolute bottom-2 right-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold text-sm line-clamp-1">{module.title}</h4>
                                {isModuleOwned && (
                                  <span className="text-[9px] font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full shrink-0">Adquirido</span>
                                )}
                              </div>
                              <p className="text-slate-400 text-xs line-clamp-2 mb-2">{module.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-3 text-[10px] text-slate-500">
                                  <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />{module.lessonsCount}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                                </div>
                                {isModuleOwned ? (
                                  <Link href={`/classroom/${course.slug}`}>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 hover:text-green-300 transition-colors">
                                      <PlayCircle className="w-3 h-3" />Classroom
                                    </span>
                                  </Link>
                                ) : (
                                  <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                      <ShoppingCart className="w-3 h-3" />${module.price}
                                    </span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Info below video for modules with video */}
                        {firstVideoUrl && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-semibold text-sm line-clamp-1">{module.title}</h4>
                              {isModuleOwned && (
                                <span className="text-[9px] font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full shrink-0">Adquirido</span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs line-clamp-2 mb-2">{module.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-3 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />{module.lessonsCount}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                              </div>
                              {isModuleOwned ? (
                                <Link href={`/classroom/${course.slug}`}>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 hover:text-green-300 transition-colors">
                                    <PlayCircle className="w-3 h-3" />Classroom
                                  </span>
                                </Link>
                              ) : (
                                <Link href={`/checkout/${course.slug}?module=${module.id}`}>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                    <ShoppingCart className="w-3 h-3" />${module.price}
                                  </span>
                                </Link>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Purchase Section - Curso Completo */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              Obtén el curso completo
            </h2>
            <p className="text-slate-400 mb-10 text-center">
              Accede a todos los módulos con un solo pago y ahorra
            </p>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Course info */}
              <div className="space-y-6">
                <div className={`h-44 bg-gradient-to-br ${course.gradient} rounded-xl flex items-center justify-center`}>
                  <BookOpen className="w-14 h-14 text-white/80" />
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${course.gradient} text-white`}>
                      <Signal className="w-3 h-3" />
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{course.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-5 text-sm text-slate-300">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      {course.lessonsCount} lecciones
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-cyan-400" />
                      {course.modules?.length || 0} módulos
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase card */}
              <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <div className="mb-6 text-center">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Curso completo</p>
                  <div className="flex items-baseline justify-center gap-2">
                    {purchasedModuleIds.length > 0 ? (
                      <>
                        <span className="text-lg text-slate-500 line-through">${course.price}</span>
                        <span className="text-4xl font-bold text-white">
                          ${remainingPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        ${course.price}
                      </span>
                    )}
                    <span className="text-slate-500">USD</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">Pago único · acceso de por vida</p>
                  {course.modules && (
                    <p className="text-cyan-400/70 text-xs mt-2">
                      Ahorra vs comprar módulos por separado (${course.modules.reduce((sum, m) => sum + m.price, 0).toFixed(2)} USD)
                    </p>
                  )}
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
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                        <span className="flex items-center gap-2 justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
                          Ir al Dashboard
                        </span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href={`/checkout/${course.slug}`} className="block">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Comprar curso completo
                      </Button>
                    </Link>
                    {purchasedModuleIds.length > 0 && (
                      <p className="text-center text-xs text-green-400">
                        Ya tienes {purchasedModuleIds.length} de {course.modules?.length || 0} módulos adquiridos
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    Acceso inmediato a todos los módulos
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

      {/* Bottom CTA */}
      {!isPurchased && purchasedModuleIds.length === 0 && (
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
                  Comprar por ${purchasedModuleIds.length > 0 ? remainingPrice.toFixed(2) : course.price} USD
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
