"use client";

import { useState } from "react";
import {
  FileText,
  PenTool,
  MessageSquare,
  Download,
  ExternalLink,
} from "lucide-react";

type TabType = "materiales" | "ejercicios" | "comentarios";

interface ClassroomTabsProps {
  lessonTitle: string;
}

export default function ClassroomTabs({ lessonTitle }: ClassroomTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("materiales");

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "materiales",
      label: "Materiales",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "ejercicios",
      label: "Ejercicios",
      icon: <PenTool className="w-4 h-4" />,
    },
    {
      id: "comentarios",
      label: "Comentarios",
      icon: <MessageSquare className="w-4 h-4" />,
    },
  ];

  return (
    <div className="border-t border-slate-700/50">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-700/50 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "text-cyan-400 border-cyan-400"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 min-h-[200px]">
        {activeTab === "materiales" && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">
              Material de apoyo
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    Presentación de la lección
                  </p>
                  <p className="text-slate-500 text-xs">PDF - 2.4 MB</p>
                </div>
                <Download className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    Referencias y bibliografía
                  </p>
                  <p className="text-slate-500 text-xs">Enlace externo</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "ejercicios" && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <PenTool className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-semibold mb-2">Próximamente</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm">
              Los ejercicios prácticos de esta lección estarán disponibles
              próximamente.
            </p>
          </div>
        )}

        {activeTab === "comentarios" && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-semibold mb-2">Próximamente</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm">
              La sección de comentarios estará disponible próximamente para
              interactuar con otros estudiantes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
