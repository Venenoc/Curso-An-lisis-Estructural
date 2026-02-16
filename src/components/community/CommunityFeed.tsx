"use client";

import { useState, useRef } from "react";
import { Send, Loader2, MessageSquareText, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost, uploadPostImage } from "@/app/actions/community";
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
  title: string;
  content: string;
  image_url: string | null;
  pinned: boolean;
  created_at: string;
  profiles: PostAuthor;
}

interface CommunityFeedProps {
  posts: Post[];
  replies: Reply[];
  likesMap: Record<string, { count: number; likedByMe: boolean }>;
  currentUserId: string;
  currentUserRole: string;
}

export default function CommunityFeed({ posts, replies, likesMap, currentUserId, currentUserRole }: CommunityFeedProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato no soportado. Usa JPG, PNG, WebP o GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    setError(null);

    let imageUrl: string | undefined;

    // Upload image first if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadResult = await uploadPostImage(formData);
      if (uploadResult?.error) {
        setError(uploadResult.error);
        setSending(false);
        return;
      }
      imageUrl = uploadResult.url;
    }

    const result = await createPost(title, content, imageUrl);
    if (result?.error) {
      setError(result.error);
    } else {
      setTitle("");
      setContent("");
      removeImage();
    }
    setSending(false);
  };

  // Group replies by post_id
  const repliesByPost: Record<string, Reply[]> = {};
  replies.forEach((r) => {
    if (!repliesByPost[r.post_id]) repliesByPost[r.post_id] = [];
    repliesByPost[r.post_id].push(r);
  });

  // Sort posts: pinned first, then by date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0; // Already sorted by created_at from server
  });

  return (
    <div className="space-y-6">
      {/* Create post form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de tu publicación..."
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 mb-3 text-sm"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte algo con la comunidad..."
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 resize-none mb-3"
          rows={3}
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mb-3 inline-block">
            <img
              src={imagePreview}
              alt="Vista previa"
              className="max-h-48 rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex items-center justify-between">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 text-sm transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              Agregar imagen
            </button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={sending || !title.trim() || !content.trim()}
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
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            replies={repliesByPost[post.id] || []}
            likes={likesMap[post.id] || { count: 0, likedByMe: false }}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
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
