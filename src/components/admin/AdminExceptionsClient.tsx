"use client";

import { useState, useTransition } from "react";
import { findProfileByEmail, grantException, revokeException } from "@/app/actions/exceptions";
import { UserCheck, Trash2, Search, Plus, ShieldCheck } from "lucide-react";

interface Course { slug: string; title: string }
interface Exception {
  id: string;
  course_slug: string;
  note: string | null;
  granted_at: string;
  user_id: string;
  user_email: string | null;
  profiles: { full_name: string | null } | null;
}

export default function AdminExceptionsClient({
  courses,
  exceptions: initial,
}: {
  courses: Course[];
  exceptions: Exception[];
}) {
  const [exceptions, setExceptions] = useState(initial);
  const [email, setEmail] = useState("");
  const [foundProfile, setFoundProfile] = useState<{ id: string; auth_user_id: string; full_name: string | null; email: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(courses[0]?.slug ?? "");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    setFoundProfile(null);
    setSearchError(null);
    startTransition(async () => {
      const res = await findProfileByEmail(email);
      if (res.error) setSearchError(res.error);
      else setFoundProfile(res.profile!);
    });
  };

  const handleGrant = () => {
    if (!foundProfile) return;
    setFormError(null);
    const fd = new FormData();
    fd.append("profile_id",   foundProfile.id);
    fd.append("auth_user_id", foundProfile.auth_user_id);
    fd.append("course_slug",  selectedSlug);
    fd.append("user_email",   foundProfile.email);
    if (note) fd.append("note", note);
    startTransition(async () => {
      const res = await grantException(fd);
      if (res.error) { setFormError(res.error); return; }
      window.location.reload();
    });
  };

  const handleRevoke = (id: string) => {
    startTransition(async () => {
      await revokeException(id);
      setExceptions((prev) => prev.filter((e) => e.id !== id));
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Accesos Gratuitos</h1>
            <p className="text-slate-500 text-sm">Otorga acceso completo a un curso sin pago</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 mb-8">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Otorgar acceso
          </h2>

          <div className="flex gap-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFoundProfile(null); setSearchError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Email del usuario..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleSearch}
              disabled={isPending || !email.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-colors"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>

          {searchError && <p className="text-red-400 text-sm mb-4">{searchError}</p>}

          {foundProfile && (
            <div className="rounded-xl bg-slate-800/60 border border-white/10 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium text-sm">{foundProfile.full_name || "Sin nombre"}</p>
                  <p className="text-slate-400 text-xs">{foundProfile.email}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Curso</label>
                  <select
                    value={selectedSlug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-700 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  >
                    {courses.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Nota interna (opcional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ej: becado, colaborador..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-700 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {formError && <p className="text-red-400 text-sm">{formError}</p>}

              <button
                onClick={handleGrant}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 transition-colors"
              >
                Otorgar acceso gratuito
              </button>
            </div>
          )}
        </div>

        {/* Lista de accesos activos */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Accesos activos</h2>
            <span className="text-slate-500 text-xs">{exceptions.length} total</span>
          </div>

          {exceptions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShieldCheck className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No hay accesos gratuitos otorgados aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {exceptions.map((ex) => {
                const courseTitle = courses.find((c) => c.slug === ex.course_slug)?.title ?? ex.course_slug;
                const userName = ex.profiles?.full_name || "Sin nombre";
                return (
                  <div key={ex.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {userName}
                        {ex.user_email && <span className="text-slate-400 font-normal"> · {ex.user_email}</span>}
                      </p>
                      <p className="text-cyan-400 text-xs mt-0.5">{courseTitle}</p>
                      {ex.note && <p className="text-slate-500 text-xs mt-0.5 italic">{ex.note}</p>}
                    </div>
                    <p className="text-slate-600 text-xs shrink-0 hidden sm:block">
                      {new Date(ex.granted_at).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <button
                      onClick={() => handleRevoke(ex.id)}
                      disabled={isPending}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors shrink-0"
                      title="Revocar acceso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
  );
}
