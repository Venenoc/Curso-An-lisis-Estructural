"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  updateCourse,
  publishCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  createModule,
  updateModule,
  deleteModule,
  createChapter,
  updateChapter,
  deleteChapter,
  updateLessonMaterials,
} from "@/app/actions/courses";
import {
  createQuiz,
  addQuestion,
  deleteQuestion,
  deleteQuiz,
  getQuizForLesson,
} from "@/app/actions/quizzes";
import type { QuizWithQuestions } from "@/app/actions/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  Signal,
  X,
  Save,
  ImageIcon,
  ClipboardList,
  Paperclip,
  ExternalLink,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface LessonData {
  id: string;
  title: string;
  video_url: string | null;
  order: number;
  duration: number | null;
  chapter_uuid: string | null;
  materials?: { title: string; url: string }[];
}

interface ChapterData {
  id: string;
  module_id: string;
  title: string;
  order: number;
  lessons: LessonData[];
}

interface ModuleData {
  id: string;
  course_id: string;
  title: string;
  order: number;
  price?: number;
  presentation_video_url?: string | null;
  chapters: ChapterData[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  slug?: string;
  level: string;
  total_duration: string;
  subscription_only: boolean;
  image_url?: string;
  gradient?: string;
  presentation_video_url?: string;
}

type ModalState =
  | { type: "createModule" }
  | { type: "editModule"; module: ModuleData }
  | { type: "createChapter"; module: ModuleData }
  | { type: "editChapter"; chapter: ChapterData }
  | { type: "createLesson"; chapter: ChapterData }
  | { type: "editLesson"; lesson: LessonData }
  | null;

interface Props {
  course: Course;
  modules: ModuleData[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminCourseClient({ course: initialCourse, modules: initialModules }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [modal, setModal] = useState<ModalState>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(initialModules.map((m) => m.id))
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Quiz panel
  const [quizPanel, setQuizPanel] = useState<{ lesson: LessonData; catalogLessonId: number } | null>(null);
  const [quizData, setQuizData] = useState<QuizWithQuestions | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionType, setQuestionType] = useState<"multiple_choice" | "true_false">("multiple_choice");

  // Materials panel
  const [materialsPanel, setMaterialsPanel] = useState<LessonData | null>(null);
  const [localMaterials, setLocalMaterials] = useState<{ title: string; url: string }[]>([]);
  const [materialSaving, setMaterialSaving] = useState(false);

  // Auto-calculated from module hierarchy
  const totalLessons = useMemo(
    () => modules.reduce((sum, m) => sum + m.chapters.reduce((s, c) => s + c.lessons.length, 0), 0),
    [modules]
  );
  const totalMinutes = useMemo(
    () =>
      modules.reduce(
        (sum, m) =>
          sum + m.chapters.reduce((s, c) => s + c.lessons.reduce((sl, l) => sl + (l.duration || 0), 0), 0),
        0
      ),
    [modules]
  );

  function showMsg(text: string, error = false) {
    setStatusMsg({ text, error });
    setTimeout(() => setStatusMsg(null), 3500);
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleChapter(id: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Course ──────────────────────────────────────────────────────────────────

  async function handleUpdateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCourse(course.id, fd);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        setCourse((prev) => ({
          ...prev,
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          price: parseFloat(fd.get("price") as string),
          level: fd.get("level") as string,
          subscription_only: fd.get("subscription_only") === "true",
          image_url: (fd.get("image_url") as string) || undefined,
          presentation_video_url: (fd.get("presentation_video_url") as string) || undefined,
        }));
        showMsg("Curso actualizado ✓");
      }
    });
  }

