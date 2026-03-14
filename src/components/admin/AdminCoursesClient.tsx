"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  Clock,
  DollarSign,
  Layers,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  Award,
  Filter,
  ChevronDown,
} from "lucide-react";
import { deleteCourse, publishCourse } from "@/app/actions/courses";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CourseItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  slug: string | null;
  level: string | null;
  total_duration: string | null;
  total_lessons: number | null;
  subscription_only: boolean;
  image_url: string | null;
  gradient: string | null;
  created_at: string;
  lessons: { count: number }[] | null;
}

interface Props {
  courses: CourseItem[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getLessonCount(course: CourseItem): number {
  return course.lessons?.[0]?.count ?? course.total_lessons ?? 0;
}

function getGradient(course: CourseItem): string {
  return course.gradient || "from-cyan-500 to-blue-600";
}

const LEVEL_COLORS: Record<string, string> = {
  Principiante: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermedio: "bg-amber-100 text-amber-700 border-amber-200",
  Avanzado: "bg-red-100 text-red-700 border-red-200",
  "Todos los niveles": "bg-violet-100 text-violet-700 border-violet-200",
};

// ─── StatCard component ────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/40 dark:border-slate-700/60 shadow-lg p-5 flex items-center gap-4 hover:shadow-xl transition-shadow duration-300">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── CourseCard component ──────────────────────────────────────────────────────

function CourseCard({
  course,
  view,
  onDelete,
  onTogglePublish,
  isPending,
}: {
  course: CourseItem;
  view: "grid" | "list";
  onDelete: (id: string, title: string) => void;
  onTogglePublish: (id: string, currentStatus: string) => void;
  isPending: boolean;
}) {
  const lessonCount = getLessonCount(course);
  const gradient = getGradient(course);
  const isPublished = course.status === "published";
  const levelClass =
    LEVEL_COLORS[course.level ?? "Principiante"] || LEVEL_COLORS["Principiante"];

  if (view === "list") {
    return (
      <div className="group relative flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/40 dark:border-slate-700/60 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-4 overflow-hidden">
        {/* gradient stripe */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradient} rounded-l-2xl`}
        />
        <div className="pl-2 flex items-center gap-4 flex-1 min-w-0">
          {/* Thumbnail */}
          <div
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 overflow-hidden shadow-md`}
          >
            {course.image_url ? (
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-7 h-7 text-white/70" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                {course.title}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  isPublished
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }`}
              >
                {isPublished ? "Publicado" : "Borrador"}
              </span>
              {course.level && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border ${levelClass}`}
                >
                  {course.level}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {course.description || "Sin descripción"}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {lessonCount} lecciones
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> S/. {course.price.toFixed(2)}
              </span>
              {course.total_duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {course.total_duration}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePublish(course.id, course.status)}
            disabled={isPending}
            title={isPublished ? "Despublicar" : "Publicar"}
            className={`p-2 rounded-xl border text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 ${
              isPublished
                ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <Link href={`/admin/courses/${course.id}`}>
            <button className="p-2 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-all hover:scale-105">
              <Edit3 className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => onDelete(course.id, course.title)}
            disabled={isPending}
            className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Grid card ─────────────

  return (
    <div className="group relative flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/40 dark:border-slate-700/60 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Card banner */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="w-12 h-12 text-white/40" />
        )}
        {/* Overlay with status badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm border ${
              isPublished
                ? "bg-emerald-500/80 text-white border-emerald-400/50"
                : "bg-amber-500/80 text-white border-amber-400/50"
            }`}
          >
            {isPublished ? "● Publicado" : "○ Borrador"}
          </span>
          {course.level && (
            <span className="text-xs px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20">
              {course.level}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex-1 p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base text-slate-800 dark:text-white line-clamp-1 leading-snug">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {course.description || "Sin descripción"}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              S/{course.price.toFixed(0)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">precio</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
            <p className="text-sm font-bold text-slate-800 dark:text-white">{lessonCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">lecciones</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {course.subscription_only ? "Sub" : "Único"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">tipo</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onTogglePublish(course.id, course.status)}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
              isPublished
                ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {isPublished ? (
              <>
                <EyeOff className="w-3 h-3" /> Despublicar
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" /> Publicar
              </>
            )}
          </button>
          <Link href={`/admin/courses/${course.id}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Edit3 className="w-3 h-3" /> Editar
            </button>
          </Link>
          <button
            onClick={() => onDelete(course.id, course.title)}
            disabled={isPending}
            className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminCoursesClient({ courses: initialCourses }: Props) {
  const [isPending, startTransition] = useTransition();

  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  function showToast(text: string, error = false) {
    setToast({ text, error });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Filtered courses ─────────────────────────────────────

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.description?.toLowerCase() ?? "").includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && c.status === "published") ||
        (filterStatus === "draft" && c.status !== "published");
      return matchSearch && matchStatus;
    });
  }, [courses, search, filterStatus]);

  // ── Stats ────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === "published").length;
    const totalLessons = courses.reduce((sum, c) => sum + getLessonCount(c), 0);
    const avgPrice =
      courses.length > 0
        ? courses.reduce((sum, c) => sum + c.price, 0) / courses.length
        : 0;
    return { total, published, totalLessons, avgPrice };
  }, [courses]);

  // ── Actions ──────────────────────────────────────────────

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`¿Eliminar el curso "${title}"? Esta acción no se puede deshacer.`))
      return;
    startTransition(async () => {
      const res = await deleteCourse(id);
      if (res?.error) {
        showToast(res.error, true);
      } else {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showToast("Curso eliminado");
      }
    });
  }

  async function handleTogglePublish(id: string, currentStatus: string) {
    const toPublish = currentStatus !== "published";
    if (!window.confirm(toPublish ? "¿Publicar este curso?" : "¿Despublicar este curso?")) return;
    startTransition(async () => {
      const res = await publishCourse(id, toPublish);
      if (res?.error) {
        showToast(res.error, true);
      } else {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: toPublish ? "published" : "draft" } : c
          )
        );
        showToast(toPublish ? "Curso publicado ✓" : "Curso despublicado");
      }
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/images/Fondos%20de%20marketing/Fondo_ATm.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Frosted-glass overlay */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
            toast.error
              ? "bg-red-900/90 border-red-500/50 text-red-200"
              : "bg-slate-800/90 border-cyan-500/40 text-cyan-300"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ─── Header ──────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            Mis Cursos
          </h1>
          <p className="text-slate-200 text-lg font-light">
            Panel de gestión de contenido educativo
          </p>
        </div>

        {/* ─── Nav actions ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </Link>
          <Link href="/admin/courses/new">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4" />
              Crear Curso
            </button>
          </Link>
          <Link href="/admin/testimonials">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
              <MessageSquare className="w-4 h-4" />
              Testimonios
            </button>
          </Link>
        </div>

        {/* ─── Stats canvas ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Layers}
            label="Total de cursos"
            value={stats.total}
            color="bg-gradient-to-br from-cyan-500 to-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Publicados"
            value={stats.published}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={BookOpen}
            label="Total lecciones"
            value={stats.totalLessons}
            color="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <StatCard
            icon={Award}
            label="Precio promedio"
            value={`S/${stats.avgPrice.toFixed(0)}`}
            color="bg-gradient-to-br from-amber-500 to-orange-500"
          />
        </div>

        {/* ─── Controls toolbar ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cursos..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 backdrop-blur-sm"
            />
          </div>

          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
            >
              <Filter className="w-4 h-4" />
              {filterStatus === "all"
                ? "Todos"
                : filterStatus === "published"
                ? "Publicados"
                : "Borradores"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]">
                {(["all", "published", "draft"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFilterStatus(opt);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-700 ${
                      filterStatus === opt ? "text-cyan-400 font-semibold" : "text-slate-300"
                    }`}
                  >
                    {opt === "all" ? "Todos" : opt === "published" ? "Publicados" : "Borradores"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/20">
            <button
              onClick={() => setView("grid")}
              className={`p-2 transition-all ${
                view === "grid"
                  ? "bg-cyan-500 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 transition-all ${
                view === "list"
                  ? "bg-cyan-500 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          {/* Count badge */}
          <span className="text-slate-300 text-sm">
            {filtered.length} de {courses.length}
          </span>
        </div>

        {/* ─── Course canvas ───────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-white">
              {search || filterStatus !== "all"
                ? "No se encontraron cursos"
                : "Aún no tienes cursos"}
            </p>
            <p className="text-slate-400 mt-1">
              {search || filterStatus !== "all"
                ? "Intenta con otros términos de búsqueda o filtros"
                : "Crea tu primer curso para comenzar a compartir tu conocimiento"}
            </p>
            {!search && filterStatus === "all" && (
              <Link href="/admin/courses/new">
                <button className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-105">
                  <Plus className="w-4 h-4" />
                  Crear Primer Curso
                </button>
              </Link>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                view="grid"
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
                isPending={isPending}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                view="list"
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
