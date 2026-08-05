import Link from "next/link";
import { Paper } from "@/components/ui/paper";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { DELIVERABLES } from "@/config/business";

/**
 * The free assessment and the paid audit both used to be called a "readiness
 * map", which made the paid one look like the free one with a price on it.
 *
 * They are genuinely different things: one is produced from your answers by a
 * set of rules, the other is read and interpreted by a person and discussed
 * with you. Naming them differently is the honest fix, and it is also the
 * commercial one — nobody buys a thing they believe they already have.
 *
 * Two panels rather than a pricing table: this is a comparison of substance,
 * not of feature counts, and a tick grid would make it look like software.
 */
export function AssessmentComparison() {
  const { free, paid } = DELIVERABLES;

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
      {/* Free — deliberately the plainer of the two surfaces. */}
      <Reveal>
        <div className="flex h-full flex-col rounded-[20px] border border-hairline bg-onink/[0.03] p-7 md:p-9">
          <div className="flex items-baseline justify-between gap-4">
            <p className="engraved text-onink-faint">Where everyone begins</p>
            <p className="engraved text-sage">{free.cost}</p>
          </div>

          <h3 className="display-md mt-5 text-onink">{free.name}</h3>
          <p className="mt-4 text-[16px] leading-relaxed text-onink-dim">
            {free.depth}
          </p>

          <dl className="mt-7 space-y-4 border-t border-hairline pt-6">
            <div>
              <dt className="engraved text-onink-faint">Reviewed by</dt>
              <dd className="mt-1.5 text-[15px] text-onink-dim">{free.reviewed}</dd>
            </div>
            <div>
              <dt className="engraved text-onink-faint">What it is not</dt>
              <dd className="mt-1.5 text-[15px] text-onink-dim">
                {free.limitation}
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-8">
            <Button asChild variant="quiet" size="md" className="w-full sm:w-auto">
              <Link
                href="/assessment"
                data-analytics-event="cta_click"
                data-analytics-label="free_snapshot"
                data-analytics-placement="comparison"
              >
                Take the free assessment
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Paid — the paper surface, because this is the one with a person on it. */}
      <Reveal delay={90}>
        <Paper className="flex h-full flex-col p-7 md:p-9">
          <div className="flex items-baseline justify-between gap-4">
            <p className="engraved text-oxblood">What the audit adds</p>
            <p className="engraved text-slate">{paid.cost}</p>
          </div>

          <h3 className="display-md mt-5 text-ink">{paid.name}</h3>
          <p className="mt-4 text-[16px] leading-relaxed text-slate">
            {paid.depth}
          </p>

          <dl className="mt-7 space-y-4 border-t border-stone pt-6">
            <div>
              <dt className="engraved text-slate">Reviewed by</dt>
              <dd className="mt-1.5 text-[15px] text-ink">{paid.reviewed}</dd>
            </div>
            <div>
              <dt className="engraved text-slate">What it is not</dt>
              <dd className="mt-1.5 text-[15px] text-ink">{paid.limitation}</dd>
            </div>
          </dl>

          <div className="mt-auto pt-8">
            <Button asChild size="md" className="w-full sm:w-auto">
              <Link
                href="/plans#clarity-audit"
                data-analytics-event="cta_click"
                data-analytics-label="clarity_audit"
                data-analytics-placement="comparison"
              >
                See the Clarity Audit
              </Link>
            </Button>
          </div>
        </Paper>
      </Reveal>
    </div>
  );
}