  async function handleTogglePublish() {
    if (!window.confirm(course.status === "draft" ? "¿Publicar el curso?" : "¿Despublicar el curso?")) return;
    startTransition(async () => {
      const res = await publishCourse(course.id, course.status === "draft");
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        setCourse((prev) => ({ ...prev, status: prev.status === "draft" ? "published" : "draft" }));
        showMsg(course.status === "draft" ? "Curso publicado ✓" : "Curso despublicado");
      }
    });
  }

  async function handleDeleteCourse() {
    if (!window.confirm("¿Eliminar el curso? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      const res = await deleteCourse(course.id);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        router.push("/admin/courses");
      }
    });
  }

  // ── Modules ──────────────────────────────────────────────────────────────────

  async function handleCreateModule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const videoUrl = (fd.get("presentation_video_url") as string) || undefined;
    const price = fd.get("price") ? parseFloat(fd.get("price") as string) : 0;
    startTransition(async () => {
      const res = await createModule(course.id, title, videoUrl, price);
      if (res?.error) {
        showMsg(res.error, true);
      } else if (res?.module) {
        setModules((prev) => [...prev, { ...res.module!, chapters: [] }]);
        setExpandedModules((prev) => new Set([...prev, res.module!.id]));
        setModal(null);
        showMsg("Módulo creado ✓");
      }
    });
  }

  async function handleUpdateModule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "editModule") return;
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const videoUrl = (fd.get("presentation_video_url") as string) || undefined;
    const price = fd.get("price") ? parseFloat(fd.get("price") as string) : 0;
    const id = modal.module.id;
    startTransition(async () => {
      const res = await updateModule(id, title, videoUrl, price);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        setModules((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, title, presentation_video_url: videoUrl || null, price } : m
          )
        );
        setModal(null);
        showMsg("Módulo actualizado ✓");
      }
    });
  }

  async function handleDeleteModule(moduleId: string) {
    if (!window.confirm("¿Eliminar este módulo y todo su contenido?")) return;
    startTransition(async () => {
      const res = await deleteModule(moduleId);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
        showMsg("Módulo eliminado");
      }
    });
  }

  // ── Chapters ─────────────────────────────────────────────────────────────────

  async function handleCreateChapter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "createChapter") return;
    const fd = new FormData(e.currentTarget);
    const moduleId = modal.module.id;
    startTransition(async () => {
      const res = await createChapter(moduleId, fd.get("title") as string);
      if (res?.error) {
        showMsg(res.error, true);
      } else if (res?.chapter) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId ? { ...m, chapters: [...m.chapters, { ...res.chapter!, lessons: [] }] } : m
          )
        );
        setExpandedChapters((prev) => new Set([...prev, res.chapter!.id]));
        setModal(null);
        showMsg("Capítulo creado ✓");
      }
    });
  }

  async function handleUpdateChapter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "editChapter") return;
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const { id: chapterId, module_id: moduleId } = modal.chapter;
    startTransition(async () => {
      const res = await updateChapter(chapterId, title);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? { ...m, chapters: m.chapters.map((c) => (c.id === chapterId ? { ...c, title } : c)) }
              : m
          )
        );
        setModal(null);
        showMsg("Capítulo actualizado ✓");
      }
    });
  }

  async function handleDeleteChapter(moduleId: string, chapterId: string) {
    if (!window.confirm("¿Eliminar este capítulo y todas sus lecciones?")) return;
    startTransition(async () => {
      const res = await deleteChapter(chapterId);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId ? { ...m, chapters: m.chapters.filter((c) => c.id !== chapterId) } : m
          )
        );
        showMsg("Capítulo eliminado");
      }
    });
  }

  // ── Lessons ──────────────────────────────────────────────────────────────────

  async function handleCreateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "createLesson") return;
    const fd = new FormData(e.currentTarget);
    const { id: chapterId, module_id: moduleId } = modal.chapter;
    startTransition(async () => {
      const res = await createLesson(chapterId, fd);
      if (res?.error) {
        showMsg(res.error, true);
      } else if (res?.lesson) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  chapters: m.chapters.map((c) =>
                    c.id === chapterId ? { ...c, lessons: [...c.lessons, res.lesson!] } : c
                  ),
                }
              : m
          )
        );
        setModal(null);
        showMsg("Lección creada ✓");
      }
    });
  }

  async function handleUpdateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "editLesson") return;
    const fd = new FormData(e.currentTarget);
    const lessonId = modal.lesson.id;
    startTransition(async () => {
      const res = await updateLesson(lessonId, fd);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        const updated: LessonData = {
          ...modal.lesson,
          title: fd.get("title") as string,
          video_url: (fd.get("videoUrl") as string) || null,
          duration: (fd.get("duration") as string) ? parseInt(fd.get("duration") as string, 10) : null,
        };
        setModules((prev) =>
          prev.map((m) => ({
            ...m,
            chapters: m.chapters.map((c) => ({
              ...c,
              lessons: c.lessons.map((l) => (l.id === lessonId ? updated : l)),
            })),
          }))
        );
        setModal(null);
        showMsg("Lección actualizada ✓");
      }
    });
  }

  async function handleDeleteLesson(moduleId: string, chapterId: string, lessonId: string) {
    if (!window.confirm("¿Eliminar esta lección?")) return;
    startTransition(async () => {
      const res = await deleteLesson(lessonId);
      if (res?.error) {
        showMsg(res.error, true);
      } else {
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  chapters: m.chapters.map((c) =>
                    c.id === chapterId ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) } : c
                  ),
                }
              : m
          )
        );
        showMsg("Lección eliminada");
      }
    });
  }

  // ── Quiz management ─────────────────────────────────────────────────────────

  async function openQuizPanel(lesson: LessonData, catalogLessonId: number) {
    setQuizPanel({ lesson, catalogLessonId });
    setQuizData(null);
    setQuizLoading(true);
    setShowAddQuestion(false);
    setQuestionType("multiple_choice");
    const quiz = await getQuizForLesson(course.slug || "", catalogLessonId);
    setQuizData(quiz);
    setQuizLoading(false);
  }

  async function handleCreateQuiz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quizPanel) return;
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const passingScore = parseInt(fd.get("passing_score") as string, 10) || 70;
    setQuizLoading(true);
    const res = await createQuiz(course.slug || "", quizPanel.catalogLessonId, title, passingScore);
    if (res.error) {
      showMsg(res.error, true);
      setQuizLoading(false);
      return;
    }
    const quiz = await getQuizForLesson(course.slug || "", quizPanel.catalogLessonId);
    setQuizData(quiz);
    setQuizLoading(false);
    showMsg("Quiz creado ✓");
  }

  async function handleDeleteQuiz() {
    if (!quizData || !window.confirm("¿Eliminar este quiz y todas sus preguntas?")) return;
    setQuizLoading(true);
    const res = await deleteQuiz(quizData.id);
    if (res.error) {
      showMsg(res.error, true);
    } else {
      setQuizData(null);
      showMsg("Quiz eliminado");
    }
    setQuizLoading(false);
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!quizPanel || !window.confirm("¿Eliminar esta pregunta?")) return;
    setQuizLoading(true);
    const res = await deleteQuestion(questionId);
    if (res.error) {
      showMsg(res.error, true);
      setQuizLoading(false);
      return;
    }
    const quiz = await getQuizForLesson(course.slug || "", quizPanel.catalogLessonId);
    setQuizData(quiz);
    setQuizLoading(false);
  }

  async function handleAddQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quizData || !quizPanel) return;
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type") as "multiple_choice" | "true_false";
    const question = (fd.get("question") as string)?.trim();
    const correctAnswer = (fd.get("correctAnswer") as string)?.trim();
    const points = parseInt(fd.get("points") as string, 10) || 1;
    const options =
      type === "multiple_choice"
        ? (["A", "B", "C", "D"].map((l) => (fd.get(`option${l}`) as string)?.trim()).filter(Boolean))
        : ["Verdadero", "Falso"];
    if (!question || !correctAnswer) return;
    setQuizLoading(true);
    const res = await addQuestion(quizData.id, question, type, options, correctAnswer, points);
    if (res.error) {
      showMsg(res.error, true);
      setQuizLoading(false);
      return;
    }
    const updated = await getQuizForLesson(course.slug || "", quizPanel.catalogLessonId);
    setQuizData(updated);
    setShowAddQuestion(false);
    setQuestionType("multiple_choice");
    setQuizLoading(false);
    showMsg("Pregunta agregada ✓");
  }

  // ── Materials management ─────────────────────────────────────────────────────

  function openMaterialsPanel(lesson: LessonData) {
    setMaterialsPanel(lesson);
    setLocalMaterials(lesson.materials || []);
  }

  async function handleSaveMaterials() {
    if (!materialsPanel) return;
    setMaterialSaving(true);
    const res = await updateLessonMaterials(materialsPanel.id, localMaterials);
    if (res.error) {
      showMsg(res.error, true);
    } else {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          chapters: m.chapters.map((c) => ({
            ...c,
            lessons: c.lessons.map((l) =>
              l.id === materialsPanel.id ? { ...l, materials: localMaterials } : l
            ),
          })),
        }))
      );
      setMaterialsPanel(null);
      showMsg("Materiales guardados ✓");
    }
    setMaterialSaving(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  // Pre-compute catalogLessonId (sequential integer) for each lesson UUID.
  // This mirrors the counting logic in classroom/[slug]/page.tsx so quiz links work.
  const lessonCatalogIds = new Map<string, number>();
  {
    let _seq = 0;
    for (const m of [...modules].sort((a, b) => a.order - b.order)) {
      for (const ch of [...m.chapters].sort((a, b) => a.order - b.order)) {
        for (const l of [...ch.lessons].sort((a, b) => a.order - b.order)) {
          _seq++;
          lessonCatalogIds.set(l.id, _seq);
        }
      }
    }
  }

  return (
    <div className="container py-8 max-w-5xl space-y-10">
      {/* Toast */}
      {statusMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm shadow-lg border ${
            statusMsg.error
              ? "bg-red-900 border-red-500 text-red-200"
              : "bg-slate-800 border-cyan-500/50 text-cyan-300"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* ─── Sección 1: Tarjeta de información del curso ─────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Información del Curso</h2>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateCourse} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Imagen del curso */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Imagen del curso</Label>
                  <div className="h-44 rounded-xl overflow-hidden border border-border">
                    {course.image_url ? (
                      <img src={course.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${
                          course.gradient || "from-cyan-500 to-blue-600"
                        } flex items-center justify-center`}
                      >
                        <ImageIcon className="w-8 h-8 text-white/40" />
                      </div>
                    )}
                  </div>
                  <Input
                    name="image_url"
                    defaultValue={course.image_url || ""}
                    placeholder="URL de imagen (https://...)"
                    className="text-xs"
                  />
                  <Input
                    name="presentation_video_url"
                    defaultValue={course.presentation_video_url || ""}
                    placeholder="Video de presentación (https://...)"
                    className="text-xs mt-2"
                  />
                </div>

                {/* Campos de texto */}
                <div className="md:col-span-2 space-y-4">
                  <Field label="Título del curso">
                    <Input name="title" defaultValue={course.title} required />
                  </Field>

                  <Field label="Descripción">
                    <textarea
                      name="description"
                      defaultValue={course.description}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Precio (USD)">
                      <Input name="price" type="number" step="0.01" min="0" defaultValue={course.price} required />
                    </Field>
                    <Field label="Nivel">
                      <select
                        name="level"
                        defaultValue={course.level}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option>Principiante</option>
                        <option>Intermedio</option>
                        <option>Avanzado</option>
                        <option>Todos los niveles</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Acceso">
                    <select
                      name="subscription_only"
                      defaultValue={course.subscription_only ? "true" : "false"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="false">Compra única</option>
                      <option value="true">Suscripción</option>
                    </select>
                  </Field>

                  {/* Stats auto-calculadas */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-3">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <strong className="text-foreground">{totalLessons}</strong> lecciones
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <strong className="text-foreground">
                        {totalMinutes >= 60
                          ? `${(totalMinutes / 60).toFixed(1)}h`
                          : `${totalMinutes} min`}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Signal className="w-4 h-4" />
                      {course.level}
                    </span>
                    <span
                      className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${
                        course.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {course.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePublish}
                    disabled={isPending}
                    className={
                      course.status === "published"
                        ? "border-amber-500 text-amber-600 hover:bg-amber-50"
                        : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    }
                  >
                    {course.status === "draft" ? "Publicar" : "Despublicar"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteCourse}
                    disabled={isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Eliminar Curso
                  </Button>
                </div>
                <Button type="submit" size="sm" disabled={isPending}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ─── Sección 2: Estructura Módulos → Capítulos → Lecciones ──────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Estructura del Curso</h2>
          <Button
            size="sm"
            onClick={() => setModal({ type: "createModule" })}
            disabled={isPending || modules.length >= 4}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            {modules.length >= 4 ? "Máx. 4 módulos" : "Crear Módulo"}
          </Button>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin módulos</p>
            <p className="text-sm mt-1">Crea el primer módulo para estructurar el contenido del curso.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod, mi) => (
              <div key={mod.id} className="border border-cyan-500/60 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl overflow-hidden">
                {/* Cabecera del módulo */}
                <div className="flex items-center bg-muted/60 px-4 py-3 gap-2">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    {expandedModules.has(mod.id) ? (
                      <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      Módulo {String(mi + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold truncate">{mod.title}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {mod.chapters.length} cap. ·{" "}
                      {mod.chapters.reduce((s, c) => s + c.lessons.length, 0)} lecc.
                    </span>
                  </button>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setModal({ type: "editModule", module: mod })}
                      disabled={isPending}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteModule(mod.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Contenido del módulo (capítulos) */}
                {expandedModules.has(mod.id) && (
                  <div className="p-4 space-y-3">
                    {mod.chapters.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sin capítulos. Agrega el primero.
                      </p>
                    )}

                    {mod.chapters.map((ch, ci) => (
                      <div
                        key={ch.id}
                        className="ml-5 border border-purple-800/80 bg-purple-50 dark:bg-purple-900/20 rounded-lg overflow-hidden"
                      >
                        {/* Cabecera del capítulo */}
                        <div className="flex items-center bg-muted/30 px-3 py-2 gap-2">
                          <button
                            onClick={() => toggleChapter(ch.id)}
                            className="flex items-center gap-2 flex-1 min-w-0 text-left"
                          >
                            {expandedChapters.has(ch.id) ? (
                              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground shrink-0">Cap. {ci + 1}</span>
                            <span className="font-medium text-sm truncate">{ch.title}</span>
                            <span className="text-xs text-muted-foreground ml-1 shrink-0">
                              {ch.lessons.length} lecc.
                            </span>
                          </button>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => setModal({ type: "editChapter", chapter: ch })}
                              disabled={isPending}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteChapter(mod.id, ch.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Lecciones */}
                        {expandedChapters.has(ch.id) && (
                          <div className="p-3 space-y-1">
                            {ch.lessons.map((lesson, li) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-2 px-2 py-1.5 rounded bg-yellow-400/40 dark:bg-amber-900/20 hover:bg-amber-100/80 group"
                              >
                                <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">
                                  {li + 1}.
                                </span>
                                <span className="flex-1 text-sm truncate">{lesson.title}</span>
                                {lesson.duration != null && (
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {lesson.duration} min
                                  </span>
                                )}
                                {lesson.video_url && (
                                  <span className="text-xs text-cyan-500 shrink-0">▶</span>
                                )}
                                {(lesson.materials?.length ?? 0) > 0 && (
                                  <span className="text-xs text-amber-500 shrink-0" title={`${lesson.materials!.length} material(es)`}>
                                    📎{lesson.materials!.length}
                                  </span>
                                )}
                                <div className="flex gap-1 opacity-100 transition-opacity shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-violet-600 hover:text-violet-700"
                                    title="Gestionar Quiz"
                                    onClick={() => openQuizPanel(lesson, lessonCatalogIds.get(lesson.id) || 0)}
                                    disabled={isPending}
                                  >
                                    <ClipboardList className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-amber-600 hover:text-amber-700"
                                    title="Gestionar Materiales"
                                    onClick={() => openMaterialsPanel(lesson)}
                                    disabled={isPending}
                                  >
                                    <Paperclip className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setModal({ type: "editLesson", lesson })}
                                    disabled={isPending}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteLesson(mod.id, ch.id, lesson.id)}
                                    disabled={isPending}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2 h-8 text-xs border-dashed"
                              onClick={() => setModal({ type: "createLesson", chapter: ch })}
                              disabled={isPending}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Agregar Lección
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-5 w-[calc(100%-1.25rem)] border-dashed"
                      onClick={() => setModal({ type: "createChapter", module: mod })}
                      disabled={isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Capítulo
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Modals ───────────────────────────────────────────────────────────── */}

      {modal?.type === "createModule" && (
        <Modal title="Crear Módulo" onClose={() => setModal(null)} wide>
          <form onSubmit={handleCreateModule} className="space-y-4">
            <Field label="Título del módulo">
              <Input name="title" required autoFocus placeholder="Ej: Introducción al Análisis Estructural" />
            </Field>
            <Field label="Video de presentación (opcional)">
              <Input name="presentation_video_url" type="url" placeholder="https://..." />
            </Field>
            <Field label="Precio del módulo (USD)">
              <Input name="price" type="number" step="0.01" min="0" defaultValue={0} required />
            </Field>
            <ModalActions onClose={() => setModal(null)} pending={isPending} label="Crear Módulo" />
          </form>
        </Modal>
      )}

      {modal?.type === "editModule" && (
        <Modal title="Editar Módulo" onClose={() => setModal(null)} wide>
          <form onSubmit={handleUpdateModule} className="space-y-4">
            <Field label="Título del módulo">
              <Input name="title" defaultValue={modal.module.title} required autoFocus />
            </Field>
            <Field label="Video de presentación (opcional)">
              <Input
                name="presentation_video_url"
                type="url"
                defaultValue={modal.module.presentation_video_url || ""}
                placeholder="https://..."
              />
            </Field>
            <Field label="Precio del módulo (USD)">
              <Input name="price" type="number" step="0.01" min="0" defaultValue={modal.module.price ?? 0} required />
            </Field>
            <ModalActions onClose={() => setModal(null)} pending={isPending} />
          </form>
        </Modal>
      )}

      {modal?.type === "createChapter" && (
        <Modal title={`Nuevo Capítulo — ${modal.module.title}`} onClose={() => setModal(null)}>
          <form onSubmit={handleCreateChapter} className="space-y-4">
            <Field label="Título del capítulo">
              <Input name="title" required autoFocus placeholder="Ej: Fundamentos del Diseño" />
            </Field>
            <ModalActions onClose={() => setModal(null)} pending={isPending} label="Crear Capítulo" />
          </form>
        </Modal>
      )}

      {modal?.type === "editChapter" && (
        <Modal title="Editar Capítulo" onClose={() => setModal(null)}>
          <form onSubmit={handleUpdateChapter} className="space-y-4">
            <Field label="Título del capítulo">
              <Input name="title" defaultValue={modal.chapter.title} required autoFocus />
            </Field>
            <ModalActions onClose={() => setModal(null)} pending={isPending} />
          </form>
        </Modal>
      )}

      {modal?.type === "createLesson" && (
        <Modal title={`Nueva Lección — ${modal.chapter.title}`} onClose={() => setModal(null)} wide>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <Field label="Título de la lección">
              <Input name="title" required autoFocus placeholder="Ej: ¿Qué es la Demanda en el Diseño?" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duración (minutos)">
                <Input name="duration" type="number" min="0" placeholder="22" />
              </Field>
              <Field label="URL del video">
                <Input name="videoUrl" type="url" placeholder="https://..." />
              </Field>
            </div>
            <ModalActions onClose={() => setModal(null)} pending={isPending} label="Crear Lección" />
          </form>
        </Modal>
      )}

      {modal?.type === "editLesson" && (
        <Modal title="Editar Lección" onClose={() => setModal(null)} wide>
          <form onSubmit={handleUpdateLesson} className="space-y-4">
            <Field label="Título">
              <Input name="title" defaultValue={modal.lesson.title} required autoFocus />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duración (minutos)">
                <Input
                  name="duration"
                  type="number"
                  min="0"
                  defaultValue={modal.lesson.duration ?? ""}
                  placeholder="22"
                />
              </Field>
              <Field label="URL del video">
                <Input
                  name="videoUrl"
                  type="url"
                  defaultValue={modal.lesson.video_url || ""}
                  placeholder="https://..."
                />
              </Field>
            </div>
            <ModalActions onClose={() => setModal(null)} pending={isPending} />
          </form>
        </Modal>
      )}

      {/* ─── Quiz Panel ───────────────────────────────────────────────────── */}
      {quizPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-background border rounded-xl shadow-xl w-full max-w-2xl p-6 my-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-violet-500" />
                Quiz — {quizPanel.lesson.title}
              </h2>
              <button onClick={() => setQuizPanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Lección #{quizPanel.catalogLessonId} · {course.slug}
            </p>

            {/* Loading */}
            {quizLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
            )}

            {/* No quiz yet */}
            {!quizLoading && !quizData && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">Esta lección no tiene quiz todavía.</p>
                <form onSubmit={handleCreateQuiz} className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <p className="text-sm font-medium">Crear Quiz</p>
                  <Field label="Título del quiz">
                    <Input name="title" required autoFocus placeholder="Ej: Evaluación del capítulo" />
                  </Field>
                  <Field label="Puntaje mínimo para aprobar (%)">
                    <Input name="passing_score" type="number" min="1" max="100" defaultValue={70} required />
                  </Field>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setQuizPanel(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={quizLoading}>
                      Crear Quiz
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Quiz exists */}
            {!quizLoading && quizData && (
              <div className="space-y-4">
                {/* Quiz meta */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium">{quizData.title}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    Aprobación: {quizData.passing_score}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {quizData.questions.length} pregunta(s)
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-auto h-7 text-xs"
                    onClick={handleDeleteQuiz}
                    disabled={quizLoading}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Eliminar quiz
                  </Button>
                </div>

                {/* Questions list */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {quizData.questions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                      Sin preguntas. Agrega la primera.
                    </p>
                  )}
                  {quizData.questions.map((q, qi) => (
                    <div key={q.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {qi + 1}. {q.type === "multiple_choice" ? "Opción múltiple" : "V/F"} · {q.points} pt
                            </span>
                          </div>
                          <p className="text-sm">{q.question}</p>
                          {q.options && q.options.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {q.options.map((opt, oi) => (
                                <li
                                  key={oi}
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    opt === q.correct_answer
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-medium"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {opt === q.correct_answer ? "✓ " : "· "}{opt}
                                </li>
                              ))}
                            </ul>
                          )}
                          {!q.options && (
                            <p className="text-xs text-emerald-600 mt-0.5">✓ {q.correct_answer}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive shrink-0"
                          onClick={() => handleDeleteQuestion(q.id)}
                          disabled={quizLoading}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add question form */}
                {showAddQuestion ? (
                  <form
                    key="add-question-form"
                    onSubmit={handleAddQuestion}
                    className="border rounded-lg p-4 space-y-3 bg-muted/20"
                  >
                    <p className="text-sm font-medium">Nueva Pregunta</p>
                    <Field label="Tipo">
                      <select
                        name="type"
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as "multiple_choice" | "true_false")}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="multiple_choice">Opción múltiple</option>
                        <option value="true_false">Verdadero / Falso</option>
                      </select>
                    </Field>
                    <Field label="Pregunta">
                      <Input name="question" required placeholder="¿Cuál es...?" autoFocus />
                    </Field>
                    {questionType === "multiple_choice" && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {["A", "B", "C", "D"].map((letter) => (
                            <Field key={letter} label={`Opción ${letter}`}>
                              <Input name={`option${letter}`} required placeholder={`Opción ${letter}`} />
                            </Field>
                          ))}
                        </div>
                        <Field label="Respuesta correcta (copia exacta de la opción)">
                          <Input name="correctAnswer" required placeholder="Escribe la opción correcta" />
                        </Field>
                      </>
                    )}
                    {questionType === "true_false" && (
                      <Field label="Respuesta correcta">
                        <select
                          name="correctAnswer"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="Verdadero">Verdadero</option>
                          <option value="Falso">Falso</option>
                        </select>
                      </Field>
                    )}
                    <Field label="Puntos">
                      <Input name="points" type="number" min="1" defaultValue={1} />
                    </Field>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddQuestion(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm" disabled={quizLoading}>
                        Agregar Pregunta
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={() => setShowAddQuestion(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar Pregunta
                  </Button>
                )}

                <div className="flex justify-end pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setQuizPanel(null)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Materials Panel ──────────────────────────────────────────────── */}
      {materialsPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-amber-500" />
                Materiales — {materialsPanel.title}
              </h2>
              <button onClick={() => setMaterialsPanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Materials list */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {localMaterials.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                  Sin materiales. Agrega el primero.
                </p>
              )}
              {localMaterials.map((mat, i) => (
                <div key={i} className="flex items-center gap-2 border rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mat.title || "(sin título)"}</p>
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-600 hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      {mat.url}
                    </a>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive shrink-0"
                    onClick={() => setLocalMaterials((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add material form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const title = (fd.get("mat_title") as string)?.trim();
                const url = (fd.get("mat_url") as string)?.trim();
                if (!url) return;
                setLocalMaterials((prev) => [...prev, { title: title || url, url }]);
                e.currentTarget.reset();
              }}
              className="space-y-2 border rounded-lg p-3 bg-muted/20 mb-4"
            >
              <p className="text-xs font-medium text-muted-foreground">Agregar material</p>
              <Field label="Título">
                <Input name="mat_title" placeholder="Ej: Presentación PDF" />
              </Field>
              <Field label="URL del archivo">
                <Input name="mat_url" type="url" placeholder="https://..." required />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="outline">
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar
                </Button>
              </div>
            </form>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setMaterialsPanel(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveMaterials} disabled={materialSaving}>
                <Save className="w-3.5 h-3.5 mr-1" />
                Guardar Materiales
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`bg-background border rounded-xl shadow-xl w-full ${wide ? "max-w-lg" : "max-w-sm"} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function ModalActions({
  onClose,
  pending,
  label = "Guardar",
}: {
  onClose: () => void;
  pending: boolean;
  label?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" size="sm" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" size="sm" disabled={pending}>
        {label}
      </Button>
    </div>
  );
}
