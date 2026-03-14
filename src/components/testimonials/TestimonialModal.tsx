"use client";

import { useState, useEffect } from "react";
import { Star, X, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitTestimonial } from "@/app/actions/testimonials";

interface TestimonialModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

const STORAGE_KEY = (courseId: string) => `testimonial_skipped_${courseId}`;

export default function TestimonialModal({ courseId, courseTitle, onClose }: TestimonialModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already dismissed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const skipped = localStorage.getItem(STORAGE_KEY(courseId));
      if (skipped) onClose();
    }
  }, [courseId, onClose]);

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY(courseId), "1");
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (content.trim().length < 15) {
      setError("Por favor escribe al menos 15 caracteres.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await submitTestimonial({ courseId, courseTitle, content, rating, authorRole });
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
      setTimeout(onClose, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* Close */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {submitted ? (
            /* Success state */
            <div className="text-center py-6">
              <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">¡Gracias por tu opinión!</h3>
              <p className="text-slate-400 text-sm">
                Tu testimonio será revisado y publicado pronto.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    ¡Felicitaciones!
                  </span>
                </div>
                <h3 className="text-white text-xl font-bold leading-tight">
                  Completaste el curso
                </h3>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{courseTitle}</p>
              </div>

              <p className="text-slate-300 text-sm mb-5">
                ¿Qué te pareció? Tu opinión ayuda a otros ingenieros a elegir el mejor curso.
              </p>

              {/* Stars */}
              <div className="mb-4">
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Calificación
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                  Tu profesión (opcional)
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Ej: Ingeniero Civil, Estudiante de posgrado..."
                  maxLength={80}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                  Tu opinión *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="¿Qué aprendiste? ¿Cómo te ayudó el curso?"
                  rows={4}
                  maxLength={600}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
                <div className="text-right text-slate-600 text-xs mt-1">{content.length}/600</div>
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-3">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || content.trim().length < 15}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Enviando..." : "Enviar testimonio"}
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 bg-transparent"
                >
                  Ahora no
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
