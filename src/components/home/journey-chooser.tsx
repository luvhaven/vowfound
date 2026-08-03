"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Rings } from "@/components/ui/ornament";
import { cn } from "@/lib/utils";

const PATHS = [
  {
    id: "clarity",
    prompt: "I want an honest view of where I stand.",
    service: "Readiness assessment",
    title: "Start with clarity, not guesswork.",
    body: "In twelve private minutes, you get a structured view of what is helping, what is getting in the way, and what to do first.",
    outcomes: [
      "Eight dimensions of readiness",
      "One priority to address first",
      "A recommended way forward",
    ],
    href: "/assessment",
    cta: "Begin your plan",
  },
  {
    id: "patterns",
    prompt: "I keep repeating the same relationship pattern.",
    service: "Private coaching",
    title: "Name the pattern. Change the choice.",
    body: "Work privately with someone who can identify the blind spots your friends avoid and turn them into practical changes.",
    outcomes: [
      "Direct, humane feedback",
      "Specific work between sessions",
      "A clearer way to choose",
    ],
    href: "/coaching",
    cta: "Explore coaching",
  },
  {
    id: "meeting",
    prompt: "I am ready, but my dating pool is not.",
    service: "Curated matchmaking",
    title: "Meet fewer people for better reasons.",
    body: "Every shortlist is reviewed by a person, every introduction has a reason, and nothing is shared without mutual consent.",
    outcomes: [
      "A pool filtered for intent",
      "Human-reviewed introductions",
      "Privacy before every yes",
    ],
    href: "/matchmaking",
    cta: "Explore matchmaking",
  },
] as const;

export function JourneyChooser() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = React.useState<(typeof PATHS)[number]["id"]>(
    "clarity",
  );
  const active = PATHS.find((path) => path.id === activeId) ?? PATHS[0];

  return (
    <div className="journey-chooser grid overflow-hidden rounded-[24px] border border-hairline lg:grid-cols-[0.86fr_1.14fr]">
      <div className="bg-ink-deep p-5 md:p-8 lg:p-10">
        <p className="text-sm font-medium text-onink-dim">
          Choose the sentence that feels closest.
        </p>
        <div className="mt-6 grid gap-2" aria-label="Choose your starting point">
          {PATHS.map((path) => {
            const selected = path.id === activeId;
            return (
              <button
                key={path.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(path.id)}
                className={cn(
                  "group rounded-[12px] border px-5 py-5 text-left transition-[color,background-color,border-color,transform] duration-300 active:scale-[0.99]",
                  selected
                    ? "border-rose/45 bg-onink/[0.07] text-onink"
                    : "border-transparent text-onink-dim hover:border-onink/10 hover:bg-onink/[0.04] hover:text-onink",
                )}
              >
                <span className="display block text-[1.2rem] leading-snug md:text-[1.35rem]">
                  {path.prompt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex min-h-[31rem] items-center overflow-hidden bg-ink-raised p-7 md:p-12 lg:p-14">
        <Rings
          size={180}
          className="pointer-events-none absolute -right-10 -top-4 opacity-[0.12]"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-rose">{active.service}</p>
            <h3 className="display-lg mt-4 max-w-2xl text-onink">
              {active.title}
            </h3>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-onink-dim md:text-[17px]">
              {active.body}
            </p>
            <ul className="mt-8 grid gap-3 border-t border-hairline pt-6 sm:grid-cols-3 sm:gap-5">
              {active.outcomes.map((outcome) => (
                <li key={outcome} className="text-sm leading-relaxed text-onink-dim">
                  {outcome}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <Button asChild size="lg">
                <Link href={active.href}>{active.cta}</Link>
              </Button>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
