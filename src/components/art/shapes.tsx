import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The VowFound art system. Flat shapes, hard ink lines, no gradients and no
 * people: two forms finding their overlap is the whole idea, so the brand
 * draws it rather than borrowing anyone's face.
 */

type ArtProps = React.SVGProps<SVGSVGElement> & { className?: string };

const C = {
  ink: "#1a1410",
  paper: "#fff6e9",
  tomato: "#ff4f2b",
  cobalt: "#2b3bff",
  butter: "#ffd84d",
  bubble: "#ff9ec4",
  moss: "#1e6b4a",
  lilac: "#b9a7ff",
} as const;

export type Hue = keyof typeof C;
export const HUE = C;

/** The mark: two circles and the lens where they meet. */
export function Mark({ className, size = 36, ...props }: ArtProps & { size?: number }) {
  return (
    <svg viewBox="0 0 48 32" width={(size * 48) / 32} height={size} className={className} aria-hidden {...props}>
      <defs>
        <clipPath id="vf-mark-left">
          <circle cx="16" cy="16" r="13" />
        </clipPath>
      </defs>
      <circle cx="16" cy="16" r="13" fill={C.tomato} stroke={C.ink} strokeWidth="2.5" />
      <circle cx="32" cy="16" r="13" fill={C.cobalt} stroke={C.ink} strokeWidth="2.5" />
      <circle cx="32" cy="16" r="13" fill={C.butter} clipPath="url(#vf-mark-left)" />
      <path d="M24 5.6a13 13 0 0 1 0 20.8M24 5.6a13 13 0 0 0 0 20.8" fill="none" stroke={C.ink} strokeWidth="2.5" />
    </svg>
  );
}

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark size={30} />
      <span
        className={cn("font-display text-[1.6rem] font-extrabold leading-none tracking-[-0.06em]", onDark ? "text-paper" : "text-ink")}
      >
        vowfound
      </span>
    </span>
  );
}

/** The big overlap: two forms, a lens, and the seam between them. */
export function Overlap({ a = "tomato", b = "cobalt", lens = "butter", className, ...props }: ArtProps & { a?: Hue; b?: Hue; lens?: Hue }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 280" className={className} aria-hidden {...props}>
      <defs>
        <clipPath id={`${id}-l`}>
          <circle cx="140" cy="140" r="120" />
        </clipPath>
      </defs>
      <circle cx="140" cy="140" r="120" fill={C[a]} stroke={C.ink} strokeWidth="4" />
      <circle cx="260" cy="140" r="120" fill={C[b]} stroke={C.ink} strokeWidth="4" />
      <circle cx="260" cy="140" r="120" fill={C[lens]} clipPath={`url(#${id}-l)`} />
      <circle cx="140" cy="140" r="120" fill="none" stroke={C.ink} strokeWidth="4" />
      <circle cx="260" cy="140" r="120" fill="none" stroke={C.ink} strokeWidth="4" />
    </svg>
  );
}

/** An arch: a doorway, an altar, a threshold. */
export function Arch({ fill = "bubble", className, ...props }: ArtProps & { fill?: Hue }) {
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden {...props}>
      <path d="M10 255V100a90 90 0 0 1 180 0v155Z" fill={C[fill]} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M50 255V110a50 50 0 0 1 100 0v145" fill="none" stroke={C.ink} strokeWidth="4" />
    </svg>
  );
}

/** An eight-point burst, for the moments worth a sticker. */
export function Burst({ fill = "butter", className, children, ...props }: ArtProps & { fill?: Hue }) {
  const points = Array.from({ length: 32 }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 40;
    const a = (Math.PI * 2 * i) / 32;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg viewBox="-4 -4 108 108" className={className} aria-hidden={!children} {...props}>
      <polygon points={points} fill={C[fill]} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      {children}
    </svg>
  );
}

export function Sparkle({ fill = "ink", className, ...props }: ArtProps & { fill?: Hue }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden {...props}>
      <path d="M20 0c1.6 11 7.4 17.4 20 20-12.6 2.6-18.4 9-20 20-1.6-11-7.4-17.4-20-20C12.6 17.4 18.4 11 20 0Z" fill={C[fill]} />
    </svg>
  );
}

export function Squiggle({ stroke = "ink", className, ...props }: ArtProps & { stroke?: Hue }) {
  return (
    <svg viewBox="0 0 240 30" className={className} aria-hidden preserveAspectRatio="none" {...props}>
      <path
        d="M3 15c15-14 25-14 40 0s25 14 40 0 25-14 40 0 25 14 40 0 25-14 40 0 25 14 34 6"
        fill="none"
        stroke={C[stroke]}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Two figures, leaning in. Pills, not people. */
export function Pair({ a = "tomato", b = "cobalt", className, ...props }: ArtProps & { a?: Hue; b?: Hue }) {
  return (
    <svg viewBox="0 0 220 260" className={className} aria-hidden {...props}>
      <g transform="rotate(-8 70 150)">
        <rect x="20" y="80" width="90" height="170" rx="45" fill={C[a]} stroke={C.ink} strokeWidth="4" />
        <circle cx="65" cy="45" r="32" fill={C[a]} stroke={C.ink} strokeWidth="4" />
      </g>
      <g transform="rotate(8 150 150)">
        <rect x="110" y="80" width="90" height="170" rx="45" fill={C[b]} stroke={C.ink} strokeWidth="4" />
        <circle cx="155" cy="45" r="32" fill={C[b]} stroke={C.ink} strokeWidth="4" />
      </g>
      <path d="M100 30c6-10 18-10 20 0 2-10 14-10 20 0 6 12-20 26-20 26s-26-14-20-26Z" fill={C.bubble} stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round" transform="translate(-10 -22)" />
    </svg>
  );
}

/** A half sun on the horizon: a new start, not a sunset. */
export function Sun({ fill = "butter", className, ...props }: ArtProps & { fill?: Hue }) {
  return (
    <svg viewBox="0 0 240 130" className={className} aria-hidden {...props}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (Math.PI * (i + 0.5)) / 9;
        return (
          <line
            key={i}
            x1={120 + Math.cos(a) * 82}
            y1={120 + Math.sin(a) * 82}
            x2={120 + Math.cos(a) * 112}
            y2={120 + Math.sin(a) * 112}
            stroke={C.ink}
            strokeWidth="5"
            strokeLinecap="round"
          />
        );
      })}
      <path d="M50 120a70 70 0 0 1 140 0Z" fill={C[fill]} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <line x1="4" y1="122" x2="236" y2="122" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Two interlocked rings. */
export function Rings({ className, ...props }: ArtProps) {
  return (
    <svg viewBox="0 0 200 130" className={className} aria-hidden {...props}>
      <circle cx="75" cy="65" r="50" fill="none" stroke={C.ink} strokeWidth="18" />
      <circle cx="75" cy="65" r="50" fill="none" stroke={C.butter} strokeWidth="10" />
      <circle cx="125" cy="65" r="50" fill="none" stroke={C.ink} strokeWidth="18" />
      <circle cx="125" cy="65" r="50" fill="none" stroke={C.butter} strokeWidth="10" />
      <path d="M100 21.7a50 50 0 0 1 0 86.6" fill="none" stroke={C.ink} strokeWidth="18" />
      <path d="M100 21.7a50 50 0 0 1 0 86.6" fill="none" stroke={C.butter} strokeWidth="10" />
    </svg>
  );
}
