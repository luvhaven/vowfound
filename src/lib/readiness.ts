/**
 * The Readiness Check: eighteen statements, six dimensions, no overall score.
 *
 * A single number would read as a marriage-worthiness grade, which is both
 * wrong and unkind. Each dimension stands alone, with a band and one move.
 */

export const DIMENSIONS = [
  {
    key: "clarity",
    name: "Clarity",
    colour: "tomato",
    question: "Do you know what you want, and roughly by when?",
    low: "You want marriage, but the shape of it is still blurry, so every choice stays reversible.",
    move: "Write one sentence: the season you'd like to be engaged by, and what you're willing to change to get there.",
  },
  {
    key: "room",
    name: "Room",
    colour: "butter",
    question: "Is there actually space in your life for someone?",
    low: "Work, family or an unfinished chapter is taking the room a partner would need.",
    move: "Block two evenings a week for the next month that belong to your love life — and protect them like meetings.",
  },
  {
    key: "patterns",
    name: "Patterns",
    colour: "bubble",
    question: "Can you see what keeps repeating?",
    low: "Different people, familiar endings. Something repeats that hasn't been named yet.",
    move: "List how your last three relationships ended, in one line each. Circle the words that repeat.",
  },
  {
    key: "presence",
    name: "Presence",
    colour: "cobalt",
    question: "How do you come across when it matters?",
    low: "What you're like and how you come across on a first date may not match.",
    move: "Ask one honest friend: 'What would a stranger misread about me?' Then just listen.",
  },
  {
    key: "standards",
    name: "Standards",
    colour: "moss",
    question: "Are your must-haves the ones that matter?",
    low: "The list is long, and it's unclear which items are truly non-negotiable.",
    move: "Cut your list to three must-haves. Everything else becomes a 'nice to have'.",
  },
  {
    key: "repair",
    name: "Repair",
    colour: "lilac",
    question: "What happens when things get hard?",
    low: "Conflict tends to end in silence, exits or winning — not in repair.",
    move: "Next disagreement, try one sentence before defending yourself: 'Tell me what that felt like for you.'",
  },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];

export const STATEMENTS: { id: string; dim: DimensionKey; text: string; reverse?: boolean }[] = [
  { id: "c1", dim: "clarity", text: "I could describe the marriage I want in a few clear sentences." },
  { id: "c2", dim: "clarity", text: "I have a rough timeline for when I'd like to be married." },
  { id: "c3", dim: "clarity", text: "I often date people I already know I wouldn't marry.", reverse: true },
  { id: "r1", dim: "room", text: "My schedule has real time for a relationship right now." },
  { id: "r2", dim: "room", text: "I'm still emotionally tied up in a past relationship.", reverse: true },
  { id: "r3", dim: "room", text: "If I met the right person this month, I'd make space for them." },
  { id: "p1", dim: "patterns", text: "I can name why my last few relationships ended." },
  { id: "p2", dim: "patterns", text: "I tend to be drawn to the same kind of person, and it doesn't go well.", reverse: true },
  { id: "p3", dim: "patterns", text: "I've thought about my part in how things ended, not just theirs." },
  { id: "s1", dim: "presence", text: "People usually understand who I am fairly quickly." },
  { id: "s2", dim: "presence", text: "I've been told I come across differently than I mean to.", reverse: true },
  { id: "s3", dim: "presence", text: "I'm comfortable showing interest without playing it cool." },
  { id: "t1", dim: "standards", text: "I know my three true must-haves in a partner." },
  { id: "t2", dim: "standards", text: "Small things on paper often rule people out for me.", reverse: true },
  { id: "t3", dim: "standards", text: "My expectations match the kind of partner I am myself." },
  { id: "e1", dim: "repair", text: "After an argument, I'm usually the one who reaches back first." },
  { id: "e2", dim: "repair", text: "When things get tense, I shut down or leave.", reverse: true },
  { id: "e3", dim: "repair", text: "I can hear criticism without needing to win." },
];

export const SCALE = [
  { value: 1, label: "Not me" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Mostly" },
  { value: 5, label: "So me" },
] as const;

export type Band = "start" | "growing" | "solid" | "strong";

export const BAND_LABEL: Record<Band, string> = {
  start: "Start here",
  growing: "Growing",
  solid: "Solid",
  strong: "Strong",
};

export function bandFor(score: number): Band {
  if (score >= 75) return "strong";
  if (score >= 55) return "solid";
  if (score >= 35) return "growing";
  return "start";
}

export type Scores = Record<DimensionKey, number>;

/** Each dimension 0–100. Unanswered statements are treated as the midpoint. */
export function score(answers: Record<string, number>): Scores {
  const out = {} as Scores;
  for (const d of DIMENSIONS) {
    const items = STATEMENTS.filter((s) => s.dim === d.key);
    const total = items.reduce((sum, s) => {
      const raw = answers[s.id] ?? 3;
      const v = s.reverse ? 6 - raw : raw;
      return sum + (v - 1);
    }, 0);
    out[d.key] = Math.round((total / (items.length * 4)) * 100);
  }
  return out;
}

/**
 * The smallest useful next step. Real gaps point to coaching; no gaps point
 * to matchmaking; in between, a coach reads it with you first.
 */
export function recommend(scores: Scores): "the-read" | "ready" | "matched" {
  const values = Object.values(scores);
  const low = values.filter((v) => v < 55).length;
  if (values.some((v) => v < 35) || low >= 3) return "ready";
  if (low === 0) return "matched";
  return "the-read";
}

/** The dimension to work on first: the lowest, ties broken by list order. */
export function firstPriority(scores: Scores): DimensionKey {
  return DIMENSIONS.reduce((min, d) => (scores[d.key] < scores[min.key] ? d : min), DIMENSIONS[0]).key;
}
