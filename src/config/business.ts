/**
 * One typed source for facts about how the business actually operates.
 *
 * Every number on the public site that a client could hold us to — a duration,
 * a session count, an introduction commitment, a response time — belongs here
 * rather than inline in a page. Two reasons:
 *
 * 1. A fact stated in three places drifts. Stated once, it cannot.
 * 2. Facts nobody has confirmed are visible as `null` with a TODO beside them,
 *    instead of being quietly invented by whoever was writing the copy.
 *
 * A `null` is not a gap to fill with something plausible. It means the answer
 * is not known yet, and the components below it must say something true and
 * non-specific until an owner confirms it. `stated()` exists to make that the
 * path of least resistance.
 */

/** A fact an owner has not yet confirmed. Never rendered as a number. */
export type Unconfirmed = null;

export interface ProgrammeFacts {
  slug: string;
  /** Who it genuinely suits. Written to disqualify as well as attract. */
  bestFor: string;
  /** The one thing a client leaves with. */
  outcome: string;
  /** What a person, rather than software, does on this programme. */
  humanInvolvement: string;
  /** Calendar length. null until confirmed. */
  durationLabel: string | Unconfirmed;
  /** One-to-one sessions included. null until confirmed. */
  sessions: number | Unconfirmed;
  /** Whether introductions form part of the programme. */
  includesIntroductions: boolean;
  /**
   * Introductions committed to in writing. null where the number has not been
   * set. The guarantee copy depends on this being real, so it must not be
   * guessed.
   */
  agreedIntroductions: number | Unconfirmed;
  /** What the buyer's next action actually is, given how we operate today. */
  action: "checkout" | "application" | "enquiry";
}

export const PROGRAMME_FACTS: Record<string, ProgrammeFacts> = {
  "clarity-audit": {
    slug: "clarity-audit",
    bestFor:
      "Anyone who wants an honest reading of where they stand before spending money on anything larger.",
    outcome:
      "A written readiness map and a specific first action for each obstacle it finds.",
    humanInvolvement:
      "A readiness adviser reads your assessment and interprets it with you on a call.",
    // TODO(owner): confirm the turnaround you can actually hold to between
    // purchase and the written map landing. Left null so no page promises one.
    durationLabel: null,
    sessions: 1,
    includesIntroductions: false,
    agreedIntroductions: null,
    action: "checkout",
  },
  "ready-in-90": {
    slug: "ready-in-90",
    bestFor:
      "People who already sense what is getting in the way and want it addressed before meeting anyone.",
    outcome:
      "The specific behaviours, expectations or practical gaps worked on directly, with feedback.",
    humanInvolvement:
      "A readiness adviser works with you one to one and reviews written exercises between sessions.",
    durationLabel: "90 days",
    // TODO(owner): confirm the session count. The name implies a shape; the
    // number should be contractual before it is printed.
    sessions: null,
    includesIntroductions: false,
    agreedIntroductions: null,
    action: "checkout",
  },
  match: {
    slug: "match",
    bestFor:
      "People who are ready, and whose difficulty is the pool rather than the preparation.",
    outcome:
      "Introductions proposed one at a time, each with a written reason, after mutual consent.",
    humanInvolvement:
      "A matchmaking lead reviews every shortlist and decides personally which introductions are worth making.",
    // TODO(owner): confirm the active search period you commit to in writing.
    durationLabel: null,
    sessions: null,
    includesIntroductions: true,
    // TODO(owner): this number is the whole guarantee. It must be the figure
    // you will extend a search period over, not an aspiration.
    agreedIntroductions: null,
    action: "checkout",
  },
  "private-concierge": {
    slug: "private-concierge",
    bestFor:
      "Clients whose situation is unusual, public, or complicated enough that a standard search will not work.",
    outcome:
      "A search run directly by a named principal, with discretion as the first constraint.",
    humanInvolvement:
      "An assigned principal runs the search personally and handles outreach off-platform.",
    durationLabel: null,
    sessions: null,
    includesIntroductions: true,
    agreedIntroductions: null,
    action: "enquiry",
  },
};

/**
 * Renders a fact only when it is known.
 *
 * Call sites read as `stated(facts.sessions, (n) => `${n} sessions`)`, so the
 * unconfirmed case is handled at the point of use rather than forgotten.
 */
export function stated<T>(
  value: T | Unconfirmed,
  render: (value: T) => string,
): string | null {
  return value === null || value === undefined ? null : render(value);
}

/** The two assessment outputs, which must never be described as one thing. */
export const DELIVERABLES = {
  free: {
    name: "Preliminary Readiness Snapshot",
    cost: "Free",
    /** Deliberately modest. It is rules-based, and saying so is the point. */
    depth:
      "A high-level reading produced from your answers, identifying one priority and a recommended starting point.",
    reviewed: "Automated. No adviser reads it.",
    limitation:
      "It is a starting point, not a professional assessment of your relationships.",
  },
  paid: {
    name: "Readiness Map and Action Plan",
    cost: "With the audit",
    depth:
      "A written map across every dimension, interpreted for your situation, with a first action for each obstacle.",
    reviewed: "Read and interpreted by a readiness adviser, then discussed with you.",
    limitation:
      "It is an informed professional opinion, not a prediction of any outcome.",
  },
} as const;

/**
 * Client-facing roles. Named by function rather than by person: the practice
 * is deliberately not personality-led, and a role can be described honestly
 * without publishing anybody's identity.
 *
 * Only list roles that exist or are committed to.
 */
export const ROLES = [
  {
    name: "Readiness Adviser",
    does: "Reads your assessment, decides the useful starting point, and tells you if that is nothing at all.",
  },
  {
    name: "Matchmaking Lead",
    does: "Considers compatibility and context, and writes the reason any introduction is being proposed.",
  },
  {
    name: "Safety Reviewer",
    does: "Handles concerns and reports, structurally separate from anyone whose work involves revenue.",
  },
] as const;

/**
 * The practice's position on its own visibility. Published only because it is
 * how the business genuinely runs — clients meet the person responsible for
 * their engagement privately, before it begins.
 */
export const PRACTICE_STANCE =
  "VowFound is deliberately run as a private practice rather than a personality-led brand. The professional assigned to your engagement is introduced to you privately before it begins.";

/** Where the business operates. */
export const SERVICE = {
  // Coaching is remote and always has been; introductions depend on where
  // someone will meet and whether they would relocate.
  coachingIsRemote: true,
  // TODO(owner): confirm the cities where introductions can realistically be
  // made today. Until then the site says coaching is remote and that
  // introductions depend on where you will meet, which is true everywhere.
  introductionCities: null as string[] | Unconfirmed,
  // TODO(owner): confirm the response time you can hold to for enquiries.
  enquiryResponse: null as string | Unconfirmed,
} as const;

/** Legal and canonical identity. */
export const ENTITY = {
  // TODO(owner): registered company name and number, required on invoices and
  // in the terms. The footer omits the line entirely until these are set.
  registeredName: null as string | Unconfirmed,
  registrationNumber: null as string | Unconfirmed,
  // TODO(owner): a registered or service address. Never a home address.
  serviceAddress: null as string | Unconfirmed,
} as const;

/**
 * The one thing that is never conditional: the outcome is not for sale.
 * Kept here so the wording is quotable from anywhere without being editable
 * through the CMS.
 */
export const OUTCOME_LIMIT =
  "We guarantee the work, not the outcome. Nobody can promise you a marriage, and the promise itself is the warning sign.";
