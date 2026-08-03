import Link from "next/link";
import { cn } from "@/lib/utils";

/** Status pill. Tone is derived from the word, so every screen spells a state
 *  the same way without each one inventing its own colour mapping. */
const TONES: Record<string, string> = {
  positive: "border-sage/45 bg-sage/12 text-onink",
  attention: "border-rose/50 bg-rose/12 text-onink",
  urgent: "border-oxblood-lift/70 bg-oxblood/25 text-onink",
  neutral: "border-hairline text-onink-dim",
};

const STATE_TONE: Record<string, keyof typeof TONES> = {
  succeeded: "positive",
  active: "positive",
  completed: "positive",
  verified: "positive",
  published: "positive",
  mutual_accepted: "positive",
  resolved: "positive",
  actioned: "positive",

  pending: "attention",
  in_progress: "attention",
  proposed: "attention",
  review: "attention",
  requested: "attention",
  investigating: "attention",

  failed: "urgent",
  cancelled: "urgent",
  declined: "urgent",
  rejected: "urgent",
  abandoned: "urgent",
  open: "urgent",
  deleted: "urgent",
};

export function StatusPill({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return <span className="text-onink-faint">&mdash;</span>;
  const tone = STATE_TONE[value] ?? "neutral";
  return (
    <span
      className={cn(
        "engraved inline-flex items-center gap-2 rounded-[8px] border px-2.5 py-1 text-[10px]",
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function Metric({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="engraved text-onink-faint">{label}</p>
      <p className="numeral display-md mt-3 text-onink">{value}</p>
      {hint && <p className="mt-2 text-[13px] text-onink-faint">{hint}</p>}
    </>
  );

  const shell =
    "block rounded-[12px] border border-hairline bg-onink/[0.02] p-6 transition-colors";

  return href ? (
    <Link href={href} className={cn(shell, "hover:border-onink/25 hover:bg-onink/[0.04]")}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[12px] border border-hairline bg-onink/[0.02] p-6 md:p-7",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h2 className="display text-[1.3rem] text-onink">{title}</h2>}
            {description && (
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-onink-faint">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Label/value rows for a record detail view. */
export function DefinitionList({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="divide-y divide-hairline">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-6"
        >
          <dt className="engraved text-onink-faint">{item.label}</dt>
          <dd className="text-[15px] text-onink-dim">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[12px] border border-dashed border-hairline px-6 py-14 text-center">
      <p className="engraved text-rose">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-onink-dim">
        {body}
      </p>
    </div>
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
