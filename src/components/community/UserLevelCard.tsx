"use client";

import { GraduationCap, BookOpen, HardHat, Award, FileText, MessageSquare, Heart, TrendingUp } from "lucide-react";
import { levelConfig, getProgressToNextLevel, getNextLevel } from "@/lib/community-levels";
import type { UserStats, CommunityLevel } from "@/lib/community-levels";
import { Avatar } from "./PostCard";

interface UserLevelCardProps {
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  stats: UserStats;
  rank: number | null;
}

const levelIconsLarge: Record<CommunityLevel, React.ReactNode> = {
  estudiante: <GraduationCap className="w-8 h-8" />,
  bachiller: <BookOpen className="w-8 h-8" />,
  ingeniero: <HardHat className="w-8 h-8" />,
  magister: <Award className="w-8 h-8" />,
};

export default function UserLevelCard({ userId, userName, userAvatar, stats, rank }: UserLevelCardProps) {
  const config = levelConfig[stats.level];
  const progress = getProgressToNextLevel(stats);
  const nextLevel = getNextLevel(stats.level);

  return (
    <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header with level gradient */}
      <div className={`px-5 py-4 ${config.bg} border-b ${config.border}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0">
            <Avatar name={userName} url={userAvatar} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm truncate">{userName || "Usuario"}</h3>
            <div className={`flex items-center gap-1.5 mt-0.5 ${config.text}`}>
              {levelIconsLarge[stats.level]}
              <span className="font-semibold text-sm">{config.label}</span>
            </div>
          </div>
          {rank && (
            <div className="text-center shrink-0">
              <div className="text-slate-500 text-xs">Ranking</div>
              <div className="text-white font-bold text-lg">#{rank}</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="text-white font-bold text-lg">{stats.posts}</div>
            <div className="text-slate-500 text-xs">Posts</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="text-white font-bold text-lg">{stats.replies}</div>
            <div className="text-slate-500 text-xs">Respuestas</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <div className="text-white font-bold text-lg">{stats.likesReceived}</div>
            <div className="text-slate-500 text-xs">Likes</div>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between py-2 px-3 bg-slate-900/50 rounded-lg mb-4">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Puntos totales
          </span>
          <span className="text-white font-bold">{stats.score}</span>
        </div>

        {/* Progress to next level */}
        {progress && nextLevel ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-xs">Progreso a {levelConfig[nextLevel].label}</span>
              <span className={`text-xs font-medium ${levelConfig[nextLevel].text}`}>{progress.percent}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  nextLevel === "bachiller" ? "bg-blue-500" :
                  nextLevel === "ingeniero" ? "bg-purple-500" :
                  "bg-amber-500"
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs">{progress.hint}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 px-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Nivel maximo alcanzado</span>
          </div>
        )}
      </div>
    </div>
  );
}
