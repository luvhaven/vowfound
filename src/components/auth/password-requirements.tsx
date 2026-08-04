"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  evaluatePassword,
  SCORE_LABEL,
} from "@/lib/auth/password";

/**
 * The rules, stated before anything is typed and ticked off as each is met.
 *
 * Showing only failures means the requirements arrive one at a time, and the
 * person cannot see how much is left. A checklist that is visible from the
 * start turns the same information into something you can work through.
 *
 * `tone` matches the surface: the account form sits on a paper card, the
 * auth forms sit on paper too, but the admin uses the dark field.
 */
export function PasswordRequirements({
  value,
  showMeter = true,
  className,
}: {
  value: string;
  showMeter?: boolean;
  className?: string;
}) {
  const { rules, score, ok } = React.useMemo(
    () => evaluatePassword(value),
    [value],
  );

  const met = rules.filter((r) => r.met === true).length;
  const started = value.length > 0;
  const essentialRules = rules.slice(0, 5);
  const safetyRules = rules.slice(5);
  const safetyMet = started ? safetyRules.every((rule) => rule.met) : null;

  return (
    <details open={started || undefined} className={cn("mt-3 rounded-[10px] border border-stone/80 bg-white/25 px-4 py-3", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
        <span className="engraved text-slate">Password requirements</span>
        <span className="numeral text-[11px] text-slate/80">
          {started ? `${met} of ${rules.length}` : "View rules"}
        </span>
      </summary>
      <div className="mt-3 border-t border-stone/70 pt-3">
      {showMeter && started && (
        <div className="mb-3">
          <div className="flex gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i < score
                    ? score <= 1
                      ? "bg-oxblood"
                      : score === 2
                        ? "bg-stone"
                        : "bg-sage-ink"
                    : "bg-stone/45",
                )}
              />
            ))}
          </div>
          <p className="engraved mt-2.5 text-slate">{SCORE_LABEL[score]}</p>
        </div>
      )}

      {/* One live region for the whole list: announcing each tick separately
          would talk over someone still typing. */}
      <ul className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2" aria-live="polite">
        {essentialRules.map((rule) => (
          <li
            key={rule.id}
            className={cn(
              "flex items-start gap-2.5 text-[14px] leading-snug transition-colors duration-200",
              // Done recedes, outstanding stays legible.
              rule.met === true ? "text-sage-ink/75" : "text-slate",
            )}
          >
            <Mark met={rule.met} />
            <span>{rule.label}</span>
          </li>
        ))}
        <li className={cn(
          "flex items-start gap-2.5 text-[14px] leading-snug sm:col-span-2",
          safetyMet === true ? "text-sage-ink/75" : "text-slate",
        )}>
          <Mark met={safetyMet} />
          <span>No common phrases, sequences, or repeated characters</span>
        </li>
      </ul>

      {started && safetyMet === false && (
        <p className="mt-2 text-[12px] leading-relaxed text-oxblood">
          {safetyRules.filter((rule) => rule.met === false).map((rule) => rule.label).join(" · ")}
        </p>
      )}

      {ok && (
        <p className="engraved mt-3 text-sage-ink">
          That will do nicely.
        </p>
      )}
      </div>
    </details>
  );
}

/** Never colour alone: the shape changes too, so the state survives a
 *  monochrome screen and colour blindness. */
function Mark({ met }: { met: boolean | null }) {
  if (met === true) {
    return (
      <svg
        viewBox="0 0 16 16"
        className="mt-[0.15em] size-3.5 shrink-0 text-sage-ink"
        aria-hidden
      >
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "mt-[0.42em] size-1.5 shrink-0 rounded-full",
        met === false ? "bg-oxblood/70" : "bg-stone",
      )}
    />
  );
}
