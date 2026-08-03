"use client";

import * as React from "react";
import Link from "next/link";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TIMELINE_OPTIONS,
  type TimelineValue,
  targetDate,
  daysUntil,
  monthYear,
} from "@/lib/timeline";
import { recordTimelineIntent } from "@/app/actions/timeline";
import { Rings } from "@/components/ui/ornament";

/* The one orchestrated sequence on the site. 900ms, three beats:
   1. the month typesets with a letterpress impression
   2. the day count resolves digit by digit
   3. one highlight sweeps across the foil hairline
   Under reduced motion all three land at once, with identical information. */
const BEAT_TYPESET = 0;
const BEAT_COUNT = 380;
const BEAT_SWEEP = 640;
const BEAT_CTA = 900;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

export function SaveTheDate() {
  const reduced = useReducedMotion();
  const [choice, setChoice] = React.useState<TimelineValue | null>(null);
  const [stage, setStage] = React.useState(0); // 0 none · 1 typeset · 2 count · 3 sweep · 4 cta
  const [runId, setRunId] = React.useState(0);

  const resolved = React.useMemo(() => {
    if (!choice) return null;
    const target = targetDate(choice);
    if (!target) return { undecided: true as const };
    const { month, year } = monthYear(target);
    return { undecided: false as const, month, year, days: daysUntil(target) };
  }, [choice]);

  function select(value: string) {
    const v = value as TimelineValue;
    setChoice(v);
    setRunId((n) => n + 1);
    // Reset here rather than in the effect: the sequence restarts because the
    // user chose again, which is an event, not a synchronised value.
    setStage(reduced ? 4 : 0);
    void recordTimelineIntent(v);
  }

  React.useEffect(() => {
    if (!choice || reduced) return;
    const timers = [
      window.setTimeout(() => setStage(1), BEAT_TYPESET + 16),
      window.setTimeout(() => setStage(2), BEAT_COUNT),
      window.setTimeout(() => setStage(3), BEAT_SWEEP),
      window.setTimeout(() => setStage(4), BEAT_CTA),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [choice, runId, reduced]);

  const href = choice
    ? `/assessment?timeline=${encodeURIComponent(choice)}`
    : "/assessment";

  return (
    <Paper
      className="foil-sweep w-full overflow-hidden shadow-[0_28px_80px_rgba(7,5,9,0.28)]"
      data-sweep={stage >= 3 ? "true" : undefined}
    >
      {/* ---- The impression ------------------------------------------- */}
      <div className="px-6 pt-7 pb-6 text-center md:px-12 md:pt-9 md:pb-7">
        <p className="engraved text-slate">Your marriage horizon</p>

        <div
          className="mt-5 flex min-h-[6.5rem] flex-col items-center justify-center md:min-h-[7.5rem]"
          aria-live="polite"
          aria-atomic="true"
        >
          {!resolved && (
            <>
              <Rings size={84} className="opacity-55" />
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-slate">
                The month you intend to be married by. We will work back from
                it.
              </p>
            </>
          )}

          {resolved?.undecided && (
            <div key={runId}>
              <p
                className={cn(
                  "display-lg text-ink",
                  stage >= 1 && !reduced && "letterpress",
                )}
              >
                A date we find together
              </p>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate">
                Deciding when is part of the work. We will come back to this
                question at the end, once you have more to go on.
              </p>
            </div>
          )}

          {resolved && !resolved.undecided && (
            <div key={runId} className="w-full">
              <p
                className={cn(
                  "display-lg text-ink",
                  stage >= 1 && !reduced && "letterpress",
                )}
              >
                {resolved.month}
              </p>
              <p
                className={cn(
                  "numeral engraved mt-3 text-slate",
                  stage >= 1 && !reduced && "letterpress",
                )}
                style={!reduced ? { animationDelay: "90ms" } : undefined}
              >
                {resolved.year}
              </p>
            </div>
          )}
        </div>

        {/* The foil hairline the sweep crosses. */}
        <div
          aria-hidden
          className="mx-auto mt-2 h-px w-full max-w-md"
          style={{
            background: "var(--foil)",
            backgroundSize: "220% 100%",
            backgroundPosition: stage >= 3 || reduced ? "100% 0" : "0% 0",
            transition: reduced
              ? undefined
              : "background-position 760ms var(--ease-press)",
            opacity: resolved ? 1 : 0.35,
          }}
        />

        <div className="mt-5 min-h-[1.5rem]">
          {resolved && !resolved.undecided && (
            <p className="engraved text-slate">
              <DayCount
                key={runId}
                value={resolved.days}
                active={stage >= 2}
                reduced={reduced}
              />{" "}
              days from today
            </p>
          )}
          {resolved?.undecided && (
            <p className="engraved text-slate">Timeline deferred</p>
          )}
          {!resolved && (
            <p className="engraved text-slate">Choose one below</p>
          )}
        </div>
      </div>

      {/* ---- The choices ----------------------------------------------- */}
      <div className="border-t border-stone bg-stock-warm/70 px-5 py-6 md:px-8">
        <div
          role="radiogroup"
          aria-label="When do you want to be married?"
          className="grid grid-cols-2 gap-2"
        >
          {TIMELINE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "engraved relative flex min-h-14 cursor-pointer items-center justify-center rounded-[12px] border px-4 py-3.5 text-center transition-[color,background-color,border-color,transform] duration-300 active:scale-[0.98]",
                choice === option.value
                  ? "border-ink bg-ink text-stock"
                  : "border-ink/20 bg-white/35 text-slate hover:border-ink/45 hover:bg-white/70 hover:text-ink",
                option.value === "undecided" && "col-span-2",
              )}
            >
              <input
                type="radio"
                name="marriage-timeline"
                value={option.value}
                checked={choice === option.value}
                onChange={() => select(option.value)}
                aria-label={option.label}
                className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[12px]"
              />
              <span className="pointer-events-none relative z-[1]">
                {option.label}
              </span>
            </label>
          ))}
        </div>

        <div
          className={cn(
            "grid transition-all duration-500",
            stage >= 4
              ? "mt-6 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col items-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={href} tabIndex={stage >= 4 ? 0 : -1}>
                  Begin your plan
                </Link>
              </Button>
              <p className="text-[14px] text-slate">
                Twelve minutes. No payment required to begin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
}

/** Resolves digit by digit, left to right. */
function DayCount({
  value,
  active,
  reduced,
}: {
  value: number;
  active: boolean;
  reduced: boolean;
}) {
  const digits = String(value).split("");
  if (reduced) {
    return (
      <span className="numeral text-ink">
        {value}
      </span>
    );
  }
  return (
    <span className="numeral text-ink">
      {digits.map((d, i) => (
        <span
          key={i}
          className={active ? "digit-roll" : undefined}
          style={
            active ? { animationDelay: `${i * 70}ms` } : { visibility: "hidden" }
          }
        >
          {d}
        </span>
      ))}
    </span>
  );
}
