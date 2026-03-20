"use client";

import Link from "next/link";

interface FreeCourse {
  id: string;
  title: string;
  description: string;
  videoId: string;
  playlistId?: string;
  duration: string;
  lessons?: number;
  tag: string;
  tagColor: string;
}

const FREE_COURSES: FreeCourse[] = [
  {
    id: "1",
    title: "Análisis Matricial de Estructuras",
    description: "Fundamentos del método de rigidez, ensamblaje de matrices y resolución de sistemas estructurales desde cero.",
    videoId: "dQw4w9WgXcQ",
    duration: "2h 45min",
    lessons: 12,
    tag: "Fundamentos",
    tagColor: "#3b82f6",
  },
  {
    id: "2",
    title: "SAP2000 para Principiantes",
    description: "Aprende a modelar, analizar y diseñar estructuras en SAP2000 con ejercicios prácticos paso a paso.",
    videoId: "dQw4w9WgXcQ",
    playlistId: "PLxxxxxx",
    duration: "3h 20min",
    lessons: 15,
    tag: "SAP2000",
    tagColor: "#10b981",
  },
  {
    id: "3",
    title: "Diseño Sísmico Basado en Norma",
    description: "Espectros de respuesta, análisis modal espectral y verificación por desplazamientos según norma sísmica.",
    videoId: "dQw4w9WgXcQ",
    duration: "1h 55min",
    lessons: 8,
    tag: "Sísmica",
    tagColor: "#f59e0b",
  },
  {
    id: "4",
    title: "ETABS: Edificios de Concreto Armado",
    description: "Modelado de edificios multipiso, asignación de cargas sísmicas y verificación de derivas con ETABS.",
    videoId: "dQw4w9WgXcQ",
    playlistId: "PLyyyyyy",
    duration: "4h 10min",
    lessons: 18,
    tag: "ETABS",
    tagColor: "#8b5cf6",
  },
  {
    id: "5",
    title: "Método de Elementos Finitos",
    description: "Teoría y aplicación del MEF: elementos tipo barra, viga y placa con ejemplos numéricos detallados.",
    videoId: "dQw4w9WgXcQ",
    duration: "2h 30min",
    lessons: 10,
    tag: "MEF",
    tagColor: "#ef4444",
  },
  {
    id: "6",
    title: "Análisis de Pórticos Planos",
    description: "Resolución de pórticos por el método de rigidez directo, diagramas de esfuerzos y deformaciones.",
    videoId: "dQw4w9WgXcQ",
    duration: "1h 40min",
    lessons: 7,
    tag: "Fundamentos",
    tagColor: "#3b82f6",
  },
];

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="white">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function CursosFreeContent() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #070f1e 0%, #0a1628 60%, #070f1e 100%)" }}>

      {/* ── Hero ── */}
      <section style={{ paddingTop: "120px", paddingBottom: "60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "600px", height: "300px",
          background: "radial-gradient(ellipse, rgba(34,211,238,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)",
            borderRadius: "50px", padding: "6px 16px", marginBottom: "24px",
          }}>
            <YoutubeIcon className="w-4 h-4 text-red-500" />
            <span style={{ color: "#ef4444", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}>
              100% GRATIS EN YOUTUBE
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: "20px",
            background: "linear-gradient(135deg, #e2eaf4 0%, #7cb9e8 50%, #22d3ee 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Cursos Gratuitos de<br />Análisis Estructural
          </h1>

          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: "17px", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 40px" }}>
            Aprende análisis estructural con estos recursos gratuitos directamente en YouTube.
            Sin registro, sin costo, a tu propio ritmo.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
            {[
              { value: FREE_COURSES.length.toString(), label: "Cursos" },
              { value: FREE_COURSES.reduce((s, c) => s + (c.lessons ?? 0), 0).toString() + "+", label: "Videos" },
              { value: "0 S/.", label: "Costo" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#22d3ee", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "24px",
        }}>
          {FREE_COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        maxWidth: "700px", margin: "0 auto 80px", padding: "0 24px",
        textAlign: "center",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(110,189,233,0.15)",
          borderRadius: "24px",
          padding: "48px 32px",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
            ¿Quieres ir más lejos?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
            Los cursos de la plataforma incluyen ejercicios, quizzes, certificado y soporte directo.
          </p>
          <Link href="/cursos_m"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #6EBDE9 0%, #3b82f6 55%, #6366f1 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "15px",
              padding: "12px 32px",
              borderRadius: "12px",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
            }}
          >
            Ver cursos de pago
          </Link>
        </div>
      </section>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: FreeCourse }) {
  const thumbUrl = `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`;
  const youtubeUrl = course.playlistId
    ? `https://www.youtube.com/playlist?list=${course.playlistId}`
    : `https://www.youtube.com/watch?v=${course.videoId}`;

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}
    >
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(110,189,233,0.30)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: "relative", aspectRatio: "16/9", background: "#0f1e38", overflow: "hidden" }}>
          <img
            src={thumbUrl}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          {/* Play overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "rgba(239,68,68,0.90)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
            }}>
              <PlayIcon />
            </div>
          </div>
          {/* YouTube badge */}
          <div style={{
            position: "absolute", bottom: "10px", right: "10px",
            background: "rgba(0,0,0,0.75)", borderRadius: "6px",
            padding: "3px 8px", display: "flex", alignItems: "center", gap: "5px",
          }}>
            <YoutubeIcon className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>YouTube</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* Tag */}
          <span style={{
            display: "inline-block",
            background: `${course.tagColor}22`,
            border: `1px solid ${course.tagColor}55`,
            color: course.tagColor,
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em",
            padding: "3px 10px", borderRadius: "50px",
            marginBottom: "10px",
          }}>
            {course.tag}
          </span>

          <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, lineHeight: 1.4, marginBottom: "8px" }}>
            {course.title}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
            {course.description}
          </p>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "rgba(255,255,255,0.40)", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {course.duration}
            </span>
            {course.lessons && (
              <span style={{ color: "rgba(255,255,255,0.40)", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                {course.lessons} videos
              </span>
            )}
            <span style={{ marginLeft: "auto", color: "#22d3ee", fontSize: "12px", fontWeight: 700 }}>
              GRATIS
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
