"use client";

import { useState, useMemo, useCallback } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClassroomSidebar from "./ClassroomSidebar";
import VideoPlayer from "./VideoPlayer";
import ClassroomTabs from "./ClassroomTabs";
import type { CatalogCourse, CourseLesson } from "@/data/courses-catalog";

interface ClassroomViewProps {
  course: CatalogCourse;
  completedLessonIds: string[];
  profileId: string;
  hasFullCourse: boolean;
  purchasedModuleIds: number[];
}

export default function ClassroomView({
  course,
  completedLessonIds: initialCompleted,
  profileId,
  hasFullCourse,
  purchasedModuleIds,
}: ClassroomViewProps) {
  const modules = course.modules || [];

  // Flatten all lessons with their module info
  const allLessons = useMemo(() => {
    const lessons: { moduleId: number; moduleName: string; lesson: CourseLesson }[] = [];
    modules.forEach((m) => {
      (m.lessons || []).forEach((l) => {
        lessons.push({ moduleId: m.id, moduleName: m.title, lesson: l });
      });
    });
    return lessons;
  }, [modules]);

  const firstLesson = allLessons[0];

  const [, setCurrentModuleId] = useState(firstLesson?.moduleId || 0);
  const [currentLessonId, setCurrentLessonId] = useState(firstLesson?.lesson.id || 0);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompleted);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Compute which lessons are unlocked based on purchase type and progress
  const unlockedLessonIds = useMemo(() => {
    const unlocked = new Set<number>();

    if (hasFullCourse) {
      // Full course: sequential unlock across modules
      // First lesson of first module is always unlocked
      let canContinue = true;
      for (const mod of modules) {
        const moduleLessons = mod.lessons || [];
        for (let i = 0; i < moduleLessons.length; i++) {
          const lesson = moduleLessons[i];
          if (canContinue) {
            unlocked.add(lesson.id);
            // If this lesson is NOT completed, lock everything after it
            if (!completedIds.includes(String(lesson.id))) {
              canContinue = false;
            }
          }
        }
      }
    } else {
      // Module purchases: only unlock lessons in purchased modules, sequentially
      for (const mod of modules) {
        if (!purchasedModuleIds.includes(mod.id)) continue;
        const moduleLessons = mod.lessons || [];
        for (let i = 0; i < moduleLessons.length; i++) {
          const lesson = moduleLessons[i];
          if (i === 0) {
            // First lesson of purchased module is always unlocked
            unlocked.add(lesson.id);
          } else {
            // Unlock only if previous lesson in this module is completed
            const prevLesson = moduleLessons[i - 1];
            if (completedIds.includes(String(prevLesson.id))) {
              unlocked.add(lesson.id);
            }
          }
        }
      }
    }

    return unlocked;
  }, [hasFullCourse, modules, purchasedModuleIds, completedIds]);

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
    // Only allow selecting unlocked lessons
    if (!unlockedLessonIds.has(lessonId)) return;
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
  }, [unlockedLessonIds]);

  const handleMarkComplete = () => {
    const id = String(currentLessonId);
    if (!completedIds.includes(id)) {
      setCompletedIds((prev) => [...prev, id]);
    }
  };

  const handleNextLesson = () => {
    if (hasNext && nextAccessibleIndex !== -1) {
      const next = allLessons[nextAccessibleIndex];
      // After marking current complete, the next lesson should be unlocked
      setCurrentModuleId(next.moduleId);
      setCurrentLessonId(next.lesson.id);
    }
  };

  if (!currentEntry) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Platform Navbar */}
      <div className="z-50">
        {/* <PlatformNavbar user={user} /> */}
      </div>
      {/* Body del classroom con padding-top para dejar espacio a la barra */}
      <div className="flex flex-1 h-full pt-0 overflow-hidden">
        {/* Sidebar */}
        <ClassroomSidebar
          course={course}
          modules={modules}
          currentLessonId={currentLessonId}
          completedLessonIds={completedIds}
          unlockedLessonIds={unlockedLessonIds}
          hasFullCourse={hasFullCourse}
          purchasedModuleIds={purchasedModuleIds}
          onSelectLesson={handleSelectLesson}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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

          {/* Video Player */}
          <div className="flex-1 overflow-y-auto">
            <VideoPlayer
              courseSlug={course.slug}
              gradient={course.gradient}
              moduleName={currentEntry.moduleName}
              lesson={currentEntry.lesson}
              isCompleted={completedIds.includes(String(currentLessonId))}
              hasNext={hasNext}
              isNextUnlocked={isNextUnlocked}
              onMarkComplete={handleMarkComplete}
              onNextLesson={handleNextLesson}
            />
            {/* Tabs */}
            <ClassroomTabs lessonTitle={currentEntry.lesson.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
