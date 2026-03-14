"use client";

import { useRef, useEffect, useCallback } from "react";

declare global {
  interface Window { Stream: (el: HTMLIFrameElement) => any; }
}

interface CfStreamEmbedProps {
  src: string;
  className?: string;
  onEnded?: () => void;
  preventSeeking?: boolean;
}

/** Embedded Cloudflare Stream player with optional seek prevention. */
export default function CfStreamEmbed({
  src,
  className = "w-full h-full",
  onEnded,
  preventSeeking = false,
}: CfStreamEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const maxWatchedRef = useRef(0);

  // Load CF Stream SDK once
  useEffect(() => {
    if (document.getElementById("cf-stream-sdk")) return;
    const script = document.createElement("script");
    script.id = "cf-stream-sdk";
    script.src = "https://embed.cloudflarestream.com/embed/sdk.latest.js";
    document.head.appendChild(script);
  }, []);

  const handleLoad = useCallback(() => {
    const attach = () => {
      if (!iframeRef.current || !window.Stream) return;
      const player = window.Stream(iframeRef.current);

      if (preventSeeking) {
        player.addEventListener("timeupdate", () => {
          const t = player.currentTime;
          if (t > maxWatchedRef.current) maxWatchedRef.current = t;
        });
        player.addEventListener("seeking", () => {
          if (player.currentTime > maxWatchedRef.current)
            player.currentTime = maxWatchedRef.current;
        });
        player.addEventListener("seeked", () => {
          if (player.currentTime > maxWatchedRef.current)
            player.currentTime = maxWatchedRef.current;
        });
      }

      if (onEnded) {
        player.addEventListener("ended", onEnded);
      }
    };

    if (window.Stream) {
      attach();
    } else {
      const iv = setInterval(() => {
        if (window.Stream) { clearInterval(iv); attach(); }
      }, 50);
    }
  }, [onEnded, preventSeeking]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      className={className}
      style={{ border: "none" }}
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
      allowFullScreen
      onLoad={handleLoad}
    />
  );
}