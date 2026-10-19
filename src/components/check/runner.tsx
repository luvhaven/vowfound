"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DIMENSIONS, SCALE, STATEMENTS } from "@/lib/readiness";
import { HUE } from "@/components/art/shapes";
import { saveCheck } from "@/app/actions/check";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";

export const LOCAL_KEY = "vf.check.local";

/**
 * One statement per screen, one tap per answer. The tap advances, so the
 * whole check is eighteen taps and a name. Answers live in memory until the
 * last step; nothing is stored if the visitor leaves halfway.
 */
export function CheckRunner() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [step, setStep] = React.useState(0);
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const total = STATEMENTS.length;
  const atDetails = step >= total;
  const current = STATEMENTS[Math.min(step, total - 1)];
  const dim = DIMENSIONS.find((d) => d.key === current.dim)!;
  const fieldColour = atDetails ? HUE.butter : HUE[dim.colour];
  const onDark = !atDetails && (dim.colour === "cobalt" || dim.colour === "moss");

  function answer(value: number) {
    if (step === 0 && !answers[current.id]) track("check_start");
    setAnswers((a) => ({ ...a, [current.id]: value }));
    window.setTimeout(() => setStep((s) => s + 1), reduce ? 0 : 180);
  }

  function finish(skip: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await saveCheck({
        answers,
        firstName: skip ? undefined : firstName,
        email: skip ? undefined : email,
      });
      track("check_complete", { gave_email: !skip && Boolean(email) });
      if (result.ok) {
        router.push(`/results/${result.id}`);
        return;
      }
      if (result.error === "rate_limited") {
        setError("Too many checks from this connection. Try again in a little while.");
        return;
      }
      // Storage is unavailable: show the results anyway, from this browser.
      try {
        sessionStorage.setItem(LOCAL_KEY, JSON.stringify({ answers, firstName: skip ? "" : firstName }));
      } catch {}
      router.push("/results/here");
    });
  }

  return (
    <div
      className="min-h-[calc(100dvh-5.5rem)] transition-colors duration-500"
      style={{ background: fieldColour, color: onDark ? "#fff6e9" : "#1a1410" }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-3xl flex-col px-5 pb-10 pt-8 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="label">{atDetails ? "Last step" : `${dim.name} · ${step + 1} of ${total}`}</p>
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="label underline underline-offset-4">
              Back
            </button>
          )}
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full border-2 border-current">
          <div className="h-full bg-current transition-[width] duration-500" style={{ width: `${(Math.min(step, total) / total) * 100}%` }} />
        </div>

        <div className="flex flex-1 flex-col justify-center py-10" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {!atDetails ? (
              <motion.div
                key={current.id}
                initial={reduce ? false : { opacity: 0, y: 40, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -30, rotate: 2 }}
                transition={{ duration: 0.35, ease: [0.34, 1.3, 0.64, 1] }}
              >
                <h1 className="h2">“{current.text}”</h1>
                <div className="mt-10 grid grid-cols-5 gap-2 sm:gap-3" role="group" aria-label="How true is this of you?">
                  {SCALE.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => answer(s.value)}
                      aria-pressed={answers[current.id] === s.value}
                      className={cn(
                        "sticker flex aspect-square flex-col items-center justify-center gap-1 rounded-[20px] bg-paper p-1 text-ink shadow-[4px_4px_0_#1a1410] sm:aspect-auto sm:min-h-28",
                        answers[current.id] === s.value && "bg-ink text-paper",
                      )}
                    >
                      <span className="font-display text-2xl font-extrabold sm:text-4xl">{s.value}</span>
                      <span className="text-[10px] font-bold uppercase leading-tight tracking-wide sm:text-[12px]">{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="details"
                initial={reduce ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  finish(false);
                }}
              >
                <h1 className="h2">Done. Where should we send your results?</h1>
                <p className="mt-4 max-w-lg text-[18px] font-medium">
                  Optional. We&apos;ll email you a private link so you can come back to them. No newsletters unless you ask.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="label">First name</span>
                    <input className="field" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
                  </label>
                  <label className="grid gap-2">
                    <span className="label">Email</span>
                    <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </label>
                </div>
                {error && <p className="mt-4 font-bold" role="alert">{error}</p>}
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <button type="submit" className="btn btn-lg bg-tomato text-ink" disabled={pending}>
                    {pending ? "Reading your answers…" : "Show my results"}
                  </button>
                  <button type="button" onClick={() => finish(true)} disabled={pending} className="font-bold underline decoration-2 underline-offset-4">
                    Skip, just show me
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
