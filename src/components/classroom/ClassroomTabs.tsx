"use client";

import { useState } from "react";
import {
  FileText,
  PenTool,
  MessageSquare,
  Download,
  ExternalLink,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import QuizPanel from "./QuizPanel";
import LessonComments from "./LessonComments";
import { getYoutubeEmbedUrl, getCloudflareStreamUrl } from "@/lib/utils";
import CfStreamEmbed from "./CfStreamEmbed";
import type { QuizWithQuestions } from "@/app/actions/quizzes";
import type { LessonFaq } from "@/app/actions/courses";

type TabType = "materiales" | "ejercicios" | "comentarios" | "preguntas";

interface ClassroomTabsProps {
  quiz?: QuizWithQuestions | null;
  lessonMaterials?: { title: string; url: string }[];
  lessonDbId?: string;
  faqs?: LessonFaq[];
}

export default function ClassroomTabs({
  quiz,
  lessonMaterials,
  lessonDbId,
  faqs = [],
}: ClassroomTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("materiales");

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "materiales", label: "Materiales", icon: <FileText className="w-4 h-4" /> },
    { id: "ejercicios", label: "Ejercicios", icon: <PenTool className="w-4 h-4" /> },
    { id: "comentarios", label: "Comentarios", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "preguntas", label: "Preguntas en Vivo", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="border-t border-slate-700/50">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-700/90 px-2 sm:px-6 bg-slate-800/80 rounded-t-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? "text-cyan-400 border-cyan-400"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 min-h-[200px] bg-slate-800/90 border border-slate-700/80 rounded-xl shadow-lg">
        {activeTab === "materiales" && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Material de apoyo</h3>
            {(!lessonMaterials || lessonMaterials.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Sin materiales</p>
                <p className="text-slate-500 text-xs text-center mt-1 max-w-xs">
                  El instructor aún no ha subido materiales para esta lección.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lessonMaterials.map((mat, i) => {
                  const isExternal =
                    !mat.url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)(\?|$)/i);
                  return (
                    <a
                      key={i}
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isExternal ? "bg-purple-500/10" : "bg-cyan-500/10"
                        }`}
                      >
                        {isExternal ? (
                          <ExternalLink className="w-5 h-5 text-purple-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{mat.title}</p>
                        <p className="text-slate-500 text-xs truncate">{mat.url}</p>
                      </div>
                      {isExternal ? (
                        <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <Download className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "ejercicios" && <QuizPanel quiz={quiz} />}

        {activeTab === "comentarios" && (
          lessonDbId ? (
            <LessonComments lessonDbId={lessonDbId} />
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">Comentarios no disponibles para esta lección.</p>
            </div>
          )
        )}

        {activeTab === "preguntas" && (
          faqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Sin preguntas en vivo</p>
              <p className="text-slate-500 text-xs text-center mt-1 max-w-xs">
                El instructor aún no ha agregado preguntas en vivo para esta lección.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-white font-semibold">Preguntas en Vivo</h3>
              {faqs.map((faq, i) => (
                <div key={faq.id} className="space-y-3">
                  {/* Pregunta */}
                  <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <span className="text-indigo-400 font-bold text-sm shrink-0 mt-0.5">
                      P{String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-white text-sm leading-relaxed">{faq.question}</p>
                  </div>
                  {/* Video (opcional) */}
                  {faq.video_url && (
                    <div className="pl-8">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-2">
                        <PlayCircle className="w-3.5 h-3.5" />
                        Respuesta en video
                      </div>
                      <div className="aspect-video bg-black rounded-xl overflow-hidden max-w-xl">
                        {getCloudflareStreamUrl(faq.video_url) ? (
                          <CfStreamEmbed
                            src={faq.video_url}
                            className="w-full h-full"
                          />
                        ) : getYoutubeEmbedUrl(faq.video_url) ? (
                          <iframe
                            src={getYoutubeEmbedUrl(faq.video_url)!}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video src={faq.video_url} controls className="w-full h-full" />
                        )}
                      </div>
                    </div>
                  )}
                  {/* Separador entre preguntas */}
                  {i < faqs.length - 1 && <hr className="border-slate-700/50" />}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
