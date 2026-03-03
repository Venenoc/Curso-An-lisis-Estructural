"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  scale = false,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, ...(scale && { scale: 0.98 }) }}
      whileInView={{ opacity: 1, y: 0, ...(scale && { scale: 1 }) }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
