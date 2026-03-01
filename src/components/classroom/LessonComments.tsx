"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Trash2, MessageSquare, UserCircle2 } from "lucide-react";
import {
  getLessonComments,
  postLessonComment,
  deleteLessonComment,
  type LessonComment,
} from "@/app/actions/lesson-comments";

interface Props {
  lessonDbId: string;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function LessonComments({ lessonDbId }: Props) {
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setComments([]);
    getLessonComments(lessonDbId).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [lessonDbId]);

  async function handlePost() {
    if (!text.trim() || posting) return;
    setPosting(true);
    setError(null);
    const res = await postLessonComment(lessonDbId, text);
    if (res.error) {
      setError(res.error);
    } else if (res.comment) {
      setComments((prev) => [...prev, res.comment!]);
      setText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    setPosting(false);
  }

  async function handleDelete(commentId: string) {
    const res = await deleteLessonComment(commentId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        Comentarios
        {!loading && comments.length > 0 && (
          <span className="text-slate-500 text-xs font-normal ml-1">({comments.length})</span>
        )}
      </h3>

      {/* Lista */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-slate-400 text-sm font-medium">Sin comentarios aún</p>
            <p className="text-slate-600 text-xs mt-1">Sé el primero en comentar esta lección.</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {c.user.avatar_url ? (
                  <img
                    src={c.user.avatar_url}
                    alt={c.user.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <UserCircle2 className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white text-xs font-semibold">{c.user.full_name}</span>
                  <span className="text-slate-600 text-xs">{timeAgo(c.created_at)}</span>
                  {c.isOwn && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all"
                      title="Eliminar comentario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {c.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePost();
              }
            }}
            placeholder="Escribe un comentario… (Enter para enviar)"
            rows={2}
            maxLength={2000}
            className="flex-1 bg-slate-800/60 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 resize-none placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={handlePost}
            disabled={!text.trim() || posting}
            className="self-end p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <p className="text-slate-600 text-xs">{text.length}/2000</p>
      </div>
    </div>
  );
}
