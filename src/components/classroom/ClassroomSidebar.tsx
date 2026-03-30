"use client";

import { useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  Clock,
  Lock,
  BookOpen,
  X,
  Wrench,
  Download,
} from "lucide-react";
import type { CatalogCourse, CourseModule, CourseSession } from "@/types/database.types";

interface ClassroomSidebarProps {
  course: CatalogCourse;
  modules: CourseModule[];
  currentLessonId: number;
  currentSessionDbId?: string | null;
  completedLessonIds: string[];
  unlockedLessonIds: Set<number>;
  hasFullCourse: boolean;
  purchasedModuleIds: number[];
  onSelectLesson: (moduleId: number, lessonId: number) => void;
  onSelectSession?: (session: CourseSession) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassroomSidebar({
  course,
  modules,
  currentLessonId,
  currentSessionDbId,
  completedLessonIds,
  unlockedLessonIds,
  hasFullCourse,
  purchasedModuleIds,
  onSelectLesson,
  onSelectSession,
  isOpen,
  onClose,
}: ClassroomSidebarProps) {
  // Find which module contains the current lesson
  const activeModule = modules.find((m) =>
    m.chapters?.some((ch) => ch.lessons.some((l) => l.id === currentLessonId))
  ) ?? modules[0];

  const activeModuleIndex = modules.findIndex((m) => m.id === activeModule?.id);

  const [collapsedModules, setCollapsedModules] = useState<number[]>([]);

  const toggleModule = (moduleId: number) => {
    setCollapsedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isLessonCompleted = (lessonId: number) =>
    completedLessonIds.includes(String(lessonId));

  const isLessonUnlocked = (lessonId: number) =>
    unlockedLessonIds.has(lessonId);

  const isModulePurchased = (moduleId: number) =>
    hasFullCourse || purchasedModuleIds.includes(moduleId);

  const getModuleProgress = (module: CourseModule) => {
    const allLessons = (module.chapters || []).flatMap((ch) => ch.lessons);
    const total = allLessons.length;
    const completed = allLessons.filter((l) => isLessonCompleted(l.id)).length;
    return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
  };

  const getModuleStatus = (module: CourseModule) => {
    if (!isModulePurchased(module.id)) return "locked";
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
                Módulo {activeModuleIndex + 1} de {modules.length}
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

        {/* Download presentation button */}
        {activeModule?.presentationUrl && (
          <div className="px-4 py-3 border-b border-slate-700/50 shrink-0">
            <a
              href={activeModule.presentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: "rgba(34,211,238,0.12)",
                border: "1px solid rgba(34,211,238,0.25)",
                color: "#22d3ee",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(34,211,238,0.20)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,211,238,0.45)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(34,211,238,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,211,238,0.25)";
              }}
            >
              <Download className="w-4 h-4 shrink-0" />
              Descargar presentación
            </a>
          </div>
        )}

        {/* Single active module */}
        <div className="flex-1 overflow-y-auto">
          {[activeModule].filter(Boolean).map((module) => {
            const index = activeModuleIndex;
            const isExpanded = !collapsedModules.includes(module.id);
            const progress = getModuleProgress(module);
            const status = getModuleStatus(module);
            const moduleLocked = status === "locked";

            return (
              <div key={module.id} className="border-b border-slate-800/50">
                {/* Module header */}
                <button
                  onClick={() => !moduleLocked && toggleModule(module.id)}
                  className={`w-full p-4 flex items-start gap-3 transition-colors text-left ${
                    moduleLocked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      moduleLocked
                        ? "bg-slate-700/30 text-slate-600"
                        : status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : status === "in_progress"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-700/50 text-slate-400"
                    }`}
                  >
                    {moduleLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium leading-tight ${
                      moduleLocked ? "text-slate-600" : "text-white"
                    }`}>
                      {module.title}
                    </h3>
                    {moduleLocked ? (
                      <p className="text-slate-600 text-xs mt-1.5">
                        {hasFullCourse ? "Completa el módulo anterior" : "No comprado"}
                      </p>
                    ) : (
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
                    )}
                  </div>

                  {!moduleLocked && (
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 mt-1 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Chapters and Sessions/Lessons */}
                {isExpanded && !moduleLocked && (module.chapters || []).map((chapter) => (
                  <div key={chapter.id}>
                    {/* Chapter header */}
                    <div className="flex items-center gap-2 px-4 py-2 ml-4 border-l border-slate-700/50">
                      <BookOpen className="w-3 h-3 text-cyan-500/70 shrink-0" />
                      <span className="text-cyan-500/80 text-xs font-semibold uppercase tracking-wide truncate">
                        {chapter.title}
                      </span>
                    </div>

                    {chapter.sessions && chapter.sessions.length > 0 ? (
                      /* ── 4-level: sessions → lessons ─────────────────── */
                      <div className="pb-1">
                        {chapter.sessions.map((session) => {
                          const isTaller = session.type === 'taller';
                          const isSessionActive = currentSessionDbId === session.dbId;
                          // Sessions are always clickable (video is optional); talleres are not
                          const isClickable = !isTaller;

                          return (
                            <div key={session.dbId}>
                              {/* Session header */}
                              <button
                                onClick={() => {
                                  if (isClickable && onSelectSession) {
                                    onSelectSession(session);
                                    onClose();
                                  }
                                }}
                                disabled={!isClickable}
                                className={`w-full flex items-center gap-2 px-4 py-2 pl-10 text-left transition-colors ${
                                  isTaller
                                    ? "cursor-default"
                                    : isSessionActive
                                    ? "bg-indigo-500/10 border-l-2 border-indigo-400"
                                    : "hover:bg-slate-800/50 border-l-2 border-transparent"
                                }`}
                              >
                                {isTaller ? (
                                  <Wrench className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                                ) : (
                                  <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${
                                    isSessionActive ? "text-indigo-400" : "text-indigo-500/70"
                                  }`} />
                                )}
                                <span className={`text-xs font-semibold uppercase tracking-wide truncate ${
                                  isTaller
                                    ? "text-amber-500/80"
                                    : isSessionActive
                                    ? "text-indigo-300"
                                    : "text-indigo-400/80"
                                }`}>
                                  {session.title}
                                </span>
                                {!isTaller && session.videoUrl && (
                                  <span className="ml-auto text-indigo-600/50 text-xs shrink-0">▶ intro</span>
                                )}
                              </button>

                              {/* Lessons under session */}
                              <div className="pb-1">
                                {session.lessons.map((lesson) => {
                                  const isActive = lesson.id === currentLessonId && !currentSessionDbId;
                                  const isCompleted = isLessonCompleted(lesson.id);
                                  const isUnlocked = isLessonUnlocked(lesson.id);

                                  return (
                                    <button
                                      key={`${chapter.id}-${session.dbId}-${lesson.id}`}
                                      title={lesson.title}
                                      onClick={() => {
                                        if (!isUnlocked) return;
                                        onSelectLesson(module.id, lesson.id);
                                        onClose();
                                      }}
                                      disabled={!isUnlocked}
                                      className={`w-full flex items-center gap-3 px-4 py-2.5 pl-14 text-left transition-colors ${
                                        !isUnlocked
                                          ? "opacity-40 cursor-not-allowed border-l-2 border-transparent"
                                          : isActive
                                          ? "bg-cyan-500/10 border-l-2 border-cyan-500"
                                          : "hover:bg-slate-800/50 border-l-2 border-transparent"
                                      }`}
                                    >
                                      {!isUnlocked ? (
                                        <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                                      ) : isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                      ) : isActive ? (
                                        <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                                      ) : (
                                        <PlayCircle className="w-4 h-4 text-slate-600 shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <span className={`text-sm block truncate ${
                                          !isUnlocked
                                            ? "text-slate-600"
                                            : isActive
                                            ? "text-cyan-400 font-medium"
                                            : isCompleted
                                            ? "text-slate-400"
                                            : "text-slate-300"
                                        }`}>
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
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* ── 3-level fallback: lessons directly under chapter ─ */
                      <div className="pb-1">
                        {chapter.lessons.map((lesson) => {
                          const isActive = lesson.id === currentLessonId;
                          const isCompleted = isLessonCompleted(lesson.id);
                          const isUnlocked = isLessonUnlocked(lesson.id);

                          return (
                            <button
                              key={`${chapter.id}-${lesson.id}`}
                              title={lesson.title}
                              onClick={() => {
                                if (!isUnlocked) return;
                                onSelectLesson(module.id, lesson.id);
                                onClose();
                              }}
                              disabled={!isUnlocked}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 pl-12 text-left transition-colors ${
                                !isUnlocked
                                  ? "opacity-40 cursor-not-allowed border-l-2 border-transparent"
                                  : isActive
                                  ? "bg-cyan-500/10 border-l-2 border-cyan-500"
                                  : "hover:bg-slate-800/50 border-l-2 border-transparent"
                              }`}
                            >
                              {!isUnlocked ? (
                                <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                              ) : isActive ? (
                                <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                              ) : (
                                <PlayCircle className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm block truncate ${
                                  !isUnlocked
                                    ? "text-slate-600"
                                    : isActive
                                    ? "text-cyan-400 font-medium"
                                    : isCompleted
                                    ? "text-slate-400"
                                    : "text-slate-300"
                                }`}>
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
                ))}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
