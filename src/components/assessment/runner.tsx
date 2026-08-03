"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import {
  orderedQuestions,
  type Question,
} from "@/lib/assessment/questions";
import { isTimelineValue } from "@/lib/timeline";
import { saveProgress, completeAssessment } from "@/app/actions/assessment";

const STORAGE_KEY = "vf.assessment.v1";
const RESULT_KEY = "vf.readiness.v1";

type Answers = Record<string, string | number | string[]>;

interface Saved {
  answers: Answers;
  step: number;
  deferTimeline: boolean;
}

function load(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function persist(saved: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Private browsing with storage disabled. The server copy still applies.
  }
}

export function AssessmentRunner({
  initialTimeline,
}: {
  initialTimeline?: string;
}) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [answers, setAnswers] = React.useState<Answers>({});
  const [step, setStep] = React.useState(0);
  const [deferTimeline, setDeferTimeline] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [resumed, setResumed] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  /* --- resume ------------------------------------------------------------
     localStorage cannot be read during render without a hydration mismatch,
     so the saved run is loaded once on mount and seeds mutable state. This is
     a genuine external-system read, not derived state. */
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const saved = load();
    const savedAnswersAreUsable =
      saved?.answers !== null &&
      typeof saved?.answers === "object" &&
      !Array.isArray(saved.answers);

    if (saved && savedAnswersAreUsable) {
      const savedDeferTimeline = Boolean(saved.deferTimeline);
      const savedTotal = orderedQuestions(savedDeferTimeline).length;
      const savedStepIsValid =
        Number.isInteger(saved.step) &&
        saved.step >= 0 &&
        saved.step < savedTotal;
      const hasAnswers = Object.keys(saved.answers).length > 0;

      if (hasAnswers && savedStepIsValid) {
        setAnswers(saved.answers);
        setStep(saved.step);
        setDeferTimeline(savedDeferTimeline);
        setResumed(true);
        setReady(true);
        return;
      }

      if (Number.isInteger(saved.step) && saved.step >= savedTotal) {
        try {
          if (window.localStorage.getItem(RESULT_KEY)) {
            setReady(true);
            router.replace("/assessment/results");
            return;
          }
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Storage can be unavailable. A fresh in-memory run still works.
        }
      } else {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Storage can be unavailable. A fresh in-memory run still works.
        }
      }
    }

    if (initialTimeline && isTimelineValue(initialTimeline)) {
      // The hero choice persists into the assessment as the first answer.
      if (initialTimeline === "undecided") {
        setDeferTimeline(true);
      } else {
        setAnswers({ timeline: initialTimeline });
        setStep(1);
      }
    }
    setReady(true);
    // The App Router instance is stable. Keeping this dependency list tied to
    // the actual input also avoids restarting recovery during router updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTimeline]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const questions = React.useMemo(
    () => orderedQuestions(deferTimeline),
    [deferTimeline],
  );
  const question = questions[step];
  const total = questions.length;

  React.useEffect(() => {
    if (ready) headingRef.current?.focus();
  }, [step, ready]);

  function setAnswer(key: string, value: string | number | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validate(q: Question, value: unknown): string | null {
    if (q.optional) return null;
    if (value === undefined || value === null || value === "") {
      return "Choose an answer before continuing.";
    }
    if (q.type === "multi") {
      const list = Array.isArray(value) ? value : [];
      if (q.maxChoices && list.length !== q.maxChoices) {
        return `Choose exactly ${q.maxChoices}. You have chosen ${list.length}.`;
      }
      if (list.length === 0) return "Choose at least one.";
    }
    if (q.type === "email") {
      const email = String(value);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "That email address does not look right. Check for a missing dot or an extra space.";
      }
    }
    if (q.type === "longtext" && String(value).trim().length < 3) {
      return "A few words is enough, but we do need a few.";
    }
    return null;
  }

  async function next() {
    if (!question) return;
    const problem = validate(question, answers[question.key]);
    if (problem) {
      setError(problem);
      return;
    }

    const nextStep = step + 1;
    persist({ answers, step: nextStep, deferTimeline });
    void saveProgress({ step: nextStep, answers });

    if (nextStep >= total) {
      setSubmitting(true);
      const result = await completeAssessment({ step: nextStep, answers });
      if (!result.ok) {
        setSubmitting(false);
        setError("Something went wrong saving that. Try once more.");
        return;
      }
      try {
        window.localStorage.setItem(RESULT_KEY, JSON.stringify(result.map));
      } catch {
        // Falls through to the results page, which handles a missing copy.
      }
      router.push("/assessment/results");
      return;
    }

    setStep(nextStep);
  }

  function back() {
    if (step === 0) return;
    const prev = step - 1;
    setStep(prev);
    setError(null);
    persist({ answers, step: prev, deferTimeline });
  }

  function onKeyDown(event: React.KeyboardEvent) {
    // Enter advances, except inside a textarea where it should make a line.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      (event.target as HTMLElement).tagName !== "TEXTAREA"
    ) {
      event.preventDefault();
      void next();
    }
  }

  if (!ready) {
    return (
      <div className="min-h-[60vh]" aria-busy="true">
        <span className="sr-only">Loading your assessment</span>
      </div>
    );
  }

  if (!question) {
    return (
      <div
        className="mx-auto grid min-h-[55vh] w-full max-w-xl place-items-center text-center"
        aria-busy="true"
      >
        <div>
          <p className="engraved text-rose">Assessment complete</p>
          <p className="display-md mt-4 text-onink">
            Opening your readiness map.
          </p>
        </div>
      </div>
    );
  }

  const progress = total > 0 ? step / total : 0;

  return (
    <div className="mx-auto w-full max-w-xl" onKeyDown={onKeyDown}>
      {/* Progress is a hairline rule that fills. No percentage, no step count. */}
      <div className="mb-10">
        <div
          className="h-px w-full bg-hairline"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step}
          aria-label="Assessment progress"
        >
          <div
            className="h-px transition-[width] duration-500 ease-out"
            style={{
              width: `${Math.max(progress * 100, 2)}%`,
              background: "var(--foil)",
            }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="engraved text-onink-faint">{question.section}</p>
          {resumed && step > 0 && (
            <p className="engraved text-onink-faint">Resumed where you left off</p>
          )}
        </div>
      </div>

      <Paper className="px-6 py-9 md:px-10 md:py-12">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="display-md text-ink outline-none"
        >
          {question.prompt}
        </h1>

        {question.help && (
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            {question.help}
          </p>
        )}

        <div className="mt-8">
          <QuestionField
            question={question}
            value={answers[question.key]}
            onChange={(v) => setAnswer(question.key, v)}
            invalid={Boolean(error)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 border-l-2 border-oxblood pl-4 text-[15px] text-oxblood"
          >
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="engraved text-slate transition-colors hover:text-ink disabled:opacity-35"
          >
            Back
          </button>

          <Button type="button" onClick={next} disabled={submitting} size="md">
            {submitting
              ? "Reading your answers"
              : step + 1 >= total
                ? "See my readiness map"
                : "Continue"}
          </Button>
        </div>
      </Paper>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-[14px] text-onink-faint">
          Saved after every question. You can close this and come back.
        </p>
        <Link
          href="/privacy"
          className="engraved shrink-0 text-onink-faint underline decoration-onink-faint underline-offset-4 hover:text-onink"
        >
          What {BRAND} does with this
        </Link>
      </div>
    </div>
  );
}

