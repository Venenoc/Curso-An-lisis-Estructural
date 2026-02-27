"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateCourse,
  publishCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/app/actions/courses";
import {
  createQuiz,
  addQuestion,
  deleteQuiz,
  deleteQuestion,
} from "@/app/actions/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ClipboardList,
  X,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  video_url: string | null;
  order: number;
  duration: number | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  slug?: string;
}

interface AdminCourseClientProps {
  course: Course;
  lessons: Lesson[];
}

type ModalType =
  | "editCourse"
  | "addLesson"
  | "editLesson"
  | "addQuiz"
  | "addQuestion"
  | null;

export default function AdminCourseClient({
  course: initialCourse,
  lessons: initialLessons,
}: AdminCourseClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [course, setCourse] = useState(initialCourse);
  const [lessons, setLessons] = useState(initialLessons);
  const [modal, setModal] = useState<ModalType>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] =
    useState<Lesson | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [expandedQuizLesson, setExpandedQuizLesson] = useState<string | null>(
    null
  );

  function showMsg(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // ── Course Actions ──

  async function handleUpdateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCourse(course.id, fd);
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        setCourse((prev) => ({
          ...prev,
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          price: parseFloat(fd.get("price") as string),
        }));
        setModal(null);
        showMsg("Curso actualizado");
      }
    });
  }

  async function handleTogglePublish() {
    if (
      !window.confirm(
        course.status === "draft"
          ? "¿Publicar el curso?"
          : "¿Despublicar el curso?"
      )
    )
      return;
    startTransition(async () => {
      const res = await publishCourse(course.id);
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        setCourse((prev) => ({
          ...prev,
          status: prev.status === "draft" ? "published" : "draft",
        }));
        showMsg(
          course.status === "draft" ? "Curso publicado" : "Curso despublicado"
        );
      }
    });
  }

  async function handleDeleteCourse() {
    if (!window.confirm("¿Eliminar el curso? Esta acción no se puede deshacer."))
      return;
    startTransition(async () => {
      const res = await deleteCourse(course.id);
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        router.push("/admin/courses");
      }
    });
  }

  // ── Lesson Actions ──

  async function handleCreateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("order", String(lessons.length));
    startTransition(async () => {
      const res = await createLesson(course.id, fd);
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        // Refresh lesson list via router revalidation
        router.refresh();
        setModal(null);
        showMsg("Lección creada");
      }
    });
  }

  async function handleUpdateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingLesson) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateLesson(editingLesson.id, fd);
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === editingLesson.id
              ? {
                  ...l,
                  title: fd.get("title") as string,
                  video_url: (fd.get("videoUrl") as string) || null,
                }
              : l
          )
        );
        setModal(null);
        setEditingLesson(null);
        showMsg("Lección actualizada");
      }
    });
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!window.confirm("¿Eliminar esta lección?")) return;
    startTransition(async () => {
      const res = await deleteLesson(lessonId);
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        showMsg("Lección eliminada");
      }
    });
  }

  // ── Quiz Actions ──

  async function handleCreateQuiz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedLessonForQuiz || !course.slug) return;
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const passingScore = parseInt(fd.get("passingScore") as string, 10) || 70;

    // We use the lesson DB id as catalog_lesson_id (it won't match catalog IDs, but for
    // DB-managed courses this is fine; for catalog-based courses, the lesson order is used)
    const catalogLessonId = selectedLessonForQuiz.order || 0;

    startTransition(async () => {
      const res = await createQuiz(
        course.slug!,
        catalogLessonId,
        title,
        passingScore
      );
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else if (res?.id) {
        setActiveQuizId(res.id);
        setModal("addQuestion");
        showMsg("Quiz creado. Ahora agrega preguntas.");
      }
    });
  }

  async function handleAddQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeQuizId) return;
    const fd = new FormData(e.currentTarget);
    const question = fd.get("question") as string;
    const type = fd.get("type") as "multiple_choice" | "true_false";
    const optionsRaw = fd.get("options") as string;
    const options =
      type === "multiple_choice"
        ? optionsRaw
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    const correctAnswer = fd.get("correctAnswer") as string;
    const points = parseInt(fd.get("points") as string, 10) || 1;

    startTransition(async () => {
      const res = await addQuestion(
        activeQuizId,
        question,
        type,
        options,
        correctAnswer,
        points
      );
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        (e.target as HTMLFormElement).reset();
        showMsg("Pregunta agregada");
      }
    });
  }

  async function handleDeleteQuiz(quizId: string) {
    if (!window.confirm("¿Eliminar este quiz y todas sus preguntas?")) return;
    startTransition(async () => {
      const res = await deleteQuiz(quizId);
      if (res?.error) {
        showMsg(`Error: ${res.error}`);
      } else {
        router.refresh();
        showMsg("Quiz eliminado");
      }
    });
  }

  // ── Render ──

  return (
    <div className="container py-12 space-y-8">
      {/* Status message */}
      {statusMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-cyan-500/50 text-cyan-300 px-4 py-2 rounded-lg text-sm shadow-lg">
          {statusMsg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold capitalize ${
                course.status === "published"
                  ? "text-emerald-500"
                  : "text-amber-500"
              }`}
            >
              {course.status}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Precio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${course.price.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lecciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{lessons.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setModal("editCourse")}
          disabled={isPending}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar Información
        </Button>
        <Button
          variant="outline"
          onClick={handleTogglePublish}
          disabled={isPending}
          className={
            course.status === "published"
              ? "border-amber-500 text-amber-500 hover:bg-amber-500/10"
              : "border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
          }
        >
          {course.status === "draft" ? "Publicar" : "Despublicar"}
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteCourse}
          disabled={isPending}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar Curso
        </Button>
      </div>

      {/* Lessons Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Lecciones
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setModal("addLesson")}
              disabled={isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Lección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lessons.length > 0 ? (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{lesson.title}</h4>
                      {lesson.video_url && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {lesson.video_url}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setExpandedQuizLesson(
                            expandedQuizLesson === lesson.id ? null : lesson.id
                          );
                        }}
                        title="Gestionar Quiz"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingLesson(lesson);
                          setModal("editLesson");
                        }}
                        disabled={isPending}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quiz management per lesson */}
                  {expandedQuizLesson === lesson.id && (
                    <div className="bg-muted/20 border-t p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Quiz de la lección
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLessonForQuiz(lesson);
                            setModal("addQuiz");
                          }}
                          disabled={isPending}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Crear Quiz
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Los quizzes creados aquí aparecerán en la tab
                        "Ejercicios" del classroom para esta lección (por
                        número de orden: {lesson.order}).
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aún no hay lecciones en este curso
              </p>
              <Button
                onClick={() => setModal("addLesson")}
                disabled={isPending}
              >
                Crear Primera Lección
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ── */}

      {/* Edit Course Modal */}
      {modal === "editCourse" && (
        <Modal title="Editar Curso" onClose={() => setModal(null)}>
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <Field label="Título">
              <Input
                name="title"
                defaultValue={course.title}
                required
              />
            </Field>
            <Field label="Descripción">
              <textarea
                name="description"
                defaultValue={course.description}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <Field label="Precio (USD)">
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={course.price}
                required
              />
            </Field>
            <ModalActions onClose={() => setModal(null)} pending={isPending} />
          </form>
        </Modal>
      )}

      {/* Add Lesson Modal */}
      {modal === "addLesson" && (
        <Modal title="Agregar Lección" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <Field label="Título de la lección">
              <Input name="title" required placeholder="Ej: Introducción al tema" />
            </Field>
            <Field label="URL del video (opcional)">
              <Input
                name="videoUrl"
                type="url"
                placeholder="https://..."
              />
            </Field>
            <ModalActions onClose={() => setModal(null)} pending={isPending} />
          </form>
        </Modal>
      )}

      {/* Edit Lesson Modal */}
      {modal === "editLesson" && editingLesson && (
        <Modal
          title="Editar Lección"
          onClose={() => {
            setModal(null);
            setEditingLesson(null);
          }}
        >
          <form onSubmit={handleUpdateLesson} className="space-y-4">
            <Field label="Título">
              <Input
                name="title"
                defaultValue={editingLesson.title}
                required
              />
            </Field>
            <Field label="URL del video">
              <Input
                name="videoUrl"
                type="url"
                defaultValue={editingLesson.video_url || ""}
                placeholder="https://..."
              />
            </Field>
            <ModalActions
              onClose={() => {
                setModal(null);
                setEditingLesson(null);
              }}
              pending={isPending}
            />
          </form>
        </Modal>
      )}

      {/* Add Quiz Modal */}
      {modal === "addQuiz" && selectedLessonForQuiz && (
        <Modal
          title={`Crear Quiz para: ${selectedLessonForQuiz.title}`}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <Field label="Título del quiz">
              <Input name="title" required placeholder="Ej: Evaluación Lección 1" />
            </Field>
            <Field label="Puntaje mínimo para aprobar (%)">
              <Input
                name="passingScore"
                type="number"
                min="1"
                max="100"
                defaultValue="70"
                required
              />
            </Field>
            <ModalActions
              onClose={() => setModal(null)}
              pending={isPending}
              submitLabel="Crear Quiz"
            />
          </form>
        </Modal>
      )}

      {/* Add Question Modal */}
      {modal === "addQuestion" && activeQuizId && (
        <Modal
          title="Agregar Pregunta al Quiz"
          onClose={() => {
            setModal(null);
            setActiveQuizId(null);
          }}
          wide
        >
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <Field label="Tipo de pregunta">
              <select
                name="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="multiple_choice"
              >
                <option value="multiple_choice">Opción múltiple</option>
                <option value="true_false">Verdadero / Falso</option>
              </select>
            </Field>
            <Field label="Pregunta">
              <Input name="question" required placeholder="Escribe la pregunta..." />
            </Field>
            <Field label="Opciones (una por línea, solo para opción múltiple)">
              <textarea
                name="options"
                rows={4}
                placeholder={"Opción A\nOpción B\nOpción C\nOpción D"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <Field label="Respuesta correcta (exacta)">
              <Input
                name="correctAnswer"
                required
                placeholder="Debe coincidir exactamente con una opción"
              />
            </Field>
            <Field label="Puntos">
              <Input name="points" type="number" min="1" defaultValue="1" required />
            </Field>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModal(null);
                  setActiveQuizId(null);
                }}
              >
                Cerrar
              </Button>
              <Button type="submit" disabled={isPending}>
                Agregar Pregunta
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ── Helper components ──

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
      <div
        className={`bg-background border rounded-xl shadow-xl w-full ${
          wide ? "max-w-xl" : "max-w-md"
        } p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
  submitLabel = "Guardar",
}: {
  onClose: () => void;
  pending: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
    </div>
  );
}
