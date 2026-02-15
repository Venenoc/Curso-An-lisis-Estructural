"use client";

import Link from "next/link";
import { BookOpen, Clock, Signal, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogCourse } from "@/data/courses-catalog";

interface CourseCardProps {
  course: CatalogCourse;
  purchased: boolean;
  isAuthenticated: boolean;
}

export default function CourseCard({ course, purchased, isAuthenticated }: CourseCardProps) {
  const link = isAuthenticated
    ? `/cursos/${course.slug}`
    : `/login?redirectTo=/cursos/${course.slug}`;
  return (
    <Link href={link} className="block">
      <div className="group bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col h-full">
        {/* Gradient Header */}
        <div className={`h-44 bg-gradient-to-br ${course.gradient} relative flex items-center justify-center p-6`}>
          <h3 className="text-white text-xl font-bold text-center drop-shadow-lg leading-tight">
            {course.title}
          </h3>
          {purchased && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Adquirido
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
            {course.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.lessonsCount} lecciones
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Signal className="w-3.5 h-3.5" />
              {course.level}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${purchased ? "bg-green-500 w-[0%]" : "bg-slate-600 w-0"}`}
              />
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {purchased ? "0% completado" : "No adquirido"}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div>
              <span className="text-2xl font-bold text-white">${course.price}</span>
              <span className="text-slate-500 text-sm ml-1">USD</span>
            </div>

            {purchased ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white pointer-events-none"
                size="sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Comprado
              </Button>
            ) : (
              <Button
                className="bg-cyan-600 group-hover:bg-cyan-700 text-white"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Curso
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
