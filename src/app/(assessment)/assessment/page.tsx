import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AssessmentRunner } from "@/components/assessment/runner";
import { TIMELINE_COOKIE } from "@/lib/timeline";

export const metadata: Metadata = {
  title: "The readiness assessment",
  description:
    "Twelve minutes, one question at a time. It ends with a readiness map across every dimension, not a score out of ten.",
  robots: { index: true, follow: true },
};

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ timeline?: string }>;
}) {
  const params = await searchParams;
  const store = await cookies();
  const timeline = params.timeline ?? store.get(TIMELINE_COOKIE)?.value;

  return <AssessmentRunner initialTimeline={timeline} />;
}
