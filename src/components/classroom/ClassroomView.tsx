"use client";

import { useState, useMemo } from "react";
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
}

export default function ClassroomView({
  course,
  completedLessonIds: initialCompleted,
  profileId,
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

  const [currentModuleId, setCurrentModuleId] = useState(firstLesson?.moduleId || 0);
  const [currentLessonId, setCurrentLessonId] = useState(firstLesson?.lesson.id || 0);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompleted);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentIndex = allLessons.findIndex(
    (l) => l.lesson.id === currentLessonId
  );
  const currentEntry = allLessons[currentIndex];
  const hasNext = currentIndex < allLessons.length - 1;

  const handleSelectLesson = (moduleId: number, lessonId: number) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
  };

  const handleMarkComplete = () => {
    const id = String(currentLessonId);
    if (!completedIds.includes(id)) {
      setCompletedIds((prev) => [...prev, id]);
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      const next = allLessons[currentIndex + 1];
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
