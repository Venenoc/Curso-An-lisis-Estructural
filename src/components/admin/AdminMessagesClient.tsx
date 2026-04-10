"use client";

import { useState, useTransition } from "react";
import { createAdminReply } from "@/app/actions/community";
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  User,
  ShieldCheck,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  id: string;
  content: string;
  created_at: string;
  profiles: { id: string; full_name: string | null; role: string } | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: { id: string; full_name: string | null } | null;
  community_replies: Reply[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasInstructorReply(replies: Reply[]) {
  return replies.some(
    (r) => r.profiles?.role === "instructor" || r.profiles?.role === "admin"
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Reply[]>(post.community_replies);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const instructorReplied = hasInstructorReply(replies);

  function handleReply() {
    if (!replyText.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createAdminReply(post.id, replyText.trim());
      if (res.error) {
        setError(res.error);
        return;
      }
      setReplies((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: replyText.trim(),
          created_at: new Date().toISOString(),
          profiles: { id: "", full_name: "Tú (instructor)", role: "instructor" },
        },
      ]);
      setReplyText("");
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
      {/* Post header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">
              {post.profiles?.full_name || "Anónimo"}
            </span>
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(post.created_at)}
            </span>
            {!instructorReplied && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                Sin respuesta
              </span>
            )}
            {instructorReplied && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                Respondido
              </span>
            )}
          </div>
          <p className="text-slate-200 text-sm font-medium mt-0.5 truncate">{post.title}</p>
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{post.content}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-slate-500 text-xs">
          <MessageCircle className="w-4 h-4" />
          {replies.length}
          {open ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </div>
      </button>

      {/* Expanded replies + reply form */}
      {open && (
        <div className="border-t border-white/10 px-5 py-4 space-y-4">
          {/* Full post content */}
          <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
            {post.content}
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="space-y-3">
              {replies.map((reply) => {
                const isInstructor =
                  reply.profiles?.role === "instructor" ||
                  reply.profiles?.role === "admin";
                return (
                  <div
                    key={reply.id}
                    className={`flex gap-3 ${isInstructor ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isInstructor
                          ? "bg-cyan-500/20 border border-cyan-500/30"
                          : "bg-slate-700 border border-slate-600"
                      }`}
                    >
                      {isInstructor ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <div
                      className={`flex-1 rounded-xl px-4 py-3 text-sm ${
                        isInstructor
                          ? "bg-cyan-500/15 border border-cyan-500/20 text-cyan-100"
                          : "bg-slate-800/60 border border-white/5 text-slate-300"
                      }`}
                    >
                      <p className="font-medium text-xs mb-1 opacity-70">
                        {reply.profiles?.full_name || "Anónimo"}
                        {isInstructor && " (Instructor)"}
                        {" · "}
                        {formatDate(reply.created_at)}
                      </p>
                      {reply.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {replies.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-2">
              Sin respuestas aún — sé el primero en responder.
            </p>
          )}

          {/* Reply form */}
          <div className="flex gap-3 pt-2">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe tu respuesta como instructor..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex justify-end">
                <button
                  onClick={handleReply}
                  disabled={isPending || !replyText.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Responder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminMessagesClient({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState<"all" | "pending">("all");

  const filtered =
    filter === "pending"
      ? posts.filter((p) => !hasInstructorReply(p.community_replies))
      : posts;

  const pendingCount = posts.filter(
    (p) => !hasInstructorReply(p.community_replies)
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-white">Mensajes de la Comunidad</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Responde a los estudiantes desde aquí
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium">
            {pendingCount} sin respuesta
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              filter === tab
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab === "all" ? `Todos (${posts.length})` : `Sin respuesta (${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/10 bg-slate-900/40">
          <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            {filter === "pending"
              ? "¡Todos los mensajes tienen respuesta del instructor!"
              : "No hay publicaciones en la comunidad aún."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
