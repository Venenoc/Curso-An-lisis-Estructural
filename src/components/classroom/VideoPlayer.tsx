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
import { getCloudflareStreamUrl } from "@/lib/utils";
import type { CourseLesson } from "@/data/courses-catalog";

declare global {
  interface Window {
    Stream?: (el: HTMLIFrameElement) => any;
  }
}

interface VideoPlayerProps {
  courseSlug: string;
  gradient: string;
  chapterName: string;
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
  chapterName,
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

  const cfIframeRef = useRef<HTMLIFrameElement>(null);
  const cfPlayerRef = useRef<any>(null);
  const maxWatchedRef = useRef(0);
  const sdkReadyRef = useRef(false);

  // HTML5 fallback refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxTimeRef = useRef(0);

  const cfStreamUrl = lesson.videoUrl ? getCloudflareStreamUrl(lesson.videoUrl) : null;

  // Reset al cambiar de lección
  useEffect(() => {
    setVideoEnded(false);
    maxWatchedRef.current = 0;
    maxTimeRef.current = 0;
    cfPlayerRef.current = null;
  }, [lesson.id]);

  // Cargar SDK de Cloudflare Stream una sola vez
  useEffect(() => {
    if (document.getElementById("cf-stream-sdk")) {
      sdkReadyRef.current = true;
      return;
    }
    const script = document.createElement("script");
    script.id = "cf-stream-sdk";
    script.src = "https://embed.cloudflarestream.com/embed/sdk.latest.js";
    script.onload = () => { sdkReadyRef.current = true; };
    document.head.appendChild(script);
  }, []);

  // Adjuntar SDK al iframe una vez que cargue (onLoad del iframe)
  const handleIframeLoad = useCallback(() => {
    const attach = () => {
      if (!cfIframeRef.current || !window.Stream) return;

      const player = window.Stream(cfIframeRef.current);
      cfPlayerRef.current = player;

      // Actualizar máximo visto mientras el video avanza
      player.addEventListener("timeupdate", () => {
        const t = player.currentTime;
        if (t > maxWatchedRef.current) {
          maxWatchedRef.current = t;
        }
      });

      // Bloquear adelanto: seeking se dispara cuando el usuario mueve la barra
      player.addEventListener("seeking", () => {
        if (player.currentTime > maxWatchedRef.current) {
          player.currentTime = maxWatchedRef.current;
        }
      });

      // Doble verificación al terminar el seek
      player.addEventListener("seeked", () => {
        if (player.currentTime > maxWatchedRef.current) {
          player.currentTime = maxWatchedRef.current;
        }
      });

      player.addEventListener("ended", () => {
        setVideoEnded(true);
      });
    };

    if (window.Stream) {
      attach();
    } else {
      // SDK aún cargando — esperar
      const interval = setInterval(() => {
        if (window.Stream) {
          clearInterval(interval);
          attach();
        }
      }, 50);
    }
  }, []);

  // HTML5 fallback: prevención de adelanto
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxTimeRef.current + 1) {
      video.currentTime = maxTimeRef.current;
    } else if (video.currentTime > maxTimeRef.current) {
      maxTimeRef.current = video.currentTime;
    }
  }, []);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxTimeRef.current + 1) {
      video.currentTime = maxTimeRef.current;
    }
  }, []);

  const handleVideoEnded = useCallback(() => { setVideoEnded(true); }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  const handleMarkComplete = async () => {
    setMarking(true);
    setError(null);
    try {
      const result = await markLessonComplete(courseSlug, lesson.id, lesson.dbId);
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

  const canMarkComplete = isCompleted || videoEnded || !lesson.videoUrl;

  return (
    <div className="flex flex-col items-center">
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-700/50 bg-slate-900/90 text-center">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 truncate">{chapterName}</p>
        <h1 className="text-white text-base sm:text-xl font-bold drop-shadow-lg text-center line-clamp-2">{lesson.title}</h1>
      </div>

      <div className="relative aspect-video bg-slate-950 w-full max-w-3xl mx-auto">
        {lesson.videoUrl ? (
          cfStreamUrl ? (
            <>
              <div
                className="absolute inset-0 z-10"
                onContextMenu={handleContextMenu}
                style={{ background: "transparent", pointerEvents: "none" }}
                aria-hidden="true"
              />
              <iframe
                ref={cfIframeRef}
                src={cfStreamUrl + "?preload=auto&primaryColor=%2306b6d4"}
                className="w-full h-full"
                style={{ border: "none" }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                onLoad={handleIframeLoad}
              />
            </>
          ) : (
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
              onDragStart={handleDragStart}
              preload="metadata"
            >
              <source src={lesson.videoUrl} type="video/mp4" />
            </video>
          )
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

      {error && (
        <div className="w-full px-6 py-3 bg-red-500/10 border-t border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-700/90 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-400 text-xs sm:text-sm">{lesson.duration}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isCompleted ? (
            <Button disabled className="bg-green-600/20 text-green-400 border border-green-500/30 cursor-default flex-1 sm:flex-none" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Completada
            </Button>
          ) : canMarkComplete ? (
            <Button onClick={handleMarkComplete} disabled={marking} className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1 sm:flex-none" size="sm">
              {marking ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
              <span className="hidden sm:inline">Marcar como completada</span>
              <span className="sm:hidden">Completar</span>
            </Button>
          ) : (
            <Button disabled className="bg-slate-700/90 text-slate-300 border border-slate-600 cursor-not-allowed shadow-lg flex-1 sm:flex-none" size="sm">
              <PlayCircle className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Termina el video para completar</span>
              <span className="sm:hidden">Ver video</span>
            </Button>
          )}
          {hasNext && (
            isNextUnlocked ? (
              <Button onClick={onNextLesson} className="bg-slate-700 hover:bg-slate-600 text-white flex-1 sm:flex-none" size="sm">
                <span className="hidden sm:inline">Siguiente Lección</span>
                <span className="sm:hidden">Siguiente</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button disabled className="bg-slate-700/90 text-slate-300 border border-slate-600 cursor-not-allowed shadow-lg flex-1 sm:flex-none" size="sm">
                <Lock className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Siguiente Lección</span>
                <span className="sm:hidden">Siguiente</span>
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}