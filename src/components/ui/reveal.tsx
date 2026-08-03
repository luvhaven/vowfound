"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionElement = as === "li" ? motion.li : motion.div;

  return (
    <MotionElement
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: reduce ? 0 : 0.68,
        delay: reduce ? 0 : delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("motion-reveal", className)}
    >
      {children}
    </MotionElement>
  );
}
