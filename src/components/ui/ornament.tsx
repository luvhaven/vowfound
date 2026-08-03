/**
 * Hand-drawn engraving. Every mark here is geometry, not photography and not
 * a generated image — the site needs ornament that reads as pressed into
 * paper, and this is where that comes from.
 */

const FOIL_ID = "vf-foil-stroke";
const ROSE_METAL_ID = "vf-rose-metal-stroke";

/** Shared foil gradient. Rendered once, referenced by every ornament. */
export function FoilDefs() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" className="absolute">
      <defs>
        <linearGradient id={FOIL_ID} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#AD8955" />
          <stop offset="50%" stopColor="#E8D3A8" />
          <stop offset="100%" stopColor="#AD8955" />
        </linearGradient>
        <linearGradient id={ROSE_METAL_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8D3151" />
          <stop offset="52%" stopColor="#E2A1B5" />
          <stop offset="100%" stopColor="#9E3B5C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const foil = `url(#${FOIL_ID})`;
const roseMetal = `url(#${ROSE_METAL_ID})`;

/**
 * The VowFound mark. Two complete bands alternate above and below one another,
 * creating a shared center without turning either ring into half of a whole.
 */
export function VowMark({
  size = 44,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 36) / 52}
      viewBox="6 14 52 36"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path
        d="M29.71 47.13A16 16 0 1 1 34.13 44.78"
        stroke="#7D5A34"
        strokeWidth="4.2"
        strokeLinecap="round"
        opacity="0.62"
      />
      <path
        d="M34.29 16.87A16 16 0 1 1 29.87 19.22"
        stroke="#72233F"
        strokeWidth="4.2"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M29.71 47.13A16 16 0 1 1 34.13 44.78"
        stroke={foil}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M34.29 16.87A16 16 0 1 1 29.87 19.22"
        stroke={roseMetal}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Backwards-compatible name for older composition imports. */
export function Monogram(props: Parameters<typeof VowMark>[0]) {
  return <VowMark {...props} />;
}

/** An engraved divider: hairline, lozenge, hairline. Used between sections
 *  where a plain rule would be too plain. */
export function RuleOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 12"
      width="240"
      height="12"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Rects, not strokes: a perfectly horizontal path has a zero-height
          bounding box, and an objectBoundingBox gradient cannot paint it. */}
      <rect x="0" y="5.5" width="96" height="1" fill={foil} />
      <rect x="144" y="5.5" width="96" height="1" fill={foil} />
      <rect x="104" y="5.5" width="4" height="1" fill={foil} opacity="0.6" />
      <rect x="132" y="5.5" width="4" height="1" fill={foil} opacity="0.6" />
      <path d="M120 1.5 126 6l-6 4.5L114 6z" stroke={foil} strokeWidth="1" />
    </svg>
  );
}

/** A pair of rings, drawn as an engraver would: overlapping, unequal weight.
 *  The one explicitly marital device on the site. */
export function Rings({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <VowMark size={size} className={className} />;
}

/** Corner filigree for a card that should feel like an invitation. */
export function CornerFlourish({
  className,
  corner = "tl",
}: {
  className?: string;
  corner?: "tl" | "tr" | "bl" | "br";
}) {
  const rotation = { tl: 0, tr: 90, br: 180, bl: 270 }[corner];
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 46 46"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M2 22C2 10.9 10.9 2 22 2"
        stroke={foil}
        strokeWidth="0.9"
        opacity="0.8"
      />
      <path
        d="M2 33C2 15.9 15.9 2 33 2"
        stroke={foil}
        strokeWidth="0.6"
        opacity="0.45"
      />
      <circle cx="22" cy="22" r="1.4" fill="#AD8955" opacity="0.7" />
    </svg>
  );
}
