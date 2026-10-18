"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BAND_LABEL, type Band } from "@/lib/assessment/dimensions";

/**
 * The deliverable, floated over the hero photograph.
 *
 * People buy what they can picture. "A readiness map" is an abstraction until
 * someone sees one, so the first screen shows its shape: eight dimensions,
 * named bands, no aggregate score. It is labelled as a sample everywhere it
 * appears, because there is no real client behind it.
 */

const AXES = [
  "Intent",
  "Availability",
  "Patterns",
  "Presence",
  "Realism",
  "Stability",
  "Values",
  "Openness",
] as const;

const BAND_LEVEL: Record<Band, number> = {
  not_yet: 0.34,
  emerging: 0.56,
  workable: 0.78,
  ready: 0.96,
};

/* Three illustrative readings. Each has one clear first priority, which is
   what a real map leads with. */
const SAMPLES: { bands: Band[]; focus: number; note: string }[] = [
  {
    bands: ["workable", "emerging", "not_yet", "workable", "emerging", "ready", "ready", "workable"],
    focus: 2,
    note: "A pattern repeats after month three. Work on it before the next introduction.",
  },
  {
    bands: ["not_yet", "ready", "workable", "emerging", "workable", "ready", "workable", "ready"],
    focus: 0,
    note: "Ready in most ways, but no shape or timeline yet. Decide that first.",
  },
  {
    bands: ["ready", "workable", "workable", "not_yet", "workable", "workable", "ready", "emerging"],
    focus: 3,
    note: "The story you tell undersells you. Rewrite how you come across.",
  },
];

const SIZE = 220;
const CENTRE = SIZE / 2;
const RADIUS = 68;

function point(index: number, level: number) {
  const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
  return [CENTRE + Math.cos(angle) * RADIUS * level, CENTRE + Math.sin(angle) * RADIUS * level] as const;
}

function shape(bands: Band[]) {
  return (
    bands
      .map((band, i) => {
        const [x, y] = point(i, BAND_LEVEL[band]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

export function HeroReading() {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const sample = SAMPLES[index];

  React.useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % SAMPLES.length), 4200);
    return () => window.clearInterval(timer);
  }, [reduce]);

  const [fx, fy] = point(sample.focus, BAND_LEVEL[sample.bands[sample.focus]]);

  return (
    <figure
      className="glass w-[min(19rem,100%)] rounded-[26px] p-5"
      aria-label="A sample readiness map, for illustration only"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="engraved text-rose">Sample readiness map</p>
        <span className="engraved rounded-full border border-onink/15 px-2.5 py-1 text-[9px] text-onink-faint">
          Illustrative
        </span>
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto mt-2 block w-full max-w-[15rem]" aria-hidden>
        <defs>
          <radialGradient id="reading-fill" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#e07a9e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#9c2f59" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        {(Object.keys(BAND_LEVEL) as Band[]).map((band) => (
          <path
            key={band}
            d={shape(Array<Band>(AXES.length).fill(band))}
            fill="none"
            stroke="rgba(246,247,250,0.09)"
          />
        ))}
        {AXES.map((axis, i) => {
          const [x, y] = point(i, 1);
          const [lx, ly] = point(i, 1.3);
          return (
            <g key={axis}>
              <line x1={CENTRE} y1={CENTRE} x2={x} y2={y} stroke="rgba(246,247,250,0.07)" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8.5"
                letterSpacing="0.6"
                fill={i === sample.focus ? "#e07a9e" : "rgba(246,247,250,0.5)"}
                style={{ transition: "fill 600ms ease", textTransform: "uppercase" }}
              >
                {axis}
              </text>
            </g>
          );
        })}
        <motion.path
          initial={false}
          animate={{ d: shape(sample.bands) }}
          transition={{ duration: reduce ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          fill="url(#reading-fill)"
          stroke="#f1c3d4"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <motion.circle
          initial={false}
          animate={{ cx: fx, cy: fy }}
          transition={{ duration: reduce ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          r="4.5"
          fill="#fff"
          stroke="#e07a9e"
          strokeWidth="2"
        />
      </svg>

      <div className="mt-1 min-h-[5.5rem] border-t border-onink/10 pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[12px] font-semibold text-onink">
              First priority · {AXES[sample.focus]}
              <span className="ml-2 font-normal text-onink-faint">
                {BAND_LABEL[sample.bands[sample.focus]]}
              </span>
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-onink-dim">{sample.note}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </figure>
  );
}
