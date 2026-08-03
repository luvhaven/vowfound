import { DIMENSIONS, type Band, dimensionByKey } from "./dimensions";
import { QUESTIONS, questionByKey, type Question } from "./questions";

export const ENGINE_VERSION = "v1";

export type AnswerMap = Record<string, unknown>;

export interface DimensionResult {
  key: string;
  name: string;
  band: Band;
  /** Plain-language reading of this dimension for this person. */
  note: string;
  firstAction: string | null;
}

export interface ReadinessMap {
  dimensions: DimensionResult[];
  strengths: string[];
  obstacles: string[];
  recommendedProduct: string;
  summary: string;
  engineVersion: string;
}

/* --- credit collection ---------------------------------------------------- */

function creditFor(question: Question, answer: unknown): Record<string, number> {
  if (answer === undefined || answer === null || answer === "") return {};

  if (question.type === "single" && typeof answer === "string") {
    return question.choices?.find((c) => c.value === answer)?.contributes ?? {};
  }

  if (question.type === "multi" && Array.isArray(answer)) {
    if (!question.contributes) return {};
    // Choosing exactly the requested number is the signal; over- or
    // under-selecting reads as an unmade decision.
    const wanted = question.maxChoices ?? answer.length;
    const ratio = answer.length === wanted ? 1 : 0.45;
    return scale(question.contributes, ratio);
  }

  if (question.type === "scale" && typeof answer === "number") {
    const { min, max } = question.scale!;
    const raw = (answer - min) / (max - min);
    return scale(question.contributes ?? {}, question.reverse ? 1 - raw : raw);
  }

  if (
    (question.type === "longtext" || question.type === "text") &&
    typeof answer === "string"
  ) {
    if (!question.contributes) return {};
    // Length is a proxy for engagement, not for quality. Capped early so a
    // long answer is never rewarded over a considered short one.
    const words = answer.trim().split(/\s+/).filter(Boolean).length;
    const ratio = words >= 25 ? 1 : words >= 12 ? 0.8 : words >= 5 ? 0.6 : 0.35;
    return scale(question.contributes, ratio);
  }

  return {};
}

function scale(map: Record<string, number>, ratio: number) {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(map)) out[k] = v * ratio;
  return out;
}

function bandFor(value: number): Band {
  if (value >= 0.8) return "ready";
  if (value >= 0.6) return "workable";
  if (value >= 0.38) return "emerging";
  return "not_yet";
}

/* --- notes ---------------------------------------------------------------- */

/** Specific enough to be uncomfortable, never demeaning. */
function noteFor(key: string, band: Band, answers: AnswerMap): string {
  const d = dimensionByKey(key)!;

  if (band === "ready" || band === "workable") {
    switch (key) {
      case "intent":
        return "You can say what you want and roughly when. That is rarer than you think, and it makes everything downstream easier.";
      case "availability":
        return "There is room in your life for someone. Nothing unfinished is occupying the space.";
      case "patterns":
        return "You can describe your history without flinching, and you are not repeating one shape blindly.";
      case "presentation":
        return "How you experience yourself and how you are read are close together. Good.";
      case "requirements":
        return "Your requirements are short enough to be real and defensible. This is the single biggest predictor of a search that goes anywhere.";
      case "stability":
        return "The practical shape of your life could hold a marriage this year without straining.";
      case "alignment":
        return "You know what you would end a good relationship over. That clarity prevents the six-month discovery.";
      case "openness":
        return "You can be told something unflattering and use it. The coaching will actually work on you.";
    }
  }

  // Below the line. Name the mechanism, do not diagnose the person.
  switch (key) {
    case "intent":
      return answers.timeline === "undecided"
        ? "You have not committed to a shape or a date yet, which keeps every decision reversible. That is not a flaw, but it does mean nothing progresses on its own."
        : d.obstacle;
    case "availability":
      return answers.last_relationship_end === "under_3m"
        ? "The last one ended very recently. Whatever else is true, the space a partner would need is still occupied."
        : d.obstacle;
    case "patterns":
      return answers.recurring_pattern === "yes_unnamed"
        ? "You can feel the pattern and cannot name it. That is the most workable version of this problem, and it is exactly what stage one is for."
        : d.obstacle;
    case "presentation":
      return "There is a gap between how you experience yourself and how a stranger reads you in the first ten minutes. Nobody close to you will tell you what it is.";
    case "requirements":
      return "Your requirements are doing two jobs at once: protecting you and deciding for you. Until they are separated, good candidates are being removed by rules you have not examined.";
    case "stability":
      return "Something practical is unsettled enough that a relationship starting now inherits the uncertainty. That is a sequencing problem, not a character one.";
    case "alignment":
      return "One of faith, children or family is undecided. Undecided does not stay quiet; it surfaces about six months in, with someone you already care about.";
    case "openness":
      return "Feedback lands harder for you than it needs to. That is worth knowing before you pay anyone to be honest with you.";
    default:
      return d.obstacle;
  }
}

