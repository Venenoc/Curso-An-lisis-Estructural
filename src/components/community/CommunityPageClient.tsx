"use client";

import { useState } from "react";
import { MessageSquareText, Mail, Users } from "lucide-react";
import CommunityFeed from "./CommunityFeed";
import DirectMessages from "./DirectMessages";

interface PostAuthor {
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: PostAuthor;
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: PostAuthor;
}

interface ChatUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface CommunityPageClientProps {
  currentUserId: string;
  posts: Post[];
  replies: Reply[];
  allUsers: ChatUser[];
  messages: Message[];
}

type Tab = "feed" | "messages";

export default function CommunityPageClient({
  currentUserId,
  posts,
  replies,
  allUsers,
  messages,
}: CommunityPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  const unreadCount = messages.filter(
    (m) => m.receiver_id === currentUserId && !m.read
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Comunidad</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Conecta con otros ingenieros y estudiantes de análisis estructural
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex gap-1 mb-8 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "feed"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === "messages"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Mail className="w-4 h-4" />
            Mensajes
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="pb-16 max-w-4xl">
          {activeTab === "feed" ? (
            <CommunityFeed
              posts={posts}
              replies={replies}
              currentUserId={currentUserId}
            />
          ) : (
            <DirectMessages
              currentUserId={currentUserId}
              allUsers={allUsers}
              messages={messages}
            />
          )}
        </div>
      </div>
    </div>
  );
}
