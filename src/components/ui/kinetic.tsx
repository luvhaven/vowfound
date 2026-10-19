import * as React from "react";

/** Splits a line into words that rise out of a mask one after another. */
export function Kinetic({
  text,
  offset = 0,
  className,
}: {
  text: string;
  offset?: number;
  className?: string;
}) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="kinetic">
          <span className={className} style={{ "--i": offset + i } as React.CSSProperties}>
            {word}
          </span>
          {" "}
        </span>
      ))}
    </>
  );
}

/**
 * A title in the house style: the opening clause upright, the rest in the
 * rose italic. Splits at the first comma or full stop that has words after it,
 * so "Private matchmaking, with the reasoning shown." becomes two voices. A
 * title with no such break is set upright throughout.
 */
export function KineticTitle({ text }: { text: string }) {
  const match = text.match(/^(.+?[,.])\s+(.+)$/);
  if (!match) return <Kinetic text={text} />;

  const [, lead, rest] = match;
  return (
    <>
      <span className="block">
        <Kinetic text={lead} />
      </span>
      <span className="block">
        <Kinetic text={rest} offset={lead.split(" ").length} className="vow-italic" />
      </span>
    </>
  );
}
