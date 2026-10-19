import { DIMENSIONS, firstPriority, type Scores } from "@/lib/readiness";
import { productBySlug } from "@/lib/products";

/** Days after the check at which each email goes. */
export const FOLLOWUP_DAYS = [1, 3, 6] as const;

export interface FollowupInput {
  firstName: string | null;
  scores: Scores;
  recommended: string;
  resultsUrl: string;
  unsubscribeUrl: string;
  planUrl: string;
}

/**
 * Three short, useful emails — each gives something before it asks for
 * anything. Plain text, signed by a person's team, one link each, and an
 * unsubscribe on every one.
 */
export function followupEmail(step: number, input: FollowupInput) {
  const hi = input.firstName ? `Hi ${input.firstName},` : "Hi,";
  const first = DIMENSIONS.find((d) => d.key === firstPriority(input.scores))!;
  const plan = productBySlug(input.recommended);
  const footer = `\n\n— The VowFound team\n\nYour results: ${input.resultsUrl}\nNo more emails: ${input.unsubscribeUrl}`;

  if (step === 0) {
    return {
      subject: `Your first move on ${first.name.toLowerCase()}`,
      text: `${hi}\n\nYesterday's check put ${first.name.toLowerCase()} first. Here's the one thing worth doing this week:\n\n${first.move}\n\nIt takes ten minutes, and it's the same first exercise our coaches would give you.${footer}`,
    };
  }
  if (step === 1) {
    return {
      subject: "Why we start before the introductions",
      text: `${hi}\n\nMost people come to us wanting introductions. The ones who do best fix the repeating thing first — because a great match won't survive a pattern nobody has named.\n\nFor you, that pattern lives in ${first.name.toLowerCase()}: ${first.low}\n\nBased on your results, the smallest useful next step for you is ${plan?.name ?? "The Read"}:\n${input.planUrl}${footer}`,
    };
  }
  return {
    subject: "Last note from us",
    text: `${hi}\n\nThis is the last email we'll send about your check. If now isn't the time, that's a good decision too — your results stay at the link below.\n\nIf it is the time: The Read is our smallest step — your report read with you by a coach for 30 minutes — and what you pay comes off Ready or Matched if you continue within 30 days.\n${input.planUrl}${footer}`,
  };
}
