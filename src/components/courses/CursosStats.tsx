"use client";

import { BookOpen, GraduationCap, Clock, Award } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface CursosStatsProps {
  coursesCount: number;
  lessonsCount: number;
}

export default function CursosStats({ coursesCount, lessonsCount }: CursosStatsProps) {
  const stats = [
    { icon: <BookOpen className="w-6 h-6 text-cyan-400 mx-auto mb-2" />, target: coursesCount, suffix: "",    label: "Cursos" },
    { icon: <GraduationCap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />, target: lessonsCount, suffix: "+", label: "Lecciones" },
    { icon: <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />,        target: 150,         suffix: "+", label: "Horas de contenido" },
    { icon: <Award className="w-6 h-6 text-cyan-400 mx-auto mb-2" />,        target: 100,         suffix: "%", label: "Certificado" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {stats.map((stat, i) => (
        <ScrollReveal key={stat.label} delay={0.2 + i * 0.08}>
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
            {stat.icon}
            <div className="text-2xl font-bold text-white">
              <CountUp target={stat.target} suffix={stat.suffix} />
            </div>
            <div className="text-xs text-slate-400">{stat.label}</div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
