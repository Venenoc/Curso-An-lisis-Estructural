"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCloudflareHlsUrl } from "@/lib/utils";

interface CfStreamEmbedProps {
  src: string;
  className?: string;
  onEnded?: () => void;
  preventSeeking?: boolean;
}

/**
 * Reproductor HLS nativo para videos de Cloudflare Stream.
 * Usa hls.js (igual que VideoPlayer) para arrancar en la máxima calidad disponible.
 * El prop `src` acepta cualquier formato que reconozca getCloudflareHlsUrl:
 *   - ID desnudo (32+ hex)
 *   - https://iframe.videodelivery.net/ID?...
 *   - https://customer-xxx.cloudflarestream.com/ID/iframe
 */
export default function CfStreamEmbed({
  src,
  className = "w-full h-full",
  onEnded,
  preventSeeking = false,
}: CfStreamEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const maxWatchedRef = useRef(0);

  // Extraer la URL HLS del manifest a partir del src (iframe URL o ID)
  const hlsUrl = getCloudflareHlsUrl(src);

  // Reiniciar seek-guard al cambiar de video
  useEffect(() => {
    maxWatchedRef.current = 0;
  }, [src]);

  // Inicializar HLS.js
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;
    let hls: any;

    const init = async () => {
      const Hls = (await import("hls.js")).default;
      const video = videoRef.current;
      if (!video) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          startLevel: -1,
          abrEwmaDefaultEstimate: 20_000_000, // sugiere ~20 Mbps → arranca en máxima calidad
        });
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        // Forzar el nivel más alto una vez que el manifest está disponible
        hls.on(Hls.Events.MANIFEST_PARSED, (_evt: any, data: any) => {
          if (data.levels && data.levels.length > 0) {
            hls.startLevel = data.levels.length - 1;
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari: HLS nativo
        video.src = hlsUrl;
      }
    };

    init();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl]);

  // Prevención de adelanto (opcional)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !preventSeeking) return;
    if (video.currentTime > maxWatchedRef.current + 1) {
      video.currentTime = maxWatchedRef.current;
    } else if (video.currentTime > maxWatchedRef.current) {
      maxWatchedRef.current = video.currentTime;
    }
  }, [preventSeeking]);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video || !preventSeeking) return;
    if (video.currentTime > maxWatchedRef.current + 1) {
      video.currentTime = maxWatchedRef.current;
    }
  }, [preventSeeking]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      onTimeUpdate={handleTimeUpdate}
      onSeeking={handleSeeking}
      onEnded={onEnded}
      preload="metadata"
    />
  );
}
