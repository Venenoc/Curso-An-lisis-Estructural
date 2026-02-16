"use client";

import { useState } from "react";
import { MessageSquare, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/app/actions/community";
import ReplySection from "./ReplySection";

interface PostAuthor {
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: PostAuthor;
}

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles: PostAuthor;
  };
  replies: Reply[];
  currentUserId: string;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    instructor: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Instructor" },
    admin: { bg: "bg-red-500/20", text: "text-red-400", label: "Admin" },
    student: { bg: "bg-cyan-500/20", text: "text-cyan-400", label: "Estudiante" },
  };
  const c = config[role] || config.student;
  return (
    <span className={`${c.bg} ${c.text} text-xs px-2 py-0.5 rounded-full font-medium`}>
      {c.label}
    </span>
  );
}

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  const initials = (name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (url) {
    return (
      <img src={url} alt={name || "Avatar"} className="w-10 h-10 rounded-full object-cover" />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
      {initials}
    </div>
  );
}

export default function PostCard({ post, replies, currentUserId }: PostCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = post.user_id === currentUserId;

  const handleDelete = async () => {
    setDeleting(true);
    await deletePost(post.id);
    setDeleting(false);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={post.profiles.full_name} url={post.profiles.avatar_url} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm">
                {post.profiles.full_name || "Usuario"}
              </span>
              <RoleBadge role={post.profiles.role} />
              <span className="text-slate-500 text-xs">{timeAgo(post.created_at)}</span>
            </div>
            <p className="text-slate-300 text-sm mt-2 whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/30 flex items-center gap-4">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 text-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {replies.length > 0 ? `${replies.length} respuesta${replies.length > 1 ? "s" : ""}` : "Responder"}
          {replies.length > 0 && (showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
        </button>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-sm transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        )}
      </div>

      {/* Replies */}
      {showReplies && (
        <ReplySection
          postId={post.id}
          replies={replies}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}

export { Avatar, RoleBadge, timeAgo };
