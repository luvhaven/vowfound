import { cn } from "@/lib/utils";

export function WorkspaceHeader({
  eyebrow,
  title,
  body,
  detail,
  className,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  detail?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid gap-6 border-b border-hairline pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end",
        className,
      )}
    >
      <div>
        <p className="engraved text-rose">{eyebrow}</p>
        <h1 className="display mt-3 max-w-3xl text-[clamp(2.2rem,5vw,4rem)] text-onink">
          {title}
        </h1>
        {body && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-onink-dim">
            {body}
          </p>
        )}
      </div>
      {detail && (
        <p className="engraved max-w-[16rem] text-onink-faint md:text-right">
          {detail}
        </p>
      )}
    </header>
  );
}
