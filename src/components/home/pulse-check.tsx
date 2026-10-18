"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

/**
 * Three questions, sixty seconds, one honest signal.
 *
 * The full assessment is twelve minutes, which is a real ask from someone who
 * arrived thirty seconds ago. This is the step before it: small enough to
 * answer on impulse, specific enough to feel seen, and it ends by pointing at
 * the full assessment rather than pretending to replace it. Answers never
 * leave the browser; only the resulting path is counted.
 */

type Path = "audit" | "programme" | "match";

const QUESTIONS: {
  prompt: string;
  options: { label: string; path: Path }[];
}[] = [
  {
    prompt: "When you picture being married, how clear is the picture?",
    options: [
      { label: "Clear. I know what I want and roughly when.", path: "match" },
      { label: "An outline. The details keep shifting.", path: "programme" },
      { label: "Honestly, foggy. I just know I want it.", path: "audit" },
    ],
  },
  {
    prompt: "Your last few relationships ended for…",
    options: [
      { label: "Different reasons each time. Bad luck, mostly.", path: "match" },
      { label: "A reason I am starting to recognise.", path: "programme" },
      { label: "I have not been in many serious ones.", path: "audit" },
    ],
  },
  {
    prompt: "If the right person appeared next month, would your life have room?",
    options: [
      { label: "Yes. I have made space for this.", path: "match" },
      { label: "I would make room.", path: "programme" },
      { label: "Not really, if I am honest.", path: "audit" },
    ],
  },
];

const READINGS: Record<Path, { title: string; body: string; plan: string; planHref: string }> = {
  audit: {
    title: "Start with clarity, not introductions.",
    body: "Your answers suggest the next useful step is a clear picture of what you want and what is in the way. Meeting people before that tends to repeat what has already happened.",
    plan: "The Clarity Audit",
    planHref: "/plans#clarity-audit",
  },
  programme: {
    title: "There is a pattern worth working on first.",
    body: "You are close. Something specific keeps recurring, and it is far cheaper to understand it now than at month nine of the right relationship.",
    plan: "Ready in 90",
    planHref: "/plans#ready-in-90",
  },
  match: {
    title: "You sound ready to meet people deliberately.",
    body: "Clear intent, room in your life, no obvious repeating pattern. The full assessment will check that against eight dimensions before anyone is introduced.",
    plan: "VowFound Match",
    planHref: "/plans#match",
  },
};

export function PulseCheck() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = React.useState<Path[]>([]);
  const step = answers.length;
  const done = step === QUESTIONS.length;

  const result = React.useMemo<Path | null>(() => {
    if (!done) return null;
    const tally: Record<Path, number> = { audit: 0, programme: 0, match: 0 };
    answers.forEach((a) => (tally[a] += 1));
    // Room in your life is the gate: without it, introductions are premature.
    if (answers[2] === "audit") return "audit";
    if (tally.match >= 2) return "match";
    if (tally.audit >= 2) return "audit";
    return "programme";
  }, [answers, done]);

  React.useEffect(() => {
    if (result) trackEvent("pulse_complete", { path: result });
  }, [result]);

  function choose(path: Path) {
    if (step === 0) trackEvent("pulse_start");
    setAnswers((prev) => [...prev, path]);
  }

  const motionProps = {
    initial: reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduce ? undefined : { opacity: 0, y: -12, filter: "blur(6px)" },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div className="glass relative overflow-hidden rounded-[32px] p-6 sm:p-8 md:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="engraved text-rose">The 60-second pulse</p>
        <div className="flex items-center gap-1.5" aria-hidden>
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i < step ? "w-8 bg-rose" : i === step ? "w-8 bg-onink/40" : "w-4 bg-onink/15",
              )}
            />
          ))}
        </div>
      </div>

      <div className="relative mt-8 min-h-[22rem] sm:min-h-[19rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {!done ? (
            <motion.fieldset key={step} {...motionProps}>
              <legend className="display-md max-w-xl text-onink">
                <span className="numeral mr-3 text-[0.6em] text-onink-faint">
                  {step + 1}/{QUESTIONS.length}
                </span>
                {QUESTIONS[step].prompt}
              </legend>
              <div className="mt-7 grid gap-3">
                {QUESTIONS[step].options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => choose(option.path)}
                    className="pulse-option px-5 py-4 text-[15px] text-onink-dim hover:text-onink"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setAnswers((prev) => prev.slice(0, -1))}
                  className="mt-5 text-[13px] text-onink-faint underline underline-offset-4 hover:text-onink"
                >
                  Back
                </button>
              )}
            </motion.fieldset>
          ) : (
            result && (
              <motion.div key="result" {...motionProps}>
                <p className="engraved text-onink-faint">Your signal</p>
                <h3 className="display-lg mt-4 max-w-xl text-onink">{READINGS[result].title}</h3>
                <p className="mt-5 max-w-xl text-onink-dim">{READINGS[result].body}</p>
                <p className="mt-5 text-[14px] text-onink-faint">
                  A likely starting point:{" "}
                  <Link href={READINGS[result].planHref} className="text-rose underline underline-offset-4">
                    {READINGS[result].plan}
                  </Link>
                  . The full assessment confirms it, or tells you otherwise.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Button asChild size="lg">
                    <Link
                      href="/assessment"
                      data-analytics-event="cta_click"
                      data-analytics-label={`pulse_${result}`}
                      data-analytics-placement="pulse"
                    >
                      Get my full readiness map, free
                    </Link>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setAnswers([])}
                    className="text-[13px] text-onink-faint underline underline-offset-4 hover:text-onink"
                  >
                    Start again
                  </button>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      <p className="mt-6 border-t border-hairline pt-5 text-[12px] leading-relaxed text-onink-faint">
        A signal, not a diagnosis. Your answers stay in this browser.
      </p>
    </div>
  );
}
