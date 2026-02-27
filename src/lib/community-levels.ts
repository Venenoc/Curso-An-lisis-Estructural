export type CommunityLevel = "estudiante" | "bachiller" | "ingeniero" | "magister";

export interface UserStats {
  posts: number;
  replies: number;
  likesReceived: number;
  level: CommunityLevel;
  score: number;
}

export interface LeaderboardEntry {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  stats: UserStats;
}

const LEVEL_THRESHOLDS = {
  magister:  { posts: 25, replies: 75, likes: 50 },
  ingeniero: { posts: 10, replies: 30, likes: 20 },
  bachiller: { posts: 3,  replies: 10, likes: 5 },
} as const;

export function calcularNivel(posts: number, replies: number, likes: number): CommunityLevel {
  if (posts >= LEVEL_THRESHOLDS.magister.posts || replies >= LEVEL_THRESHOLDS.magister.replies || likes >= LEVEL_THRESHOLDS.magister.likes) return "magister";
  if (posts >= LEVEL_THRESHOLDS.ingeniero.posts || replies >= LEVEL_THRESHOLDS.ingeniero.replies || likes >= LEVEL_THRESHOLDS.ingeniero.likes) return "ingeniero";
  if (posts >= LEVEL_THRESHOLDS.bachiller.posts || replies >= LEVEL_THRESHOLDS.bachiller.replies || likes >= LEVEL_THRESHOLDS.bachiller.likes) return "bachiller";
  return "estudiante";
}

export function calcularScore(posts: number, replies: number, likes: number): number {
  return posts * 3 + replies * 1 + likes * 2;
}

export function getNextLevel(level: CommunityLevel): CommunityLevel | null {
  const order: CommunityLevel[] = ["estudiante", "bachiller", "ingeniero", "magister"];
  const idx = order.indexOf(level);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function getProgressToNextLevel(stats: UserStats): { percent: number; hint: string } | null {
  const next = getNextLevel(stats.level);
  if (!next) return null;

  const thresholds = LEVEL_THRESHOLDS[next as keyof typeof LEVEL_THRESHOLDS];
  if (!thresholds) return null;

  const postProgress = Math.min(stats.posts / thresholds.posts, 1);
  const replyProgress = Math.min(stats.replies / thresholds.replies, 1);
  const likeProgress = Math.min(stats.likesReceived / thresholds.likes, 1);

  const percent = Math.round(Math.max(postProgress, replyProgress, likeProgress) * 100);

  const hints: string[] = [];
  if (stats.posts < thresholds.posts) hints.push(`${thresholds.posts - stats.posts} publicaciones`);
  if (stats.replies < thresholds.replies) hints.push(`${thresholds.replies - stats.replies} respuestas`);
  if (stats.likesReceived < thresholds.likes) hints.push(`${thresholds.likes - stats.likesReceived} likes`);

  const hint = hints.length > 0 ? `Faltan ${hints[0]} para ${levelConfig[next].label}` : "";

  return { percent, hint };
}

export const levelConfig: Record<CommunityLevel, { label: string; bg: string; text: string; border: string; icon: string }> = {
  estudiante: { label: "Estudiante", bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30", icon: "GraduationCap" },
  bachiller:  { label: "Bachiller",  bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", icon: "BookOpen" },
  ingeniero:  { label: "Ingeniero",  bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", icon: "HardHat" },
  magister:   { label: "Magister",   bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", icon: "Award" },
};
