import { Paper } from "@/components/ui/paper";
import { VowMark } from "@/components/ui/ornament";

const GUARANTEE_TEXT =
  "Complete every milestone in your programme and if we have not delivered " +
  "the agreed number of qualified introductions, your active search period " +
  "is extended at no cost until we do.";

export function Guarantee() {
  return (
    <Paper className="grid gap-8 px-7 py-9 md:grid-cols-[8rem_minmax(0,1fr)] md:px-12 md:py-12">
      <div>
        <VowMark size={74} />
        <p className="engraved mt-5 text-oxblood">Our guarantee</p>
      </div>
      <p className="display-md text-ink">{GUARANTEE_TEXT}</p>
      <div className="border-t border-stone pt-6 md:col-start-2">
        <p className="engraved text-slate">The honest limit</p>
        <p className="mt-3 text-[14px] leading-relaxed text-slate">
          We guarantee the work, not the outcome. No one can promise you a
          marriage, and the promise itself is the warning sign.
        </p>
      </div>
    </Paper>
  );
}
