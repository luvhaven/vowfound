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

  return (
    <div className={cn("mt-4", className)}>
      {showMeter && started && (
        <div className="mb-4">
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

      <p className="engraved text-slate">
        Your password needs
        {started && (
          <span className="numeral ml-2 text-slate/80">
            {met} of {rules.length}
          </span>
        )}
      </p>

      {/* One live region for the whole list: announcing each tick separately
          would talk over someone still typing. */}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-live="polite">
        {rules.map((rule) => (
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
      </ul>

      {ok && (
        <p className="engraved mt-4 text-sage-ink">
          That will do nicely.
        </p>
      )}
    </div>
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
