"use client";

import * as React from "react";
import { DIMENSIONS } from "@/lib/readiness";
import { HUE } from "@/components/art/shapes";
import { cn } from "@/lib/utils";

/* Illustrative values only, so the bars have something to show. */
const SAMPLE = [72, 48, 31, 66, 58, 80];

export function DimensionPeek() {
  const [active, setActive] = React.useState(2);
  const d = DIMENSIONS[active];

  return (
    <div className="sticker bg-paper p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="label">Sample results</p>
        <span className="label rounded-full border-2 border-ink px-2.5 py-1 text-[10px]">Illustration</span>
      </div>
      <ul className="mt-6 grid gap-3">
        {DIMENSIONS.map((dim, i) => (
          <li key={dim.key}>
            <button
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              aria-pressed={active === i}
              className={cn(
                "grid w-full grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors",
                active === i ? "bg-paper-deep" : "hover:bg-paper-deep/60",
              )}
            >
              <span className="text-[15px] font-bold">{dim.name}</span>
              <span className="h-5 overflow-hidden rounded-full border-2 border-ink bg-paper">
                <span
                  className="block h-full rounded-full border-r-2 border-ink transition-[width] duration-700"
                  style={{ width: `${SAMPLE[i]}%`, background: HUE[dim.colour] }}
                />
              </span>
              <span className="num text-right text-[14px] font-bold">{SAMPLE[i]}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-[18px] border-2 border-ink p-5" style={{ background: HUE[d.colour], color: d.colour === "cobalt" || d.colour === "moss" ? "#fff6e9" : "#1a1410" }}>
        <p className="label opacity-80">{d.name} asks</p>
        <p className="mt-2 text-[19px] font-bold leading-snug tracking-[-0.02em]">{d.question}</p>
        <p className="mt-3 text-[14px] font-medium leading-snug opacity-90">Your first move: {d.move}</p>
      </div>
    </div>
  );
}
