"use client";

import { useRef, useState, useCallback } from "react";

interface TouchCarouselProps {
  children: React.ReactNode[];
  /** Class applied to each slide wrapper on mobile */
  slideClass?: string;
}

export default function TouchCarousel({ children, slideClass = "w-[85vw]" }: TouchCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = children.length;

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActive(Math.min(idx, count - 1));
  }, [count]);

  return (
    <div className="sm:hidden">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children.map((child, i) => (
          <div key={i} className={`snap-center shrink-0 ${slideClass}`}>
            {child}
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="block rounded-full transition-all duration-300"
            style={{
              width: active === i ? 20 : 6,
              height: 6,
              background: active === i ? "#22d3ee" : "rgba(110,189,233,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
