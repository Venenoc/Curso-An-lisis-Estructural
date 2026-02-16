"use client";

import { useState } from "react";
import { Send, Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/app/actions/community";
import PostCard from "./PostCard";

interface PostAuthor {
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: PostAuthor;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: PostAuthor;
}

interface CommunityFeedProps {
  posts: Post[];
  replies: Reply[];
  currentUserId: string;
}

export default function CommunityFeed({ posts, replies, currentUserId }: CommunityFeedProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSending(true);
    setError(null);
    const result = await createPost(content);
    if (result?.error) {
      setError(result.error);
    } else {
      setContent("");
    }
    setSending(false);
  };

  // Group replies by post_id
  const repliesByPost: Record<string, Reply[]> = {};
  replies.forEach((r) => {
    if (!repliesByPost[r.post_id]) repliesByPost[r.post_id] = [];
    repliesByPost[r.post_id].push(r);
  });

  return (
    <div className="space-y-6">
      {/* Create post form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte algo con la comunidad..."
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 resize-none mb-3"
          rows={3}
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={sending || !content.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Publicar
          </Button>
        </div>
      </div>

      {/* Posts list */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            replies={repliesByPost[post.id] || []}
            currentUserId={currentUserId}
          />
        ))
      ) : (
        <div className="text-center py-16">
          <MessageSquareText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">
            No hay publicaciones aún
          </h3>
          <p className="text-slate-400 text-sm">
            Sé el primero en compartir algo con la comunidad
          </p>
        </div>
      )}
    </div>
  );
}
