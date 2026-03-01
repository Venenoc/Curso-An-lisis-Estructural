"use client";

import { useState, useRef } from "react";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Loader2,
  GraduationCap,
  BookOpen,
  HardHat,
  Award,
  FileText,
  MessageSquare,
  Heart,
  PenTool,
  HelpCircle,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Lock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile, uploadAvatar } from "@/app/actions/profile";
import { levelConfig, getProgressToNextLevel, getNextLevel } from "@/lib/community-levels";
import type { UserStats, CommunityLevel } from "@/lib/community-levels";

interface Achievement {
  id: string;
  label: string;
  description: string;
  earned: boolean;
  icon: string;
}

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  specialty: string;
  location: string;
  created_at: string;
}

interface ProfilePageClientProps {
  email: string;
  profile: ProfileData;
  communityStats: UserStats;
  achievements: Achievement[];
  enrolledCoursesCount: number;
  completedLessonsCount: number;
  completedCoursesCount: number;
}

const achievementIcons: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-5 h-5" />,
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  PenTool: <PenTool className="w-5 h-5" />,
  HelpCircle: <HelpCircle className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
};

const levelIcons: Record<CommunityLevel, React.ReactNode> = {
  estudiante: <GraduationCap className="w-6 h-6" />,
  bachiller: <BookOpen className="w-6 h-6" />,
  ingeniero: <HardHat className="w-6 h-6" />,
  magister: <Award className="w-6 h-6" />,
};

const roleLabels: Record<string, string> = {
  student: "Estudiante",
  instructor: "Instructor",
  admin: "Administrador",
};

export default function ProfilePageClient({
  email,
  profile,
  communityStats,
  achievements,
  enrolledCoursesCount,
  completedLessonsCount,
  completedCoursesCount,
}: ProfilePageClientProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    bio: profile.bio || "",
    specialty: profile.specialty || "",
    location: profile.location || "",
  });

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  const lc = levelConfig[communityStats.level];
  const progress = getProgressToNextLevel(communityStats);
  const nextLevel = getNextLevel(communityStats.level);

  const memberSince = new Date(profile.created_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });

  const earnedCount = achievements.filter((a) => a.earned).length;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const result = await updateProfile(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadAvatar(fd);
    if (result?.error) {
      setError(result.error);
    } else if (result?.url) {
      setAvatarUrl(result.url);
    }
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initials = (formData.full_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative h-48 md:h-56 bg-gradient-to-r from-cyan-900/60 via-blue-900/60 to-purple-900/60 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
        {/* Profile Header Card */}
        <div className="bg-slate-800/95 border border-slate-700/70 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative shrink-0 self-start">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-xl bg-slate-700">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 text-left">Máximo: 1 MB</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shadow-lg transition-colors"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Nombre completo"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-lg font-bold"
                    />
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      placeholder="Profesion o area (Ej: Ingeniero Civil, Estudiante de estructuras)"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                    />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ciudad, Pais"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                    />
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Escribe una breve biografia (2-3 lineas)"
                      className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 resize-none text-sm"
                      rows={3}
                      maxLength={300}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar
                      </Button>
                      <Button
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            full_name: profile.full_name || "",
                            bio: profile.bio || "",
                            specialty: profile.specialty || "",
                            location: profile.location || "",
                          });
                        }}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                          {formData.full_name || "Sin nombre"}
                        </h1>
                        {formData.specialty && (
                          <p className="text-cyan-400 text-sm mt-1 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {formData.specialty}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {email}
                          </span>
                          {formData.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {formData.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Miembro desde {memberSince}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setEditing(true)}
                        className="bg-slate-700 hover:bg-slate-600 text-white shrink-0"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar perfil
                      </Button>
                    </div>
                    {formData.bio && (
                      <p className="text-slate-300 text-sm mt-4 leading-relaxed max-w-2xl">
                        {formData.bio}
                      </p>
                    )}
                    {!formData.bio && !formData.specialty && (
                      <p className="text-slate-500 text-sm mt-4 italic">
                        Completa tu perfil agregando tu profesion y una biografia
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
            {success && <p className="text-green-400 text-sm mt-4">Perfil actualizado correctamente</p>}

            {/* Role + Level badges */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <span className="bg-slate-700/90 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {roleLabels[profile.role] || profile.role}
              </span>
              <span className={`${lc.bg} ${lc.text} text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5`}>
                {levelIcons[communityStats.level]}
                Nivel: {lc.label}
              </span>
              <span className="bg-slate-700/90 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                {earnedCount} / {achievements.length} logros
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Left column - Stats + Level */}
          <div className="space-y-6">
            {/* Level Card */}
            <div className={`bg-slate-800/90 border rounded-xl overflow-hidden ${lc.border}`}>
              <div className={`px-5 py-4 ${lc.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl ${lc.bg} flex items-center justify-center ${lc.text}`}>
                    {levelIcons[communityStats.level]}
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider">Nivel de Comunidad</div>
                    <div className={`text-xl font-bold ${lc.text}`}>{lc.label}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                {/* Progress bar */}
                {progress && nextLevel ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-400 text-xs">Progreso a {levelConfig[nextLevel].label}</span>
                      <span className={`text-xs font-medium ${levelConfig[nextLevel].text}`}>{progress.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-700/90 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          nextLevel === "bachiller" ? "bg-blue-500" :
                          nextLevel === "ingeniero" ? "bg-purple-500" :
                          "bg-amber-500"
                        }`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <p className="text-slate-500 text-xs mt-1.5">{progress.hint}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2 px-3 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-4">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-xs font-medium">Nivel maximo alcanzado</span>
                  </div>
                )}

                {/* Community stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center py-2 bg-slate-900/90 rounded-lg">
                    <div className="text-white font-bold text-lg">{communityStats.posts}</div>
                    <div className="text-slate-500 text-xs">Posts</div>
                  </div>
                  <div className="text-center py-2 bg-slate-900/90 rounded-lg">
                    <div className="text-white font-bold text-lg">{communityStats.replies}</div>
                    <div className="text-slate-500 text-xs">Respuestas</div>
                  </div>
                  <div className="text-center py-2 bg-slate-900/90 rounded-lg">
                    <div className="text-white font-bold text-lg">{communityStats.likesReceived}</div>
                    <div className="text-slate-500 text-xs">Likes</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 py-2 px-3 bg-slate-900/90 rounded-lg">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Puntos totales
                  </span>
                  <span className="text-white font-bold">{communityStats.score}</span>
                </div>
              </div>
            </div>

            {/* Academic stats */}
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                Progreso Academico
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Cursos inscritos</span>
                  <span className="text-white font-bold">{enrolledCoursesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Lecciones completadas</span>
                  <span className="text-white font-bold">{completedLessonsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Cursos completados</span>
                  <span className="text-white font-bold">{completedCoursesCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Achievements */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Insignias y Logros
                  <span className="text-slate-500 text-sm font-normal ml-auto">
                    {earnedCount} / {achievements.length}
                  </span>
                </h3>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      ach.earned
                        ? "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
                        : "bg-slate-900/30 border-slate-800/50 opacity-50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      ach.earned
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-800 text-slate-600"
                    }`}>
                      {ach.earned ? (
                        achievementIcons[ach.icon] || <Star className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${ach.earned ? "text-white" : "text-slate-500"}`}>
                          {ach.label}
                        </span>
                        {ach.earned && (
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${ach.earned ? "text-slate-400" : "text-slate-600"}`}>
                        {ach.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
