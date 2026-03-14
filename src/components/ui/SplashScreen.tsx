"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(interval);
          setLeaving(true);
          window.setTimeout(() => {
            setVisible(false);
          }, 700);
          return 100;
        }
        return Math.min(current + 4, 100);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(135deg, #0f0a0a 0%, #1a0808 60%, #0f0a0a 100%)",
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
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          opacity: leaving ? 0 : 1,
          transform: leaving ? "scale(0.92)" : "scale(1)",
          transition: leaving
            ? "opacity 0.35s ease, transform 0.35s ease"
            : "none",
        }}
      >
        <Image
          src="/images/Uni-logo_transparente_granate.png"
          alt="Albert Structural"
          width={180}
          height={180}
          priority
          style={{ objectFit: "contain", height: "auto" }}
        />
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "13px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            margin: 0,
            textAlign: "center",
          }}
        >
          Albert Structural
        </p>

        {/* Barra de progreso */}
        <div
          style={{
            width: "160px",
            height: "2px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #b91c1c, #ef4444)",
              borderRadius: "2px",
              transition: "width 0.05s linear",
            }}
          />
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            margin: 0,
            letterSpacing: "0.05em",
          }}
        >
          {progress}%
        </p>
      </div>
    </div>
  );
}
