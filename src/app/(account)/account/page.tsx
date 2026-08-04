import Link from "next/link";
import { redirect } from "next/navigation";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { ReadinessMapView } from "@/components/assessment/readiness-map";
import { resolveCurrency } from "@/lib/currency.server";
import { getMemberOverview } from "@/lib/account.server";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import { getViewer } from "@/lib/admin.server";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ view }, viewer] = await Promise.all([searchParams, getViewer()]);

  // The unqualified account landing page is the member destination. Staff who
  // arrive here through an old bookmark or stale post-login redirect should
  // enter Operations instead. `?view=folio` keeps deliberate member-view QA
  // available from the admin header.
  if (viewer?.isAdmin && view !== "folio") redirect("/admin");

  const [currency, overview] = await Promise.all([
    resolveCurrency(),
    getMemberOverview(),
  ]);

  if (!overview.map) {
    return (
      <div className="max-w-4xl">
        <WorkspaceHeader
          eyebrow="Your starting point"
          title="A useful folio begins with an honest map."
          body="Your account is ready. The assessment gives every session and recommendation a shared starting point."
          detail="About 12 minutes"
        />
        <Paper className="mt-8 px-7 py-10 md:px-10 md:py-12">
          <div className="grid gap-8 md:grid-cols-[7rem_1fr] md:items-start">
            <p className="numeral display text-[5rem] leading-none text-stone" aria-hidden>
              01
            </p>
            <div>
              <p className="engraved text-oxblood">Complete your readiness map</p>
              <h2 className="display-md mt-4 text-ink">
                You have not finished the assessment yet.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-slate">
                It saves after every question. Everything else in your account
                starts from what it tells us.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/assessment">Start the assessment</Link>
                </Button>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    );
  }

  return (
    <>
      <WorkspaceHeader
        eyebrow="Your private folio"
        title={overview.firstName ? `${overview.firstName}, this is your readiness map.` : "Your readiness map"}
        body="A working document for the choices ahead—not a score, a badge, or a verdict."
        detail="Private to you and your assigned team"
      />
      {overview.enrolment && (
        <Paper className="mb-10 mt-8 px-7 py-7">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="engraved text-slate">Your programme</p>
              <p className="display-md mt-2 text-ink">
                {overview.enrolment.programmeName}
              </p>
            </div>
            <div className="text-right">
              <p className="engraved text-slate">Introductions</p>
              <p className="numeral display-md mt-2 text-ink">
                {overview.enrolment.delivered}
                {overview.enrolment.agreed !== null
                  ? ` / ${overview.enrolment.agreed}`
                  : ""}
              </p>
            </div>
          </div>
        </Paper>
      )}

      <div className={overview.enrolment ? "" : "mt-8"}>
        <ReadinessMapView
          map={overview.map}
          currency={currency}
          name={overview.firstName}
        />
      </div>
    </>
  );
}
