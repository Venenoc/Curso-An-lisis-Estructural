"use client";

import TouchCarousel from "@/components/ui/touch-carousel";
import CourseCard from "@/components/courses/CourseCard";
import { Award } from "lucide-react";
import type { CatalogCourse } from "@/data/courses-catalog";

interface Props {
  courses: CatalogCourse[];
  purchasedSlugs: string[];
  progressMap: Record<string, number>;
}

export default function CursosCarouselWrapper({ courses, purchasedSlugs, progressMap }: Props) {
  return (
    <TouchCarousel slideClass="w-[80vw]">
      {courses.map((course) => {
        if (course.isDraft) {
          return (
            <div key={course.slug} className="relative bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden min-h-[320px]">
              <CourseCard course={course} purchased={false} isAuthenticated={true} variant="platform" />
              <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-700/80 flex items-center justify-center">
                  <Award className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-white text-base font-bold text-center px-4">En Desarrollo</span>
                <span className="text-slate-400 text-xs text-center px-6">Este curso estará disponible próximamente</span>
              </div>
            </div>
          );
        }
        return (
          <div key={course.slug} className="bg-slate-800/80 rounded-xl">
            <CourseCard
              course={course}
              purchased={purchasedSlugs.includes(course.slug)}
              isAuthenticated={true}
              variant="platform"
              progress={progressMap[course.slug] ?? 0}
            />
          </div>
        );
      })}
    </TouchCarousel>
  );
}
