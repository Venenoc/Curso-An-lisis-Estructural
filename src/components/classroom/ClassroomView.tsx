"use client";

import { useState, useMemo, useCallback } from "react";
import { Menu, ArrowLeft, PlayCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import ClassroomSidebar from "./ClassroomSidebar";
import VideoPlayer from "./VideoPlayer";
import ClassroomTabs from "./ClassroomTabs";
import { getYoutubeEmbedUrl, getCloudflareStreamUrl } from "@/lib/utils";
import type { CatalogCourse, CourseLesson, CourseSession } from "@/data/courses-catalog";
import type { QuizWithQuestions } from "@/app/actions/quizzes";
import TestimonialModal from "@/components/testimonials/TestimonialModal";
import CfStreamEmbed from "./CfStreamEmbed";

import type { LessonFaq } from "@/app/actions/courses";

interface ClassroomViewProps {
  course: CatalogCourse;
  completedLessonIds: string[];
  profileId: string;
  hasFullCourse: boolean;
  hasException: boolean;
  purchasedModuleIds: number[];
  initialLessonId?: number;
  quizzesByCatalogLessonId?: Record<number, QuizWithQuestions>;
  faqsByLessonDbId?: Record<string, LessonFaq[]>;
  courseId: string;
  courseTitle: string;
  hasTestimonial: boolean;
}

export default function ClassroomView({
  course,
  completedLessonIds: initialCompleted,
  profileId,
  hasFullCourse,
  hasException,
  purchasedModuleIds,
  initialLessonId,
  quizzesByCatalogLessonId,
  faqsByLessonDbId,
  courseId,
  courseTitle,
  hasTestimonial,
}: ClassroomViewProps) {
  const modules = course.modules || [];

  // Flatten all lessons through module → chapter → (session →) lesson
  const allLessons = useMemo(() => {
    const lessons: { moduleId: number; moduleName: string; chapterId: number; chapterName: string; lesson: CourseLesson }[] = [];
    modules.forEach((m) => {
      (m.chapters || []).forEach((ch) => {
        (ch.lessons || []).forEach((l) => {
          lessons.push({ moduleId: m.id, moduleName: m.title, chapterId: ch.id, chapterName: ch.title, lesson: l });
        });
      });
    });
    return lessons;
  }, [modules]);

  const firstLesson = allLessons[0];
  const startLesson = initialLessonId
    ? (allLessons.find((l) => l.lesson.id === initialLessonId) ?? firstLesson)
    : firstLesson;

  const [, setCurrentModuleId] = useState(startLesson?.moduleId || 0);
  const [currentLessonId, setCurrentLessonId] = useState(startLesson?.lesson.id || 0);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompleted);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);

  // Session intro video state: null = showing a lesson, non-null = showing session intro
  const [currentSession, setCurrentSession] = useState<CourseSession | null>(null);

  // Compute which lessons are unlocked based on purchase type and progress
  const unlockedLessonIds = useMemo(() => {
    const unlocked = new Set<number>();

    if (hasException) {
      // Acceso por excepción: todos los módulos y lecciones desbloqueados desde el inicio
      for (const mod of modules) {
        for (const ch of (mod.chapters || [])) {
          for (const lesson of (ch.lessons || [])) {
            unlocked.add(lesson.id);
          }
        }
      }
    } else if (hasFullCourse) {
      // Curso completo: desbloqueo secuencial entre módulos
      let canContinue = true;
      for (const mod of modules) {
        for (const ch of (mod.chapters || [])) {
          for (const lesson of (ch.lessons || [])) {
            if (canContinue) {
              unlocked.add(lesson.id);
              if (!completedIds.includes(String(lesson.id))) {
                canContinue = false;
              }
            }
          }
        }
      }
    } else {
      // Compra por módulo: desbloqueo secuencial dentro de cada módulo comprado
      for (const mod of modules) {
        if (!purchasedModuleIds.includes(mod.id)) continue;
        let canContinue = true;
        for (const ch of (mod.chapters || [])) {
          for (const lesson of (ch.lessons || [])) {
            if (canContinue) {
              unlocked.add(lesson.id);
              if (!completedIds.includes(String(lesson.id))) {
                canContinue = false;
              }
            }
          }
        }
      }
    }

    return unlocked;
  }, [hasException, hasFullCourse, modules, purchasedModuleIds, completedIds]);

  const currentIndex = allLessons.findIndex(
    (l) => l.lesson.id === currentLessonId
  );
  const currentEntry = allLessons[currentIndex];

  // Next lesson must be unlocked
  const nextAccessibleIndex = useMemo(() => {
    for (let i = currentIndex + 1; i < allLessons.length; i++) {
      const entry = allLessons[i];
      const isAccessible = hasFullCourse || purchasedModuleIds.includes(entry.moduleId);
      if (isAccessible) return i;
    }
    return -1;
  }, [currentIndex, allLessons, hasFullCourse, purchasedModuleIds]);

  const hasNext = nextAccessibleIndex !== -1;

  // Check if the next lesson is already unlocked (current must be completed first)
  const isNextUnlocked = hasNext && unlockedLessonIds.has(allLessons[nextAccessibleIndex].lesson.id);

  const handleSelectLesson = useCallback((moduleId: number, lessonId: number) => {
    if (!unlockedLessonIds.has(lessonId)) return;
    setCurrentSession(null);  // clear any session intro
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
  }, [unlockedLessonIds]);

  const handleSelectSession = useCallback((session: CourseSession) => {
    if (!session.videoUrl) return;
    setCurrentSession(session);
  }, []);

  const handleMarkComplete = () => {
    const id = String(currentLessonId);
    if (!completedIds.includes(id)) {
      const newCompleted = [...completedIds, id];
      setCompletedIds(newCompleted);

      // Check if all accessible lessons are now complete
      if (!hasTestimonial) {
        const accessibleLessons = hasFullCourse
          ? allLessons
          : allLessons.filter((l) => purchasedModuleIds.includes(l.moduleId));
        const allDone = accessibleLessons.every((l) =>
          newCompleted.includes(String(l.lesson.id))
        );
        if (allDone) setShowTestimonialModal(true);
      }
    }
  };

  const handleNextLesson = () => {
    if (hasNext && nextAccessibleIndex !== -1) {
      const next = allLessons[nextAccessibleIndex];
      setCurrentSession(null);
      setCurrentModuleId(next.moduleId);
      setCurrentLessonId(next.lesson.id);
    }
  };

  if (!currentEntry) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden relative">
      {/* Platform Navbar */}
      <div className="z-50">
        {/* <PlatformNavbar user={user} /> */}
      </div>
      {/* Body del classroom con padding-top para dejar espacio a la barra */}
      <div className="flex flex-1 h-full pt-20 overflow-hidden relative">
        {/* Fondo fijo detrás del video */}
        <div
          className="absolute z-0 bg-cover bg-center hidden lg:block"
          style={{
            backgroundImage: "url(/images/FondoPlataforma/FondoClassroom.jpg)",
            opacity: 0.60,
            pointerEvents: "none",
            top: 0,
            bottom: 0,
            left: '300px',
            right: 0,
          }}
        />
        {/* Mobile background — no sidebar offset */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center lg:hidden"
          style={{
            backgroundImage: "url(/images/FondoPlataforma/FondoClassroom.jpg)",
            opacity: 0.30,
            pointerEvents: "none",
          }}
        />
        {/* Sidebar */}
        <ClassroomSidebar
          course={course}
          modules={modules}
          currentLessonId={currentLessonId}
          currentSessionDbId={currentSession?.dbId ?? null}
          completedLessonIds={completedIds}
          unlockedLessonIds={unlockedLessonIds}
          hasFullCourse={hasFullCourse}
          purchasedModuleIds={purchasedModuleIds}
          onSelectLesson={handleSelectLesson}
          onSelectSession={handleSelectSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Top bar (mobile) */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/80 border-b border-slate-700/50 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium truncate">
              {course.title}
            </span>
          </div>

          {/* Back link (desktop) */}
          <div className="hidden lg:flex items-center px-6 py-2 bg-slate-900/30">
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Volver al Dashboard
            </Link>
          </div>

          {/* ── Session intro video view ── */}
          {currentSession ? (
            <div className="flex-1 overflow-y-auto">
              {/* Minimal video player for session intro */}
              <div className="p-4 sm:p-6 bg-slate-900/60">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  <PlayCircle className="w-4 h-4" />
                  Sesión Introductoria
                </div>
                <h2 className="text-white text-xl font-bold mb-1">{currentSession.title}</h2>
                <p className="text-slate-400 text-sm mb-4">
                  {currentSession.videoUrl
                    ? "Video de introducción — completa las lecciones de esta sesión para avanzar."
                    : "Selecciona una lección de esta sesión para comenzar."}
                </p>
              </div>

              {/* Video embed — only shown if session has a video URL */}
              {currentSession.videoUrl && (
                <div className="px-4 pb-4 flex justify-center">
                  <div className="aspect-video bg-black rounded-xl overflow-hidden w-full max-w-3xl">
                    {getCloudflareStreamUrl(currentSession.videoUrl!) ? (
                      <CfStreamEmbed
                        src={getCloudflareStreamUrl(currentSession.videoUrl!)! + "?preload=auto&primaryColor=%2306b6d4"}
                        className="w-full h-full"
                      />
                    ) : getYoutubeEmbedUrl(currentSession.videoUrl!) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(currentSession.videoUrl!)!}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={currentSession.videoUrl} controls className="w-full h-full" />
                    )}
                  </div>
                </div>
              )}

              {/* Lessons preview */}
              {currentSession.lessons.length > 0 && (
                <div className="px-4 pb-6">
                  <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
                    Lecciones de esta sesión ({currentSession.lessons.length})
                  </h3>
                  <div className="space-y-1">
                    {currentSession.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (unlockedLessonIds.has(lesson.id)) {
                            setCurrentSession(null);
                            setCurrentLessonId(lesson.id);
                          }
                        }}
                        disabled={!unlockedLessonIds.has(lesson.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          unlockedLessonIds.has(lesson.id)
                            ? "hover:bg-slate-800/60 text-slate-300"
                            : "opacity-40 cursor-not-allowed text-slate-500"
                        }`}
                      >
                        <PlayCircle className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-sm truncate">{lesson.title}</span>
                        <span className="ml-auto text-slate-600 text-xs shrink-0">{lesson.duration}</span>
                        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Normal lesson video view ── */
            <div className="flex-1 overflow-y-auto">
              <VideoPlayer
                courseSlug={course.slug}
                gradient={course.gradient}
                chapterName={currentEntry.chapterName}
                lesson={currentEntry.lesson}
                isCompleted={completedIds.includes(String(currentLessonId))}
                hasNext={hasNext}
                isNextUnlocked={isNextUnlocked}
                onMarkComplete={handleMarkComplete}
                onNextLesson={handleNextLesson}
              />
              {/* Tabs */}
              <ClassroomTabs
                quiz={quizzesByCatalogLessonId?.[currentLessonId]}
                lessonMaterials={currentEntry.lesson.materials}
                lessonDbId={currentEntry.lesson.dbId}
                faqs={currentEntry.lesson.dbId ? (faqsByLessonDbId?.[currentEntry.lesson.dbId] ?? []) : []}
              />
            </div>
          )}
        </div>
      </div>
      {showTestimonialModal && (
        <TestimonialModal
          courseId={courseId}
          courseTitle={courseTitle}
          onClose={() => setShowTestimonialModal(false)}
        />
      )}
    </div>
  );
}