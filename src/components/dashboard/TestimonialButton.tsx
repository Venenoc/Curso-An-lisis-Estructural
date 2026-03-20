"use client";

import { useState, useEffect } from "react";
import { submitTestimonial, hasUserSubmittedTestimonial } from "@/app/actions/testimonials";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Star, X, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  courseId: string;
  courseTitle: string;
}

export default function TestimonialButton({ courseId, courseTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [content, setContent] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    hasUserSubmittedTestimonial(courseId).then(setAlreadySent);
  }, [courseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setError("Escribe tu testimonio."); return; }
    setLoading(true);
    setError("");
    const res = await submitTestimonial({ courseId, courseTitle, content, rating, authorRole });
    setLoading(false);
    if (res?.error) { setError(res.error); return; }
    setSubmitted(true);
    setAlreadySent(true);
  }

  if (alreadySent) {
    return (
      <div
        className="flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-md"
        style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.30)", color: "#86efac" }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Testimonio enviado
      </div>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm h-8 gap-1"
        style={{ borderRadius: "6px" }}
      >
        <MessageSquarePlus className="w-3.5 h-3.5" />
        Testimonio
      </Button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 relative"
            style={{
              background: "rgba(10,22,40,0.98)",
              border: "1px solid rgba(110,189,233,0.20)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-bold mb-2">¡Gracias por tu testimonio!</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Será revisado y publicado pronto en la plataforma.
                </p>
                <Button
                  onClick={() => { setOpen(false); setSubmitted(false); }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Cerrar
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-white text-lg font-bold mb-1">Deja tu testimonio</h3>
                <p className="text-slate-400 text-sm mb-5">
                  <span className="text-cyan-400 font-medium">{courseTitle}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Stars */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-2">
                      Calificación
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          onMouseEnter={() => setHovered(s)}
                          onMouseLeave={() => setHovered(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className="w-7 h-7"
                            fill={(hovered || rating) >= s ? "#f59e0b" : "transparent"}
                            stroke={(hovered || rating) >= s ? "#f59e0b" : "#475569"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role (optional) */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-1.5">
                      Tu rol / especialidad <span className="text-slate-500 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="Ej: Ing. Civil, Estudiante, Proyectista..."
                      maxLength={80}
                      className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-500"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-1.5">
                      Tu experiencia <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Cuéntanos qué aprendiste y cómo te ayudó este curso..."
                      rows={4}
                      maxLength={600}
                      className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                    />
                    <p className="text-slate-600 text-xs mt-1 text-right">{content.length}/600</p>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar testimonio"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
