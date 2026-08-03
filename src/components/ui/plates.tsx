/**
 * Engraved plates.
 *
 * Line illustration in the manner of an old stationer's catalogue: objects and
 * settings, never people. This is how the site gets imagery without a stock
 * photograph of a couple who do not exist. Every plate is geometry, weighs
 * nothing, and scales without a second asset.
 */

const INK = "currentColor";

function Plate({
  children,
  label,
  className,
  ratio = 3 / 4,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  ratio?: number;
}) {
  return (
    <figure
      className={`foil-edge relative overflow-hidden rounded-[8px] bg-stock-warm ${className ?? ""}`}
      style={{ aspectRatio: `1 / ${ratio}` }}
    >
      <svg
        viewBox="0 0 200 150"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full text-slate"
        role="img"
        aria-label={label}
      >
        <rect width="200" height="150" fill="none" />
        {children}
      </svg>
    </figure>
  );
}

/** Two chairs at a small table. The meeting. */
export function PlateTableForTwo({ className }: { className?: string }) {
  return (
    <Plate label="A small table set for two" className={className}>
      <g stroke={INK} strokeWidth="0.9" fill="none" opacity="0.75">
        <ellipse cx="100" cy="86" rx="34" ry="10" />
        <path d="M100 86v34M86 120h28" />
        <path d="M52 74v34M52 74c0-9 5-14 13-14M46 90h13" />
        <path d="M148 74v34M148 74c0-9-5-14-13-14M141 90h13" />
        <circle cx="88" cy="83" r="5" />
        <circle cx="112" cy="83" r="5" />
        <path d="M100 62v-9M97 53h6" />
        <path d="M100 44a4 4 0 0 1 0 8 4 4 0 0 1 0-8z" opacity="0.6" />
      </g>
      <path
        d="M20 132h160"
        stroke="#AD8955"
        strokeWidth="0.8"
        opacity="0.55"
      />
    </Plate>
  );
}

/** An envelope with a pressed seal. The invitation. */
export function PlateInvitation({ className }: { className?: string }) {
  return (
    <Plate label="A sealed envelope" className={className}>
      <g stroke={INK} strokeWidth="0.9" fill="none" opacity="0.75">
        <rect x="52" y="48" width="96" height="62" rx="2" />
        <path d="M52 48l48 34 48-34" />
        <path d="M52 110l34-26M148 110l-34-26" opacity="0.5" />
      </g>
      <g stroke="#AD8955" strokeWidth="0.9" fill="none">
        <circle cx="100" cy="88" r="11" />
        <circle cx="100" cy="88" r="7" opacity="0.6" />
        <path d="M96 88h8M100 84v8" opacity="0.7" />
      </g>
    </Plate>
  );
}

/** A doorway with a garland. The ceremony, without a bride in it. */
export function PlateArch({ className }: { className?: string }) {
  return (
    <Plate label="An arched doorway" className={className}>
      <g stroke={INK} strokeWidth="0.9" fill="none" opacity="0.75">
        <path d="M64 128V72a36 36 0 0 1 72 0v56" />
        <path d="M74 128V72a26 26 0 0 1 52 0v56" opacity="0.45" />
        <path d="M48 128h104" />
      </g>
      <g stroke="#AD8955" strokeWidth="0.8" fill="none" opacity="0.75">
        <path d="M64 74c8-10 18-16 36-16s28 6 36 16" />
        <circle cx="76" cy="66" r="2.4" />
        <circle cx="100" cy="59" r="2.8" />
        <circle cx="124" cy="66" r="2.4" />
      </g>
    </Plate>
  );
}

/** A calendar leaf with a single date marked. The timeline. */
export function PlateCalendar({ className }: { className?: string }) {
  return (
    <Plate label="A calendar with one date marked" className={className}>
      <g stroke={INK} strokeWidth="0.9" fill="none" opacity="0.7">
        <rect x="58" y="42" width="84" height="76" rx="2" />
        <path d="M58 62h84" />
        <path d="M76 42V34M124 42V34" />
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={70 + col * 15}
              cy={74 + row * 12}
              r="1.6"
              opacity="0.5"
            />
          )),
        )}
      </g>
      <g stroke="#AD8955" strokeWidth="1" fill="none">
        <circle cx="115" cy="98" r="7" />
      </g>
    </Plate>
  );
}

/** A quill and a signed line. The commitment. */
export function PlateSignature({ className }: { className?: string }) {
  return (
    <Plate label="A signature on a ruled line" className={className}>
      <g stroke={INK} strokeWidth="0.9" fill="none" opacity="0.7">
        <path d="M50 108h100" />
        <path d="M56 96c10-14 16 6 24-4s10 10 18 2 14 4 22-6" />
      </g>
      <g stroke="#AD8955" strokeWidth="0.9" fill="none">
        <path d="M132 44l16 16-38 38-16-16z" opacity="0.8" />
        <path d="M94 82l-6 22 22-6" />
      </g>
    </Plate>
  );
}