/* --- recommendation ------------------------------------------------------- */

function recommend(dims: DimensionResult[], answers: AnswerMap): string {
  const weak = dims.filter(
    (d) => d.band === "not_yet" || d.band === "emerging",
  ).length;

  const service = answers.service_level;
  const budget = answers.budget;

  if (service === "private" || budget === "unlimited") {
    return "private-concierge";
  }
  // Real obstacles mean readiness work comes before introductions, whatever
  // the person came here asking for.
  if (weak >= 4) return "clarity-audit";
  if (weak >= 2) return "ready-in-90";
  if (service === "matching" || service === "both") return "match";
  if (service === "coaching") return "ready-in-90";
  return "clarity-audit";
}

function summarise(dims: DimensionResult[]): string {
  const ready = dims.filter((d) => d.band === "ready").length;
  const weak = dims.filter((d) => d.band === "not_yet").length;

  if (weak === 0 && ready >= 5) {
    return "There is no single thing standing in your way. What you are missing is a filtered pool and someone making introductions on purpose.";
  }
  if (weak >= 4) {
    return "Several dimensions need attention before introductions would be worth anything. That is not a verdict on you; it is a sequence, and the sequence is short.";
  }
  if (weak >= 1) {
    return "Most of this is in good order. One or two specific things are doing the damage, and they are the sort that respond quickly once named.";
  }
  return "Nothing here is broken. What is available to you is a sharper version of what you already have.";
}

/* --- the engine ----------------------------------------------------------- */

export function scoreAssessment(answers: AnswerMap): ReadinessMap {
  const totals = new Map<string, number[]>();
  for (const d of DIMENSIONS) totals.set(d.key, []);

  for (const question of QUESTIONS) {
    const credit = creditFor(question, answers[question.key]);
    for (const [dimension, value] of Object.entries(credit)) {
      totals.get(dimension)?.push(value);
    }
  }

  const dimensions: DimensionResult[] = DIMENSIONS.map((d) => {
    const values = totals.get(d.key) ?? [];
    // A dimension nobody answered for sits at the bottom of workable rather
    // than being called an obstacle we have no evidence for.
    const mean =
      values.length === 0
        ? 0.6
        : values.reduce((a, b) => a + b, 0) / values.length;
    const band = bandFor(mean);
    return {
      key: d.key,
      name: d.name,
      band,
      note: noteFor(d.key, band, answers),
      firstAction:
        band === "ready" || band === "workable" ? null : d.firstAction,
    };
  });

  const strengths = dimensions
    .filter((d) => d.band === "ready")
    .map((d) => d.name);
  const obstacles = dimensions
    .filter((d) => d.band === "not_yet" || d.band === "emerging")
    .map((d) => d.name);

  return {
    dimensions,
    strengths,
    obstacles,
    recommendedProduct: recommend(dimensions, answers),
    summary: summarise(dimensions),
    engineVersion: ENGINE_VERSION,
  };
}

/** Used by the results page to quote the person back to themselves. */
export function honestReason(answers: AnswerMap): string | null {
  const value = answers.honest_reason;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function questionPrompt(key: string): string {
  return questionByKey(key)?.prompt ?? key;
}
