"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getUser } from "./auth";

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[] | null;
  correct_answer: string;
  points: number;
}

export interface QuizWithQuestions {
  id: string;
  title: string;
  passing_score: number;
  course_slug: string;
  catalog_lesson_id: number;
  questions: QuizQuestion[];
}

export interface QuizAttemptResult {
  score: number;
  totalPoints: number;
  passed: boolean;
  correctAnswers: Record<string, string>;
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  const supabase = getAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();
  return data;
}

// ── Read ──

export async function getQuizzesForCourse(
  courseSlug: string
): Promise<QuizWithQuestions[]> {
  const supabase = getAdmin();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, passing_score, course_slug, catalog_lesson_id")
    .eq("course_slug", courseSlug)
    .not("catalog_lesson_id", "is", null);

  if (!quizzes || quizzes.length === 0) return [];

  const quizIds = quizzes.map((q) => q.id);
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, question, type, options, correct_answer, points")
    .in("quiz_id", quizIds)
    .order("created_at");

  const questionsByQuiz = new Map<string, QuizQuestion[]>();
  (questions || []).forEach((q: any) => {
    const list = questionsByQuiz.get(q.quiz_id) || [];
    list.push({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      correct_answer: q.correct_answer,
      points: q.points,
    });
    questionsByQuiz.set(q.quiz_id, list);
  });

  return quizzes.map((quiz: any) => ({
    id: quiz.id,
    title: quiz.title,
    passing_score: quiz.passing_score,
    course_slug: quiz.course_slug,
    catalog_lesson_id: quiz.catalog_lesson_id,
    questions: questionsByQuiz.get(quiz.id) || [],
  }));
}

export async function getLastAttempt(
  quizId: string
): Promise<QuizAttemptResult | null> {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = getAdmin();
  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("score, answers")
    .eq("quiz_id", quizId)
    .eq("user_id", profile.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  if (!attempt) return null;

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("passing_score")
    .eq("id", quizId)
    .single();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, correct_answer, points")
    .eq("quiz_id", quizId);

  const totalPoints = (questions || []).reduce(
    (sum: number, q: any) => sum + (q.points || 1),
    0
  );
  const correctAnswers: Record<string, string> = {};
  (questions || []).forEach((q: any) => {
    correctAnswers[q.id] = q.correct_answer;
  });

  return {
    score: attempt.score,
    totalPoints,
    passed: attempt.score >= (quiz?.passing_score || 70),
    correctAnswers,
  };
}

// ── Submit ──

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>
): Promise<{ success?: boolean; result?: QuizAttemptResult; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  const supabase = getAdmin();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, correct_answer, points")
    .eq("quiz_id", quizId);

  if (!questions || questions.length === 0)
    return { error: "Quiz no encontrado" };

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("passing_score")
    .eq("id", quizId)
    .single();

  let earned = 0;
  let totalPoints = 0;
  const correctAnswers: Record<string, string> = {};

  questions.forEach((q: any) => {
    totalPoints += q.points || 1;
    correctAnswers[q.id] = q.correct_answer;
    if (answers[q.id]?.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
      earned += q.points || 1;
    }
  });

  const score = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;
  const passed = score >= (quiz?.passing_score || 70);

  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: profile.id,
    quiz_id: quizId,
    score,
    answers,
  });

  if (error) return { error: "Error al guardar el intento" };

  return {
    success: true,
    result: { score, totalPoints, passed, correctAnswers },
  };
}

// ── Admin: Create / Delete ──

export async function createQuiz(
  courseSlug: string,
  catalogLessonId: number,
  title: string,
  passingScore: number
): Promise<{ success?: boolean; id?: string; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (profile.role !== "instructor" && profile.role !== "admin") {
    return { error: "Sin permisos" };
  }

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      course_slug: courseSlug,
      catalog_lesson_id: catalogLessonId,
      title,
      passing_score: passingScore,
    })
    .select("id")
    .single();

  if (error) return { error: "Error al crear el quiz" };
  revalidatePath(`/classroom/${courseSlug}`);
  return { success: true, id: data.id };
}

export async function addQuestion(
  quizId: string,
  question: string,
  type: "multiple_choice" | "true_false",
  options: string[],
  correctAnswer: string,
  points: number
): Promise<{ success?: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (profile.role !== "instructor" && profile.role !== "admin") {
    return { error: "Sin permisos" };
  }

  const supabase = getAdmin();
  const { error } = await supabase.from("quiz_questions").insert({
    quiz_id: quizId,
    question,
    type,
    options: options.length > 0 ? options : null,
    correct_answer: correctAnswer,
    points,
  });

  if (error) return { error: "Error al agregar pregunta" };
  return { success: true };
}

export async function deleteQuestion(
  questionId: string
): Promise<{ success?: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (profile.role !== "instructor" && profile.role !== "admin") {
    return { error: "Sin permisos" };
  }

  const supabase = getAdmin();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);

  if (error) return { error: "Error al eliminar pregunta" };
  return { success: true };
}

export async function deleteQuiz(
  quizId: string
): Promise<{ success?: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };
  if (profile.role !== "instructor" && profile.role !== "admin") {
    return { error: "Sin permisos" };
  }

  const supabase = getAdmin();
  const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

  if (error) return { error: "Error al eliminar el quiz" };
  return { success: true };
}
