"use client";

import { useState } from "react";
import { MessageSquareText, Mail, Users, Trophy } from "lucide-react";
import CommunityFeed from "./CommunityFeed";
import DirectMessages from "./DirectMessages";
import Leaderboard from "./Leaderboard";
import UserLevelCard from "./UserLevelCard";
import type { UserStats, LeaderboardEntry } from "@/lib/community-levels";

interface PostAuthor {
  full_name: string | null;
  avatar_url: string | null;
  role: string;
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
  currentUserRole: string;
  currentUserName: string | null;
  currentUserAvatar: string | null;
  posts: Post[];
  replies: Reply[];
  likesMap: Record<string, { count: number; likedByMe: boolean }>;
  allUsers: ChatUser[];
  messages: Message[];
  userStats: Record<string, UserStats>;
  leaderboard: LeaderboardEntry[];
  activeMembersCount: number;
}

type Tab = "feed" | "messages" | "ranking";

export default function CommunityPageClient({
  currentUserId,
  currentUserRole,
  currentUserName,
  currentUserAvatar,
  posts,
  replies,
  likesMap,
  allUsers,
  messages,
  userStats,
  leaderboard,
  activeMembersCount,
}: CommunityPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  const unreadCount = messages.filter(
    (m) => m.receiver_id === currentUserId && !m.read
  ).length;

  const currentUserStats = userStats[currentUserId] || {
    posts: 0,
    replies: 0,
    likesReceived: 0,
    level: "estudiante" as const,
    score: 0,
  };

  const currentUserRank = leaderboard.findIndex((e) => e.userId === currentUserId);
  const rank = currentUserRank !== -1 ? currentUserRank + 1 : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-cyan-400" />
                <h1 className="text-3xl lg:text-4xl font-bold text-white">Comunidad</h1>
              </div>
              <p className="text-slate-400 text-sm">
                Conecta con otros ingenieros y estudiantes de analisis estructural
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-slate-800/90 border border-slate-700/50 rounded-lg px-4 py-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm font-medium">{activeMembersCount}</span>
              <span className="text-slate-400 text-sm">miembros activos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex gap-1 mb-8 bg-slate-800/90 border border-slate-700/50 rounded-lg p-1 w-fit">
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
            onClick={() => setActiveTab("ranking")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "ranking"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Ranking
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
        <div className="pb-16">
          {activeTab === "feed" ? (
            <div className="flex gap-6">
              {/* Feed - main area */}
              <div className="flex-1 max-w-3xl">
                <CommunityFeed
                  posts={posts}
                  replies={replies}
                  likesMap={likesMap}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  userStats={userStats}
                />
              </div>
              {/* Sidebar - level card */}
              <div className="hidden lg:block w-72 shrink-0 space-y-4">
                <UserLevelCard
                  userId={currentUserId}
                  userName={currentUserName}
                  userAvatar={currentUserAvatar}
                  stats={currentUserStats}
                  rank={rank}
                />
                {/* Mini leaderboard */}
                {leaderboard.length > 0 && (
                  <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-4">
                    <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Top Contribuidores
                    </h4>
                    <div className="space-y-2">
                      {leaderboard.slice(0, 5).map((entry, idx) => (
                        <div
                          key={entry.userId}
                          className={`flex items-center gap-2 py-1.5 ${
                            entry.userId === currentUserId ? "text-cyan-300" : "text-white"
                          }`}
                        >
                          <span className={`text-xs font-bold w-5 ${
                            idx === 0 ? "text-amber-400" :
                            idx === 1 ? "text-slate-300" :
                            idx === 2 ? "text-orange-400" :
                            "text-slate-500"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm truncate flex-1">
                            {entry.fullName || "Usuario"}
                          </span>
                          <span className="text-slate-500 text-xs">{entry.stats.score}pts</span>
                        </div>
                      ))}
                    </div>
                    {leaderboard.length > 5 && (
                      <button
                        onClick={() => setActiveTab("ranking")}
                        className="text-cyan-400 hover:text-cyan-300 text-xs mt-2 transition-colors"
                      >
                        Ver ranking completo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "ranking" ? (
            <div className="flex gap-6">
              <div className="flex-1 max-w-3xl">
                <Leaderboard
                  leaderboard={leaderboard}
                  currentUserId={currentUserId}
                />
              </div>
              <div className="hidden lg:block w-72 shrink-0">
                <UserLevelCard
                  userId={currentUserId}
                  userName={currentUserName}
                  userAvatar={currentUserAvatar}
                  stats={currentUserStats}
                  rank={rank}
                />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl">
              <DirectMessages
                currentUserId={currentUserId}
                allUsers={allUsers}
                messages={messages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
