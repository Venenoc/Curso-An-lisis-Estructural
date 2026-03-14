"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export function CountUp({ target, suffix }: { target: number | null; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || target === null) return;
    const duration = 1400;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      const eased = Math.round(target * (1 - Math.pow(1 - current / steps, 3)));
      setCount(eased);
      if (current >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {target === null ? (suffix ?? "") : `${count}${suffix ?? ""}`}
    </span>
  );
}