/* --- fields --------------------------------------------------------------- */

function QuestionField({
  question,
  value,
  onChange,
  invalid,
}: {
  question: Question;
  value: string | number | string[] | undefined;
  onChange: (value: string | number | string[]) => void;
  invalid: boolean;
}) {
  if (question.type === "single") {
    return (
      <fieldset>
        <legend className="sr-only">{question.prompt}</legend>
        <div className="space-y-2">
          {question.choices?.map((choice) => {
            const checked = value === choice.value;
            return (
              <label
                key={choice.value}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-[8px] border px-5 py-4 transition-colors duration-150",
                  checked
                    ? "border-ink bg-ink text-stock"
                    : "border-stone bg-white text-ink hover:border-ink/50",
                )}
              >
                <input
                  type="radio"
                  name={question.key}
                  value={choice.value}
                  checked={checked}
                  onChange={() => onChange(choice.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "h-2 w-2 shrink-0 rotate-45 border",
                    checked ? "border-stock bg-stock" : "border-stone",
                  )}
                />
                <span className="text-[16px]">{choice.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (question.type === "multi") {
    const list = Array.isArray(value) ? value : [];
    const atLimit =
      question.maxChoices !== undefined && list.length >= question.maxChoices;

    return (
      <fieldset>
        <legend className="sr-only">{question.prompt}</legend>
        <div className="flex flex-wrap gap-2">
          {question.choices?.map((choice) => {
            const checked = list.includes(choice.value);
            const disabled = !checked && atLimit;
            return (
              <label
                key={choice.value}
                className={cn(
                  "cursor-pointer rounded-[8px] border px-4 py-3 text-[15px] transition-colors duration-150",
                  checked
                    ? "border-ink bg-ink text-stock"
                    : "border-stone bg-white text-ink hover:border-ink/50",
                  disabled && "cursor-not-allowed opacity-40 hover:border-stone",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() =>
                    onChange(
                      checked
                        ? list.filter((v) => v !== choice.value)
                        : [...list, choice.value],
                    )
                  }
                  className="sr-only"
                />
                {choice.label}
              </label>
            );
          })}
        </div>
        {question.maxChoices && (
          <p className="numeral engraved mt-5 text-slate">
            {list.length} of {question.maxChoices} chosen
          </p>
        )}
      </fieldset>
    );
  }

  if (question.type === "scale") {
    const { min, max, minLabel, maxLabel } = question.scale!;
    const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <fieldset>
        <legend className="sr-only">{question.prompt}</legend>
        <div className="flex gap-2">
          {options.map((n) => {
            const checked = value === n;
            return (
              <label
                key={n}
                className={cn(
                  "numeral flex flex-1 cursor-pointer items-center justify-center rounded-[8px] border py-5 text-[18px] transition-colors duration-150",
                  checked
                    ? "border-ink bg-ink text-stock"
                    : "border-stone bg-white text-ink hover:border-ink/50",
                )}
              >
                <input
                  type="radio"
                  name={question.key}
                  checked={checked}
                  onChange={() => onChange(n)}
                  className="sr-only"
                />
                {n}
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between">
          <span className="engraved text-slate">{minLabel}</span>
          <span className="engraved text-slate">{maxLabel}</span>
        </div>
      </fieldset>
    );
  }

  if (question.type === "longtext") {
    return (
      <>
        <label htmlFor={question.key} className="sr-only">
          {question.prompt}
        </label>
        <textarea
          id={question.key}
          className="field min-h-40 resize-y"
          value={typeof value === "string" ? value : ""}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
        />
      </>
    );
  }

  return (
    <>
      <label htmlFor={question.key} className="sr-only">
        {question.prompt}
      </label>
      <input
        id={question.key}
        type={question.type === "email" ? "email" : "text"}
        inputMode={question.type === "email" ? "email" : undefined}
        autoComplete={
          question.type === "email"
            ? "email"
            : question.key === "contact_name"
              ? "given-name"
              : "off"
        }
        className="field"
        value={typeof value === "string" ? value : ""}
        placeholder={question.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
      />
    </>
  );
}
