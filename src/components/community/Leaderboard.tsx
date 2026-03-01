"use client";

import { Trophy, MessageSquare, Heart, FileText } from "lucide-react";
import { Avatar, LevelBadge } from "./PostCard";
import type { LeaderboardEntry } from "@/lib/community-levels";

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export default function Leaderboard({ leaderboard, currentUserId }: LeaderboardProps) {
  if (leaderboard.length === 0) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-12 text-center">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">Sin actividad aun</h3>
        <p className="text-slate-400 text-sm">
          Se el primero en publicar y responder para aparecer en el ranking
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Podium - Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 0, 2].map((idx) => {
            const entry = leaderboard[idx];
            if (!entry) return null;
            const isMe = entry.userId === currentUserId;
            const position = idx + 1;
            const podiumConfig: Record<number, { ring: string; bg: string; medal: string; size: string }> = {
              1: { ring: "ring-amber-400", bg: "bg-amber-500/10 border-amber-500/30", medal: "text-amber-400", size: "w-16 h-16" },
              2: { ring: "ring-slate-300", bg: "bg-slate-700/50 border-slate-600/50", medal: "text-slate-300", size: "w-14 h-14" },
              3: { ring: "ring-orange-400", bg: "bg-orange-500/10 border-orange-500/30", medal: "text-orange-400", size: "w-14 h-14" },
            };
            const pc = podiumConfig[position];

            return (
              <div
                key={entry.userId}
                className={`flex flex-col items-center p-4 rounded-xl border ${pc.bg} ${
                  isMe ? "ring-2 ring-cyan-500/50" : ""
                } ${position === 1 ? "order-2 -mt-2" : position === 2 ? "order-1 mt-2" : "order-3 mt-2"}`}
              >
                <div className={`relative mb-2`}>
                  <div className={`${pc.size} rounded-full ring-2 ${pc.ring} overflow-hidden`}>
                    <Avatar name={entry.fullName} url={entry.avatarUrl} />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 ${pc.ring.replace("ring-", "border-")} flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${pc.medal}`}>{position}</span>
                  </div>
                </div>
                <span className="text-white text-xs font-semibold text-center truncate w-full">
                  {entry.fullName || "Usuario"}
                </span>
                <div className="mt-1">
                  <LevelBadge level={entry.stats.level} />
                </div>
                <span className="text-slate-400 text-xs mt-1">{entry.stats.score} pts</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking table */}
      <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/50">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Ranking de la Comunidad
          </h3>
        </div>

        <div className="divide-y divide-slate-700/30">
          {leaderboard.map((entry, idx) => {
            const isMe = entry.userId === currentUserId;
            return (
              <div
                key={entry.userId}
                className={`px-5 py-3 flex items-center gap-4 ${
                  isMe ? "bg-cyan-500/5 border-l-2 border-l-cyan-500" : ""
                } hover:bg-slate-800/70 transition-colors`}
              >
                {/* Position */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  idx === 0 ? "bg-amber-500/20 text-amber-400" :
                  idx === 1 ? "bg-slate-600/50 text-slate-300" :
                  idx === 2 ? "bg-orange-500/20 text-orange-400" :
                  "bg-slate-800 text-slate-500"
                }`}>
                  {idx + 1}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 shrink-0">
                  <Avatar name={entry.fullName} url={entry.avatarUrl} />
                </div>

                {/* Name + Level */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${isMe ? "text-cyan-300" : "text-white"}`}>
                      {entry.fullName || "Usuario"}
                      {isMe && <span className="text-cyan-500 text-xs ml-1">(tu)</span>}
                    </span>
                    <LevelBadge level={entry.stats.level} />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                  <span className="flex items-center gap-1" title="Publicaciones">
                    <FileText className="w-3 h-3" />
                    {entry.stats.posts}
                  </span>
                  <span className="flex items-center gap-1" title="Respuestas">
                    <MessageSquare className="w-3 h-3" />
                    {entry.stats.replies}
                  </span>
                  <span className="flex items-center gap-1" title="Likes recibidos">
                    <Heart className="w-3 h-3" />
                    {entry.stats.likesReceived}
                  </span>
                  <span className="text-slate-500 font-medium w-12 text-right">
                    {entry.stats.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scoring explanation */}
        <div className="px-5 py-3 border-t border-slate-700/50 bg-slate-900/30">
          <p className="text-slate-500 text-xs">
            Puntos: Publicacion = 3pts | Respuesta = 1pt | Like recibido = 2pts
          </p>
        </div>
      </div>
    </div>
  );
}
