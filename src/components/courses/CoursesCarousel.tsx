"use client";

import TouchCarousel from "@/components/ui/touch-carousel";

interface CoursesCarouselProps {
  children: React.ReactNode[];
}

export default function CoursesCarousel({ children }: CoursesCarouselProps) {
  return (
    <>
      {/* Mobile: touch carousel */}
      <TouchCarousel slideClass="w-[80vw]">
        {children}
      </TouchCarousel>
      {/* Desktop/tablet: grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </>
  );
}
