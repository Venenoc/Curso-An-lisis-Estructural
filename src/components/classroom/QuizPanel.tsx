"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitQuizAttempt,
  getLastAttempt,
  type QuizWithQuestions,
  type QuizAttemptResult,
} from "@/app/actions/quizzes";

interface QuizPanelProps {
  quiz: QuizWithQuestions | null | undefined;
}

export default function QuizPanel({ quiz }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quiz) return;
    setAnswers({});
    setResult(null);
    setError(null);
    setLoadingPrev(true);
    getLastAttempt(quiz.id).then((prev) => {
      if (prev) setResult(prev);
      setLoadingPrev(false);
    });
  }, [quiz?.id]);

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-white font-semibold mb-2">Sin ejercicios</h3>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          No hay ejercicios para esta lección.
        </p>
      </div>
    );
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await submitQuizAttempt(quiz.id, answers);
    if (res.error) {
      setError(res.error);
    } else if (res.result) {
      setResult(res.result);
    }
    setSubmitting(false);
  };

  if (loadingPrev) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    );
  }

  // Resultado final — sin opción de reintento
  if (result) {
    const percent = result.score;
    const passed = result.passed;
    return (
      <div className="space-y-4">
        {/* Resultado global */}
        <div
          className={`rounded-xl p-5 border ${
            passed
              ? "bg-emerald-900/20 border-emerald-500/30"
              : "bg-red-900/20 border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {passed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 shrink-0" />
            )}
            <h3 className={`font-semibold text-lg ${passed ? "text-emerald-300" : "text-red-300"}`}>
              {passed ? "¡Aprobado!" : "No aprobado"}
            </h3>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="w-3 h-3" />
              Intento finalizado
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            Obtuviste{" "}
            <span className="font-bold text-white">{percent}%</span>
            {" "}(mínimo {quiz.passing_score}% para aprobar)
          </p>
        </div>

        {/* Revisión de respuestas */}
        <div className="space-y-3">
          {quiz.questions.map((q) => {
            const correct = result.correctAnswers[q.id];
            const given = answers[q.id] ?? "(sin respuesta guardada)";
            const isCorrect =
              given.trim().toLowerCase() === correct.trim().toLowerCase();
            return (
              <div
                key={q.id}
                className={`rounded-lg p-4 border ${
                  isCorrect
                    ? "bg-emerald-900/10 border-emerald-700/40"
                    : "bg-red-900/10 border-red-700/40"
                }`}
              >
                <p className="text-white text-sm font-medium mb-1">{q.question}</p>
                {!isCorrect && (
                  <p className="text-slate-400 text-xs mb-1">
                    Tu respuesta:{" "}
                    <span className="text-red-400">{given}</span>
                  </p>
                )}
                <p className="text-xs">
                  Respuesta correcta:{" "}
                  <span className="text-emerald-400 font-medium">{correct}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Formulario del quiz
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{quiz.title}</h3>
        <span className="text-slate-500 text-xs">
          Aprobado con {quiz.passing_score}% · 1 intento
        </span>
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="space-y-2">
          <p className="text-white text-sm font-medium">
            {idx + 1}. {q.question}
            <span className="text-slate-500 text-xs ml-2">
              ({q.points} {q.points === 1 ? "punto" : "puntos"})
            </span>
          </p>

          {q.type === "true_false" ? (
            <div className="flex gap-3">
              {["Verdadero", "Falso"].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-colors ${
                    answers[q.id] === opt
                      ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    className="hidden"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(q.options || []).map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-lg border transition-colors ${
                    answers[q.id] === opt
                      ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    className="hidden"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      {error && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="bg-cyan-600 hover:bg-cyan-700 text-white"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Respuestas"
        )}
      </Button>
    </div>
  );
}
