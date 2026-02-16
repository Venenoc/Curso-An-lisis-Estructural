"use client";

import { useState } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReply, deleteReply } from "@/app/actions/community";
import { Avatar, RoleBadge, timeAgo } from "./PostCard";

interface ReplyAuthor {
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: ReplyAuthor;
}

interface ReplySectionProps {
  postId: string;
  replies: Reply[];
  currentUserId: string;
}

export default function ReplySection({ postId, replies, currentUserId }: ReplySectionProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSending(true);
    setError(null);
    const result = await createReply(postId, content);
    if (result?.error) {
      setError(result.error);
    } else {
      setContent("");
    }
    setSending(false);
  };

  const handleDelete = async (replyId: string) => {
    await deleteReply(replyId);
  };

  return (
    <div className="border-t border-slate-700/30 bg-slate-900/30">
      {/* Replies list */}
      {replies.map((reply) => (
        <div key={reply.id} className="px-5 py-3 border-b border-slate-800/50 last:border-b-0">
          <div className="flex items-start gap-3 pl-6">
            <div className="w-8 h-8 shrink-0">
              <Avatar name={reply.profiles.full_name} url={reply.profiles.avatar_url} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-medium text-xs">
                  {reply.profiles.full_name || "Usuario"}
                </span>
                <RoleBadge role={reply.profiles.role} />
                <span className="text-slate-500 text-xs">{timeAgo(reply.created_at)}</span>
                {reply.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(reply.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{reply.content}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Reply form */}
      <div className="p-4 pl-11">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe una respuesta..."
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none text-sm min-h-[40px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={sending || !content.trim()}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 self-end"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
