"use client";

import { useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  Clock,
  X,
} from "lucide-react";
import type { CatalogCourse, CourseModule, CourseLesson } from "@/data/courses-catalog";

interface ClassroomSidebarProps {
  course: CatalogCourse;
  modules: CourseModule[];
  currentLessonId: number;
  completedLessonIds: string[];
  onSelectLesson: (moduleId: number, lessonId: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassroomSidebar({
  course,
  modules,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
  isOpen,
  onClose,
}: ClassroomSidebarProps) {
  // Find which module contains the current lesson to auto-expand it
  const currentModuleId = modules.find((m) =>
    m.lessons?.some((l) => l.id === currentLessonId)
  )?.id;

  const [expandedModules, setExpandedModules] = useState<number[]>(
    currentModuleId ? [currentModuleId] : [modules[0]?.id]
  );

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isLessonCompleted = (lessonId: number) =>
    completedLessonIds.includes(String(lessonId));

  const getModuleProgress = (module: CourseModule) => {
    if (!module.lessons) return { completed: 0, total: 0, percent: 0 };
    const total = module.lessons.length;
    const completed = module.lessons.filter((l) =>
      isLessonCompleted(l.id)
    ).length;
    return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
  };

  const getModuleStatus = (module: CourseModule) => {
    const { completed, total } = getModuleProgress(module);
    if (completed === total && total > 0) return "completed";
    if (completed > 0) return "in_progress";
    return "pending";
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative top-0 left-0 h-full z-50 lg:z-0 w-80 bg-slate-900 border-r border-slate-700/50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-sm truncate">
                {course.title}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {modules.length} módulos
              </p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modules list */}
        <div className="flex-1 overflow-y-auto">
          {modules.map((module, index) => {
            const isExpanded = expandedModules.includes(module.id);
            const progress = getModuleProgress(module);
            const status = getModuleStatus(module);

            return (
              <div key={module.id} className="border-b border-slate-800/50">
                {/* Module header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : status === "in_progress"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-700/50 text-slate-400"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium leading-tight">
                      {module.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            status === "completed"
                              ? "bg-green-500"
                              : "bg-cyan-500"
                          }`}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs shrink-0">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 mt-1 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Lessons */}
                {isExpanded && module.lessons && (
                  <div className="pb-2">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLessonId;
                      const isCompleted = isLessonCompleted(lesson.id);

                      return (
                        <button
                          key={`${module.id}-${lesson.id}`}
                          onClick={() => {
                            onSelectLesson(module.id, lesson.id);
                            onClose();
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 pl-8 text-left transition-colors ${
                            isActive
                              ? "bg-cyan-500/10 border-l-2 border-cyan-500"
                              : "hover:bg-slate-800/50 border-l-2 border-transparent"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          ) : isActive ? (
                            <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-sm block truncate ${
                                isActive
                                  ? "text-cyan-400 font-medium"
                                  : isCompleted
                                  ? "text-slate-400"
                                  : "text-slate-300"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-slate-600 text-xs flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
