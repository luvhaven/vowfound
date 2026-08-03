/**
 * The readiness map. Multidimensional, with named bands.
 *
 * There is deliberately no aggregate score and no percentage. A single number
 * would be read as a marriage-worthiness rating, which is both wrong and
 * cruel. Each dimension stands on its own and carries its own first action.
 */

export const BANDS = ["not_yet", "emerging", "workable", "ready"] as const;
export type Band = (typeof BANDS)[number];

export const BAND_LABEL: Record<Band, string> = {
  not_yet: "Work to do first",
  emerging: "Emerging",
  workable: "Workable",
  ready: "Ready",
};

export const BAND_MEANING: Record<Band, string> = {
  not_yet:
    "This one is in the way right now. Meeting people before it is addressed tends to repeat what has already happened.",
  emerging:
    "Moving in the right direction, with something specific still unresolved.",
  workable: "Sound. There is a sharper version of this available to you.",
  ready: "No obstacle here. This is something you can lean on.",
};

export interface Dimension {
  key: string;
  name: string;
  description: string;
  /** What a low band on this dimension usually means, in plain terms. */
  obstacle: string;
  /** One specific first action. Never advice-shaped filler. */
  firstAction: string;
}

export const DIMENSIONS: readonly Dimension[] = [
  {
    key: "intent",
    name: "Clarity of intent",
    description:
      "Whether you can say what you want, by when, and why, without hedging.",
    obstacle:
      "You want to be married but have not committed to a shape or a timeline, so every decision stays reversible and nothing progresses.",
    firstAction:
      "Write one sentence: the month you intend to be engaged by, and what you are prepared to change to make it plausible.",
  },
  {
    key: "availability",
    name: "Emotional availability",
    description:
      "How much room there actually is for another person in your life right now.",
    obstacle:
      "Something unfinished is still occupying the space a partner would need. Usually a previous relationship, sometimes a grief nobody has asked you about.",
    firstAction:
      "Name the person or event still taking up room, and write what specifically remains unresolved about it.",
  },
  {
    key: "patterns",
    name: "Patterns and history",
    description:
      "What your last few relationships have in common, and whether you can see it.",
    obstacle:
      "The same ending keeps arriving at the same point. Until the mechanism is named, it will keep operating.",
    firstAction:
      "List your last three relationships and the month each one changed. Look for the number that repeats.",
  },
  {
    key: "presentation",
    name: "How you come across",
    description:
      "The gap between how you experience yourself and how a stranger reads you.",
    obstacle:
      "You are being read as something you are not, usually as unavailable, guarded, or already finished choosing.",
    firstAction:
      "Ask one person who has met you once, not one who loves you, what they assumed about you in the first ten minutes.",
  },
  {
    key: "requirements",
    name: "Requirements and realism",
    description:
      "Whether your requirements are few, absolute and defensible, or long and mostly aspirational.",
    obstacle:
      "A long list is not high standards. It is an unmade decision, and it removes people who would have worked.",
    firstAction:
      "Cut your list to three absolutes. Everything you cannot defend to a stranger becomes a preference.",
  },
  {
    key: "stability",
    name: "Life stability",
    description:
      "Whether the practical shape of your life can hold a marriage this year.",
    obstacle:
      "Location, work or money is unsettled enough that any relationship starting now inherits the uncertainty.",
    firstAction:
      "Decide the one thing that must be settled first, and give it a date before you start meeting people.",
  },
  {
    key: "alignment",
    name: "Values and family alignment",
    description:
      "Faith, children, family expectations, and how firmly each is held.",
    obstacle:
      "You have not decided which of these is negotiable, so you discover the answer six months in, with someone you already care about.",
    firstAction:
      "Write down what you would end a good relationship over. If nothing appears, that is the finding.",
  },
  {
    key: "openness",
    name: "Openness to feedback",
    description:
      "Whether you can hear something unflattering and use it rather than defend against it.",
    obstacle:
      "The work in stage two only functions if you can be told something you did not want to hear. Without that, coaching becomes agreement.",
    firstAction:
      "Recall the last accurate criticism you received. Write what you did with it in the following week.",
  },
] as const;

export function dimensionByKey(key: string): Dimension | undefined {
  return DIMENSIONS.find((d) => d.key === key);
}
