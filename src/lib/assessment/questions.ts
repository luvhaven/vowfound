import { TIMELINE_OPTIONS } from "@/lib/timeline";

/**
 * One question per screen. No clinical or diagnostic language anywhere in
 * here: this is an intake conversation, not a screening instrument.
 *
 * `contributes` maps an answer to dimension credit between 0 and 1. The scoring
 * engine averages the credit a dimension receives, so a question can inform
 * several dimensions at different strengths without any of it being hidden.
 */

export type QuestionType =
  | "single"
  | "multi"
  | "scale"
  | "text"
  | "longtext"
  | "email";

export interface Choice {
  value: string;
  label: string;
  /** dimension key -> credit 0..1 */
  contributes?: Record<string, number>;
}

export interface Question {
  key: string;
  section: string;
  type: QuestionType;
  prompt: string;
  help?: string;
  placeholder?: string;
  optional?: boolean;
  choices?: readonly Choice[];
  /** multi only */
  maxChoices?: number;
  /** scale only */
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
  /** scale/text credit: applied when answered, scaled by normalised value */
  contributes?: Record<string, number>;
  /** Reverse a scale's contribution (low answer is the healthy one). */
  reverse?: boolean;
}

export const QUESTIONS: readonly Question[] = [
  // --- Intent ---------------------------------------------------------------
  {
    key: "timeline",
    section: "Intent",
    type: "single",
    prompt: "When do you want to be married?",
    help: "Your goal, not a promise from us. It changes what we recommend.",
    choices: TIMELINE_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
      contributes:
        o.value === "undecided"
          ? { intent: 0.3 }
          : { intent: o.months && o.months <= 6 ? 1 : 0.75 },
    })),
  },
  {
    key: "why_now",
    section: "Intent",
    type: "single",
    prompt: "What changed recently that made this feel urgent?",
    choices: [
      { value: "long_time", label: "Nothing changed. It has been a long time.", contributes: { intent: 0.5 } },
      { value: "breakup", label: "A relationship ended", contributes: { intent: 0.7, availability: 0.3 } },
      { value: "age", label: "An age or a birthday", contributes: { intent: 0.8 } },
      { value: "family", label: "Family pressure", contributes: { intent: 0.5, alignment: 0.4 } },
      { value: "settled", label: "The rest of my life finally settled", contributes: { intent: 1, stability: 0.9 } },
      { value: "tired", label: "I am tired of doing this by myself", contributes: { intent: 0.9 } },
    ],
  },

  // --- Where you stand ------------------------------------------------------
  {
    key: "relationship_status",
    section: "Where you stand",
    type: "single",
    prompt: "What is your relationship status today?",
    choices: [
      { value: "single", label: "Single", contributes: { availability: 1 } },
      { value: "dating", label: "Dating, nothing serious", contributes: { availability: 0.7 } },
      { value: "seeing_someone", label: "Seeing someone, undefined", contributes: { availability: 0.4 } },
      { value: "separated", label: "Separated", contributes: { availability: 0.3 } },
      { value: "divorced", label: "Divorced", contributes: { availability: 0.8 } },
      { value: "widowed", label: "Widowed", contributes: { availability: 0.6 } },
    ],
  },
  {
    key: "last_relationship_end",
    section: "Where you stand",
    type: "single",
    prompt: "When did your last serious relationship end?",
    choices: [
      { value: "under_3m", label: "Less than three months ago", contributes: { availability: 0.2 } },
      { value: "3_12m", label: "Three to twelve months ago", contributes: { availability: 0.6 } },
      { value: "1_3y", label: "One to three years ago", contributes: { availability: 0.9 } },
      { value: "over_3y", label: "More than three years ago", contributes: { availability: 0.8, patterns: 0.5 } },
      { value: "never", label: "I have not had one", contributes: { availability: 0.7, patterns: 0.4 } },
    ],
  },
  {
    key: "history_length",
    section: "Where you stand",
    type: "single",
    prompt: "How long has your longest relationship lasted?",
    choices: [
      { value: "under_1y", label: "Under a year", contributes: { patterns: 0.3 } },
      { value: "1_3y", label: "One to three years", contributes: { patterns: 0.6 } },
      { value: "3_7y", label: "Three to seven years", contributes: { patterns: 0.9 } },
      { value: "over_7y", label: "More than seven years", contributes: { patterns: 1 } },
      { value: "none", label: "I have not had a long one", contributes: { patterns: 0.2 } },
    ],
  },

  // --- What is in the way ---------------------------------------------------
  {
    key: "primary_difficulty",
    section: "What is in the way",
    type: "single",
    prompt: "If you had to name the main difficulty, which is closest?",
    choices: [
      { value: "meeting", label: "I do not meet suitable people", contributes: { requirements: 0.7, presentation: 0.5 } },
      { value: "starts_fail", label: "It starts well and then stalls", contributes: { patterns: 0.3, presentation: 0.4 } },
      { value: "not_serious", label: "The people I meet are not serious", contributes: { requirements: 0.5 } },
      { value: "i_lose_interest", label: "I lose interest quickly", contributes: { availability: 0.3, patterns: 0.3 } },
      { value: "they_lose_interest", label: "They lose interest", contributes: { presentation: 0.3, patterns: 0.4 } },
      { value: "cant_commit", label: "I struggle to commit", contributes: { availability: 0.25, intent: 0.5 } },
      { value: "time", label: "I have no time for this", contributes: { stability: 0.4, intent: 0.6 } },
    ],
  },
  {
    key: "recurring_pattern",
    section: "What is in the way",
    type: "single",
    prompt: "Does the same thing tend to happen each time?",
    help: "Most people say yes here. Seeing it is the useful part.",
    choices: [
      { value: "yes_named", label: "Yes, and I can name it", contributes: { patterns: 1, openness: 0.9 } },
      { value: "yes_unnamed", label: "Yes, but I cannot name it", contributes: { patterns: 0.5, openness: 0.7 } },
      { value: "no", label: "No, each one was different", contributes: { patterns: 0.6 } },
      { value: "never_looked", label: "I have never looked at it that way", contributes: { patterns: 0.3, openness: 0.6 } },
    ],
  },
  {
    key: "honest_reason",
    section: "What is in the way",
    type: "longtext",
    prompt: "What do you think is the honest reason you're not married yet?",
    help: "Say it plainly. This answer is stored word for word and read by a person. It is usually where the coaching starts.",
    placeholder: "The real answer, not the one you give at weddings.",
    contributes: { openness: 1, patterns: 0.5 },
  },
  {
    key: "feedback_openness",
    section: "What is in the way",
    type: "scale",
    prompt:
      "If a coach told you something unflattering and accurate, how would you take it?",
    scale: { min: 1, max: 5, minLabel: "Badly", maxLabel: "I would want it" },
    contributes: { openness: 1 },
  },

  // --- How you come across --------------------------------------------------
  {
    key: "first_impression",
    section: "How you come across",
    type: "single",
    prompt: "What do people most often get wrong about you at first?",
    choices: [
      { value: "cold", label: "That I am cold or unapproachable", contributes: { presentation: 0.3 } },
      { value: "taken", label: "That I am already taken", contributes: { presentation: 0.4 } },
      { value: "intense", label: "That I am too intense", contributes: { presentation: 0.5 } },
      { value: "casual", label: "That I am not serious about marriage", contributes: { presentation: 0.4, intent: 0.6 } },
      { value: "intimidating", label: "That I am intimidating", contributes: { presentation: 0.5 } },
      { value: "nothing", label: "Nothing, people read me accurately", contributes: { presentation: 0.9 } },
    ],
  },
  {
    key: "communication_style",
    section: "How you come across",
    type: "single",
    prompt: "When something is wrong in a relationship, what do you do first?",
    choices: [
      { value: "raise_early", label: "Raise it early, plainly", contributes: { presentation: 1, patterns: 0.9 } },
      { value: "wait", label: "Wait to see whether it resolves", contributes: { presentation: 0.5, patterns: 0.5 } },
      { value: "withdraw", label: "Go quiet", contributes: { presentation: 0.25, patterns: 0.3 } },
      { value: "overexplain", label: "Explain at length until it is settled", contributes: { presentation: 0.5 } },
      { value: "end_it", label: "Start planning how to end it", contributes: { presentation: 0.2, availability: 0.3 } },
    ],
  },

  // --- Your life ------------------------------------------------------------
  {
    key: "living_situation",
    section: "Your life",
    type: "single",
    prompt: "Where do you live at the moment?",
    choices: [
      { value: "own", label: "My own place", contributes: { stability: 1 } },
      { value: "rent_alone", label: "Renting, alone", contributes: { stability: 0.9 } },
      { value: "shared", label: "Shared with housemates", contributes: { stability: 0.6 } },
      { value: "family", label: "With family", contributes: { stability: 0.5 } },
      { value: "moving", label: "Between places right now", contributes: { stability: 0.2 } },
    ],
  },
  {
    key: "location",
    section: "Your life",
    type: "text",
    prompt: "Which city are you in?",
    placeholder: "Lagos, London, Toronto",
    contributes: { stability: 0.7 },
  },
  {
    key: "relocation",
    section: "Your life",
    type: "single",
    prompt: "Would you relocate for the right marriage?",
    choices: [
      { value: "yes", label: "Yes", contributes: { requirements: 1, stability: 0.8 } },
      { value: "same_country", label: "Within my country", contributes: { requirements: 0.7, stability: 0.8 } },
      { value: "no", label: "No", contributes: { requirements: 0.5, stability: 0.9 } },
      { value: "depends", label: "It depends on the person", contributes: { requirements: 0.8, stability: 0.7 } },
    ],
  },
  {
    key: "career_stage",
    section: "Your life",
    type: "single",
    prompt: "How settled is your work?",
    choices: [
      { value: "settled", label: "Settled and predictable", contributes: { stability: 1 } },
      { value: "demanding", label: "Settled but very demanding", contributes: { stability: 0.7, availability: 0.5 } },
      { value: "building", label: "Building something", contributes: { stability: 0.5 } },
      { value: "changing", label: "In the middle of changing it", contributes: { stability: 0.3 } },
    ],
  },
  {
    key: "finances",
    section: "Your life",
    type: "single",
    prompt: "How would you describe your finances?",
    help: "We ask because it decides which programme is realistic, not because it decides who you are.",
    choices: [
      { value: "comfortable", label: "Comfortable", contributes: { stability: 1 } },
      { value: "stable", label: "Stable", contributes: { stability: 0.85 } },
      { value: "tight", label: "Tight but improving", contributes: { stability: 0.5 } },
      { value: "strained", label: "Strained", contributes: { stability: 0.25 } },
    ],
  },

  // --- Values and family ----------------------------------------------------
  {
    key: "faith",
    section: "Values and family",
    type: "single",
    prompt: "Does faith play a part in your life?",
    choices: [
      { value: "central", label: "It is central", contributes: { alignment: 1 } },
      { value: "important", label: "It matters to me", contributes: { alignment: 0.9 } },
      { value: "cultural", label: "Culturally, more than personally", contributes: { alignment: 0.7 } },
      { value: "none", label: "Not really", contributes: { alignment: 0.8 } },
    ],
  },
  {
    key: "faith_requirement",
    section: "Values and family",
    type: "single",
    prompt: "Must your partner share it?",
    choices: [
      { value: "must", label: "Yes, absolutely", contributes: { alignment: 1, requirements: 0.9 } },
      { value: "prefer", label: "I would prefer it", contributes: { alignment: 0.8, requirements: 0.8 } },
      { value: "no", label: "No", contributes: { alignment: 0.8, requirements: 0.9 } },
      { value: "unsure", label: "I have not decided", contributes: { alignment: 0.35, requirements: 0.4 } },
    ],
  },
  {
    key: "children",
    section: "Values and family",
    type: "single",
    prompt: "Where do you stand on children?",
    choices: [
      { value: "want", label: "I want them", contributes: { alignment: 1 } },
      { value: "have_want_more", label: "I have children and want more", contributes: { alignment: 0.9 } },
      { value: "have_complete", label: "I have children and that is complete", contributes: { alignment: 0.9 } },
      { value: "dont_want", label: "I do not want them", contributes: { alignment: 0.9 } },
      { value: "unsure", label: "I have not decided", contributes: { alignment: 0.3 } },
    ],
  },
  {
    key: "family_expectations",
    section: "Values and family",
    type: "single",
    prompt: "How much say does your family expect to have?",
    choices: [
      { value: "final", label: "Effectively a final say", contributes: { alignment: 0.4, intent: 0.6 } },
      { value: "strong", label: "A strong opinion I take seriously", contributes: { alignment: 0.7 } },
      { value: "interested", label: "Interested, but it is my decision", contributes: { alignment: 1 } },
      { value: "none", label: "None", contributes: { alignment: 0.85 } },
    ],
  },

  // --- What you are looking for ---------------------------------------------
  {
    key: "partner_qualities",
    section: "What you are looking for",
    type: "multi",
    maxChoices: 3,
    prompt: "Choose the three qualities that matter most.",
    help: "Three. Not five. The limit is the exercise.",
    choices: [
      { value: "kind", label: "Kind" },
      { value: "ambitious", label: "Ambitious" },
      { value: "faithful", label: "Devout" },
      { value: "funny", label: "Funny" },
      { value: "calm", label: "Even-tempered" },
      { value: "family_oriented", label: "Family-oriented" },
      { value: "independent", label: "Independent" },
      { value: "attractive", label: "Physically attractive" },
      { value: "educated", label: "Well educated" },
      { value: "financially_secure", label: "Financially secure" },
      { value: "emotionally_open", label: "Emotionally open" },
      { value: "decisive", label: "Decisive" },
    ],
    contributes: { requirements: 1 },
  },
  {
    key: "hard_requirements",
    section: "What you are looking for",
    type: "longtext",
    prompt: "What would you refuse outright, whatever else was true?",
    help: "These become hard requirements. No introduction will ever cross them, so keep the list short and mean it.",
    placeholder: "One per line.",
    contributes: { requirements: 1, alignment: 0.6 },
  },
  {
    key: "flexible_preferences",
    section: "What you are looking for",
    type: "longtext",
    prompt: "And what would you like, but could live without?",
    help: "These we weight rather than enforce.",
    placeholder: "One per line.",
    optional: true,
    contributes: { requirements: 0.8 },
  },
  {
    key: "age_range",
    section: "What you are looking for",
    type: "single",
    prompt: "How wide is your age range?",
    choices: [
      { value: "narrow", label: "Within about three years of me", contributes: { requirements: 0.4 } },
      { value: "moderate", label: "Within about seven years", contributes: { requirements: 0.8 } },
      { value: "wide", label: "Wider than that", contributes: { requirements: 1 } },
      { value: "unset", label: "I have not thought about it", contributes: { requirements: 0.5 } },
    ],
  },

  // --- Working together -----------------------------------------------------
  {
    key: "service_level",
    section: "Working together",
    type: "single",
    prompt: "What kind of help are you looking for?",
    choices: [
      { value: "clarity", label: "An honest read on where I stand" },
      { value: "coaching", label: "Work on myself before I meet anyone" },
      { value: "matching", label: "Introductions to serious people" },
      { value: "both", label: "Both, in that order" },
      { value: "private", label: "Something private and hands-on" },
    ],
  },
  {
    key: "budget",
    section: "Working together",
    type: "single",
    prompt: "What are you able to invest in this?",
    help: "There is no wrong answer. It decides what we recommend, not whether we take you seriously.",
    choices: [
      { value: "starter", label: "A small amount, to start" },
      { value: "programme", label: "A meaningful amount for a programme" },
      { value: "full", label: "A significant amount for a full search" },
      { value: "unlimited", label: "Whatever the right outcome costs" },
      { value: "unsure", label: "I would need to see the options" },
    ],
  },

  // --- You ------------------------------------------------------------------
  {
    key: "contact_name",
    section: "You",
    type: "text",
    prompt: "What should we call you?",
    placeholder: "First name is fine",
  },
  {
    key: "contact_email",
    section: "You",
    type: "email",
    prompt: "Where should we send your readiness map?",
    help: "One email with your map. Nothing else unless you ask for it.",
    placeholder: "you@example.com",
  },
] as const;

export const TOTAL_STEPS = QUESTIONS.length;

export function questionAt(index: number): Question | undefined {
  return QUESTIONS[index];
}

export function questionByKey(key: string): Question | undefined {
  return QUESTIONS.find((q) => q.key === key);
}

/** The timeline question is deferred to the end when the hero user chose
 *  "I need help deciding". Hesitation is never penalised. */
export function orderedQuestions(deferTimeline: boolean): readonly Question[] {
  if (!deferTimeline) return QUESTIONS;
  const rest = QUESTIONS.filter((q) => q.key !== "timeline");
  const timeline = QUESTIONS.find((q) => q.key === "timeline")!;
  return [...rest, timeline];
}
