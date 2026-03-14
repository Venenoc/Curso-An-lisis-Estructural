"use client";

import { useEffect, useState, useRef } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoReadyRef = useRef(false);
  const progressRef = useRef(0);

  useEffect(() => {
    // Escucha el evento del video de home
    const onVideoReady = () => {
      videoReadyRef.current = true;
    };
    window.addEventListener("splash:video-ready", onVideoReady);

    // Avanza el progreso hasta 80% rápido, luego espera el video
    const interval = setInterval(() => {
      progressRef.current = progressRef.current + 3;
      const next = progressRef.current;

      if (next >= 80 && !videoReadyRef.current) {
        // Pausa en 80 hasta que el video esté listo
        setProgress(80);
        return;
      }

      if (next >= 100 || (next >= 80 && videoReadyRef.current)) {
        const final = Math.min(next, 100);
        setProgress(final);
        if (final >= 100 || videoReadyRef.current) {
          clearInterval(interval);
          progressRef.current = 100;
          setProgress(100);
          setTimeout(() => {
            setLeaving(true);
            setTimeout(() => {
              window.dispatchEvent(new Event("splash:done"));
              setVisible(false);
            }, 700);
          }, 300);
        }
        return;
      }

      setProgress(next);
    }, 40);

    // Fallback: si el video tarda más de 6s, completar igual
    const fallback = setTimeout(() => {
      videoReadyRef.current = true;
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallback);
      window.removeEventListener("splash:video-ready", onVideoReady);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(46,63,84,0.78) 55%, rgba(22,34,51,0.82) 100%)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        transform: leaving ? "translateY(100%)" : "translateY(0)",
        transition: leaving
          ? "transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)"
          : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
          opacity: leaving ? 0 : 1,
          transform: leaving ? "scale(0.92)" : "scale(1)",
          transition: leaving
            ? "opacity 0.35s ease, transform 0.35s ease"
            : "none",
        }}
      >
        {/* Iniciales AE con Orbitron */}
        <div
          style={{
            fontFamily: "var(--font-orbitron), 'Orbitron', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(72px, 14vw, 120px)",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #e2eaf4 0%, #7cb9e8 45%, #22d3ee 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          AE
        </div>

        {/* Nombre */}
        <p
          style={{
            color: "rgba(180, 210, 240, 0.75)",
            fontFamily: "var(--font-orbitron), 'Orbitron', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            margin: 0,
            textAlign: "center",
          }}
        >
          Análisis Estructural
        </p>

        {/* Barra de progreso */}
        <div
          style={{
            width: "180px",
            height: "2px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #22d3ee, #3b82f6)",
              borderRadius: "2px",
              transition: "width 0.08s linear",
              boxShadow: "0 0 8px rgba(34,211,238,0.5)",
            }}
          />
        </div>

        <p
          style={{
            color: "rgba(180,210,240,0.4)",
            fontFamily: "var(--font-orbitron), system-ui, sans-serif",
            fontWeight: 400,
            fontSize: "11px",
            margin: 0,
            letterSpacing: "0.08em",
          }}
        >
          {progress}%
        </p>
      </div>
    </div>
  );
}
