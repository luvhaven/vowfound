"use client";

import * as React from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Button } from "@/components/ui/button";
import { VowMark } from "@/components/ui/ornament";

export function StickyCta() {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Clears out well before the final conversion block so it never competes
    // with the real CTA, and never sits over the footer.
    const shouldShow = progress > 0.22 && progress < 0.78;
    setVisible((current) =>
      current === shouldShow ? current : shouldShow,
    );
  });

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 20 }}
          transition={{
            duration: reduce ? 0 : 0.34,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="sticky-conversion-wrap no-print pointer-events-none fixed inset-x-0 bottom-0 z-40"
        >
          <div className="mx-auto mb-3 w-[min(48rem,calc(100%-1.25rem))] md:mb-5">
            <div className="sticky-conversion foil-edge pointer-events-auto grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[24px] bg-ink-raised/[0.96] px-3 py-3 shadow-[0_24px_70px_rgba(7,5,9,0.42)] backdrop-blur-xl sm:gap-4 sm:px-4">
              <VowMark size={40} className="hidden sm:block" />
              <div className="min-w-0">
                <p className="engraved whitespace-nowrap text-[9px] text-rose sm:hidden">Private map</p>
                <p className="hidden text-sm font-semibold text-onink sm:block">
                  Your readiness map takes twelve minutes.
                </p>
                <p className="mt-0.5 hidden truncate text-[13px] text-onink-dim md:block">
                  Private, practical, and free to begin.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button asChild size="sm">
                  <Link href="/assessment">Begin your plan</Link>
                </Button>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  aria-label="Hide this prompt"
                  className="group flex size-9 items-center justify-center rounded-[8px] border border-onink/10 text-onink-faint transition-colors hover:border-onink/25 hover:text-onink"
                >
                  <span aria-hidden className="relative block size-3.5">
                    <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
                    <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
