import Link from "next/link";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";

const EXAMPLE = [
  ["What you want", "A committed partnership with shared intentions around family and location."],
  ["What deserves attention", "Important conversations about timing tend to happen after emotional investment has grown."],
  ["Your first action", "Write down your three essential requirements. Practise asking about one of them in an early conversation."],
  ["A useful next step", "Consider a Clarity Audit if you would like a practitioner to explore the context and help you plan the work."],
];

export function SamplePlan() {
  return <Paper className="p-7 md:p-10">
    <p className="text-sm font-semibold text-oxblood">Illustrative example · Not a client result</p>
    <h3 className="display-md mt-4 text-ink">From reflection to a practical next step.</h3>
    <p className="mt-4 text-sm text-slate">This fictional example demonstrates the kind of guidance to expect. Your assessment reflects your own answers and is not a clinical diagnosis.</p>
    <dl className="mt-8 grid gap-7 md:grid-cols-2">{EXAMPLE.map(([label, body]) => <div key={label}><dt className="text-sm font-semibold text-oxblood">{label}</dt><dd className="mt-2 text-base text-ink">{body}</dd></div>)}</dl>
    <div className="mt-8 border-t border-stone pt-6"><Button asChild><Link href="/assessment" data-analytics-event="cta_click" data-analytics-label="sample_to_assessment" data-analytics-placement="sample_plan">Start free assessment</Link></Button></div>
  </Paper>;
}
