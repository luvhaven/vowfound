"use client";

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export interface StoryStage {
  name: string;
  summary: string;
  body: string;
  outputs: readonly string[];
}

/**
 * The method, told as you scroll.
 *
 * The order of the stages is the argument — readiness before introductions —
 * so the left column holds the stage number still while the right column
 * moves through the work. On a narrow screen it collapses to a plain list.
 */
export function MethodStory({ stages }: { stages: readonly StoryStage[] }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div className="hidden lg:block">
        <div className="sticky top-32">
          <div className="relative h-[10.5rem] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={active}
                className="chapter-num absolute bottom-2"
                initial={reduce ? false : { y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                0{active + 1}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="display-md mt-6 text-onink">{stages[active].name}</p>
          <div className="mt-10 flex gap-5">
            <div className="relative w-px bg-hairline">
              <motion.div
                className="absolute inset-x-0 top-0 origin-top bg-rose"
                style={{ height: "100%", scaleY: progress }}
              />
            </div>
            <ol className="grid gap-4">
              {stages.map((stage, i) => (
                <li
                  key={stage.name}
                  className={cn(
                    "text-[14px] transition-colors duration-500",
                    i === active ? "text-onink" : i < active ? "text-onink-dim" : "text-onink-faint",
                  )}
                >
                  {stage.name}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <ol className="grid gap-6 lg:gap-[22vh] lg:py-[8vh]">
        {stages.map((stage, i) => (
          <Stage key={stage.name} stage={stage} index={i} onActive={setActive} />
        ))}
      </ol>
    </div>
  );
}

function Stage({
  stage,
  index,
  onActive,
}: {
  stage: StoryStage;
  index: number;
  onActive: (index: number) => void;
}) {
  const ref = React.useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  React.useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li
      ref={ref}
      className={cn(
        "rounded-[28px] border p-7 transition-[border-color,background-color,opacity] duration-700 md:p-10",
        inView
          ? "border-onink/15 bg-onink/[0.035]"
          : "border-hairline bg-transparent lg:opacity-55",
      )}
    >
      <p className="engraved text-rose">
        Stage {index + 1} <span className="text-onink-faint lg:hidden">· {stage.name}</span>
      </p>
      <h3 className="display-md mt-4 text-onink">{stage.summary}</h3>
      <p className="mt-5 text-[16px] leading-relaxed text-onink-dim">{stage.body}</p>
      <ul className="mt-7 grid gap-3 border-t border-hairline pt-6">
        {stage.outputs.map((output) => (
          <li key={output} className="flex gap-3 text-[14px] text-onink">
            <span className="tick" aria-hidden>
              <svg viewBox="0 0 12 12" className="size-2.5">
                <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {output}
          </li>
        ))}
      </ul>
    </li>
  );
}
