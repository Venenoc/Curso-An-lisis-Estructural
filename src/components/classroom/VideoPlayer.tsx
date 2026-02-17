"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/app/actions/courses";
import type { CourseLesson } from "@/data/courses-catalog";

interface VideoPlayerProps {
  courseSlug: string;
  gradient: string;
  moduleName: string;
  lesson: CourseLesson;
  isCompleted: boolean;
  hasNext: boolean;
  isNextUnlocked: boolean;
  onMarkComplete: () => void;
  onNextLesson: () => void;
}

export default function VideoPlayer({
  courseSlug,
  gradient,
  moduleName,
  lesson,
  isCompleted,
  hasNext,
  isNextUnlocked,
  onMarkComplete,
  onNextLesson,
}: VideoPlayerProps) {
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxTimeRef = useRef(0);

  // Reset videoEnded when lesson changes
  useEffect(() => {
    setVideoEnded(false);
    maxTimeRef.current = 0;
  }, [lesson.id]);

  // Prevent seeking forward beyond what has been watched
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxTimeRef.current + 1) {
      video.currentTime = maxTimeRef.current;
    } else if (video.currentTime > maxTimeRef.current) {
      maxTimeRef.current = video.currentTime;
    }
  }, []);

  // Prevent seeking via the seeking event
  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxTimeRef.current + 1) {
      video.currentTime = maxTimeRef.current;
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setVideoEnded(true);
  }, []);

  // Prevent right-click context menu on video (blocks "Save video as...")
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleMarkComplete = async () => {
    setMarking(true);
    setError(null);
    try {
      const result = await markLessonComplete(courseSlug, lesson.id);
      if (result?.error) {
        setError(result.error);
      } else {
        onMarkComplete();
      }
    } catch (e: any) {
      setError(e.message || "Error inesperado");
    } finally {
      setMarking(false);
    }
  };

  // Show mark complete button only if: already completed OR video ended OR no video
  const canMarkComplete = isCompleted || videoEnded || !lesson.videoUrl;

  return (
    <div className="flex flex-col items-center">
      {/* Module & Lesson Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
          {moduleName}
        </p>
        <h1 className="text-white text-xl font-bold">{lesson.title}</h1>
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-slate-950 w-full max-w-3xl mx-auto">
        {lesson.videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full bg-black"
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onEnded={handleVideoEnded}
            onContextMenu={handleContextMenu}
            preload="metadata"
          >
            <source src={lesson.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <>
            <div
              className={`w-full h-full bg-gradient-to-br ${gradient} opacity-20 absolute inset-0`}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                <PlayCircle className="w-10 h-10 text-white/70" />
              </div>
              <p className="text-white/60 text-sm">Video próximamente</p>
              <p className="text-white/40 text-xs mt-1">{lesson.duration}</p>
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="w-full px-6 py-3 bg-red-500/10 border-t border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-slate-500" />
          <span className="text-slate-400 text-sm">{lesson.duration}</span>
        </div>

        <div className="flex items-center gap-3">
          {isCompleted ? (
            <Button
              disabled
              className="bg-green-600/20 text-green-400 border border-green-500/30 cursor-default"
              size="sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completada
            </Button>
          ) : canMarkComplete ? (
            <Button
              onClick={handleMarkComplete}
              disabled={marking}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              size="sm"
            >
              {marking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Marcar como completada
            </Button>
          ) : (
            <Button
              disabled
              className="bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              size="sm"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Termina el video para completar
            </Button>
          )}

          {hasNext && (
            isNextUnlocked ? (
              <Button
                onClick={onNextLesson}
                className="bg-slate-700 hover:bg-slate-600 text-white"
                size="sm"
              >
                Siguiente Lección
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                disabled
                className="bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                size="sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                Siguiente Lección
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
