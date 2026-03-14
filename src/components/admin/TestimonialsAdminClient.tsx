"use client";

import { useState, useTransition } from "react";
import { Star, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveTestimonial, rejectTestimonial } from "@/app/actions/testimonials";

type Testimonial = {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  rating: number;
  course_title: string;
  is_approved: boolean;
  created_at: string;
};

export default function TestimonialsAdminClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const result = await approveTestimonial(id);
      if (!result?.error) {
        setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t)));
      }
      setActionId(null);
    });
  };

  const handleReject = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const result = await rejectTestimonial(id);
      if (!result?.error) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
      }
      setActionId(null);
    });
  };

  const pendingList = testimonials.filter((t) => !t.is_approved);
  const approvedList = testimonials.filter((t) => t.is_approved);

  function TestimonialCard({ t }: { t: Testimonial }) {
    const isLoading = actionId === t.id && pending;
    return (
      <div className={`bg-white/10 backdrop-blur-sm border rounded-xl p-5 ${t.is_approved ? "border-green-500/30" : "border-slate-600/50"}`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {t.author_name[0]}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t.author_name}</p>
              {t.author_role && <p className="text-slate-400 text-xs">{t.author_role}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
            ))}
          </div>
        </div>
        <p className="text-cyan-400 text-xs font-medium mb-2 truncate">{t.course_title}</p>
        <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-4">&ldquo;{t.content}&rdquo;</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-600 text-xs">
            {new Date(t.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <div className="flex gap-2">
            {!t.is_approved && (
              <Button size="sm" onClick={() => handleApprove(t.id)} disabled={isLoading}
                className="bg-green-600 hover:bg-green-500 text-white h-7 px-3 text-xs">
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                Aprobar
              </Button>
            )}
            {t.is_approved && (
              <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                <Check className="w-3 h-3" /> Publicado
              </span>
            )}
            <Button size="sm" onClick={() => handleReject(t.id)} disabled={isLoading}
              className="bg-red-600/80 hover:bg-red-600 text-white h-7 px-3 text-xs">
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3 mr-1" />}
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">Pendientes de aprobacion</h2>
          <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full">{pendingList.length}</span>
        </div>
        {pendingList.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay testimonios pendientes.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendingList.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        )}
      </section>
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">Publicados</h2>
          <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">{approvedList.length}</span>
        </div>
        {approvedList.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay testimonios aprobados aun.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {approvedList.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}
