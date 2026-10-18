import { REFRAME, RECOGNITION, METHOD, OBJECTIONS } from "@/content/site";

/**
 * Everything an editor may change, declared once.
 *
 * A key here is a contract: the code asks for it, the admin lists it, and the
 * default below is what ships when nobody has touched it. Adding a new
 * editable string means adding one entry — the admin screen, the fallback and
 * the validation all follow from this list.
 *
 * The guarantee wording is deliberately absent. It is a legal position, not
 * content, and lives hard-coded in components/site/guarantee.tsx.
 */

export type FieldKind = "line" | "paragraph";

export interface ContentField {
  key: string;
  label: string;
  help?: string;
  kind: FieldKind;
  fallback: string;
  /**
   * Shown in the admin but not editable. Reserved for the positions the
   * business is committed to — the four objections taken verbatim from the
   * brief — so a wording change there has to be a code change and a review,
   * not a form submission.
   */
  locked?: boolean;
}

export interface ContentGroup {
  id: string;
  title: string;
  description: string;
  /** Where on the public site this appears, for the editor's benefit. */
  appearsOn: string;
  fields: ContentField[];
}

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "practitioners",
    title: "Practitioner profiles",
    description: "Draft slots stay hidden until a name and biography are entered. Publish only verified information with the person's permission.",
    appearsOn: "/experts",
    fields: [0, 1].flatMap((i) => [
      { key: `practitioner.${i}.name`, label: `Practitioner ${i + 1}: name`, kind: "line" as const, fallback: "Add verified practitioner name" },
      { key: `practitioner.${i}.role`, label: `Practitioner ${i + 1}: role`, kind: "line" as const, fallback: i === 0 ? "Readiness coach" : "Matchmaker" },
      { key: `practitioner.${i}.bio`, label: `Practitioner ${i + 1}: verified biography and qualifications`, kind: "paragraph" as const, fallback: "Add verified biography and qualifications" },
      { key: `practitioner.${i}.coverage`, label: `Practitioner ${i + 1}: languages and service coverage`, kind: "paragraph" as const, fallback: "Add verified languages and service coverage" },
    ]),
  },
  {
    id: "case-studies",
    title: "Client case studies",
    description:
      "Draft slots stay hidden until a title and story are entered. Use only consented, verified client material.",
    appearsOn: "/stories",
    fields: [0, 1].flatMap((i) => [
      {
        key: `caseStudy.${i}.title`,
        label: `Case study ${i + 1}: public title`,
        kind: "line" as const,
        fallback: "Add a consented case study title",
      },
      {
        key: `caseStudy.${i}.context`,
        label: `Case study ${i + 1}: starting situation and work delivered`,
        kind: "paragraph" as const,
        fallback: "Add the verified starting situation and work delivered",
      },
      {
        key: `caseStudy.${i}.outcome`,
        label: `Case study ${i + 1}: verified outcome and limitations`,
        kind: "paragraph" as const,
        fallback: "Add the verified outcome and relevant limitations",
      },
      {
        key: `caseStudy.${i}.attribution`,
        label: `Case study ${i + 1}: approved attribution`,
        help: "For example: First name, age range, and city. Leave blank if the release does not permit attribution.",
        kind: "line" as const,
        fallback: "Add approved attribution or write Anonymous",
      },
    ]),
  },
  {
    id: "hero",
    title: "Home — hero",
    description:
      "The first screen. Three lines doing three jobs: who we are, how this works, what we do.",
    appearsOn: "/",
    fields: [
      {
        key: "home.hero.eyebrow",
        label: "Eyebrow",
        help: "Names the category in six words. A visitor who reads nothing else should still know what this is.",
        kind: "line",
        fallback: "Private marriage readiness and human-led matchmaking",
      },
      {
        key: "home.hero.title.line1",
        label: "Headline, first line",
        kind: "line",
        fallback: "Get married",
      },
      {
        key: "home.hero.title.line2",
        label: "Headline, second line",
        kind: "line",
        fallback: "on purpose.",
      },
      {
        key: "home.hero.support",
        label: "Supporting sentence",
        help: "Says what we actually do. The photograph already carries the warmth.",
        kind: "paragraph",
        fallback:
          "Understand what blocks commitment, become ready for it, and meet people who share your intention to marry.",
      },
      {
        key: "home.hero.cta",
        label: "Primary button",
        kind: "line",
        fallback: "Get my free readiness map",
      },
      {
        key: "home.hero.secondaryCta",
        label: "Secondary link",
        help: "Deliberately a link rather than a button. Two equal buttons split the decision.",
        kind: "line",
        fallback: "See how VowFound works",
      },
      {
        key: "home.hero.reassurance",
        label: "Trust line",
        help: "Sits under the button, where the decision is made. Each clause answers an objection.",
        kind: "line",
        fallback:
          "Free · Twelve minutes · Nothing public, ever",
      },
    ],
  },
  {
    id: "begin",
    title: "Home — timeline card",
    description: "The section the hero button leads into.",
    appearsOn: "/#begin",
    fields: [
      {
        key: "home.begin.title",
        label: "Heading",
        kind: "line",
        fallback: "Give your future a date.",
      },
      {
        key: "home.begin.body",
        label: "Body",
        kind: "paragraph",
        fallback:
          "Choose the season you hope to be married. We will work backward from it with honesty.",
      },
      {
        key: "home.begin.note",
        label: "Note beneath",
        kind: "paragraph",
        fallback:
          "This is not a countdown or a promise. It gives the work a real horizon.",
      },
    ],
  },
  {
    id: "recognition",
    title: "Home — recognition",
    description:
      "The situations clients arrive in. These work by naming the problem, not by resolving it — the solution comes later on the page.",
    appearsOn: "/#recognition",
    fields: [
      {
        key: "home.recognition.title",
        label: "Heading",
        kind: "line",
        fallback: "You do not need more attention. You need a better pattern.",
      },
      {
        key: "home.recognition.standfirst",
        label: "Standfirst",
        kind: "paragraph",
        fallback:
          "We start with the part dating apps cannot see: what keeps repeating, and what a good marriage will ask of you.",
      },
      ...RECOGNITION.slice(0, 4).flatMap((item, i) => [
        {
          key: `home.recognition.${i}.title`,
          label: `Card ${i + 1} — title`,
          kind: "line" as const,
          fallback: item.title,
        },
        {
          key: `home.recognition.${i}.body`,
          label: `Card ${i + 1} — body`,
          kind: "paragraph" as const,
          fallback: item.body,
        },
      ]),
    ],
  },
  {
    id: "reframe",
    title: "Home — the reframe",
    description:
      "The clearest statement of why this is not a dating app. Placed where recognition has just done its work.",
    appearsOn: "/",
    fields: [
      {
        key: "home.reframe.heading",
        label: "Heading",
        kind: "line",
        fallback: REFRAME.heading,
      },
      {
        key: "home.reframe.body",
        label: "Body",
        kind: "paragraph",
        fallback: REFRAME.body,
      },
    ],
  },
  {
    id: "method",
    title: "The method",
    description:
      "Five stages, in order. The order is the argument, so renaming a stage changes the pitch.",
    appearsOn: "/ and /method",
    fields: METHOD.flatMap((stage, i) => [
      {
        key: `method.${i}.name`,
        label: `Stage ${i + 1} — name`,
        kind: "line" as const,
        fallback: stage.name,
      },
      {
        key: `method.${i}.summary`,
        label: `Stage ${i + 1} — summary`,
        kind: "line" as const,
        fallback: stage.summary,
      },
    ]),
  },
  {
    id: "faq",
    title: "Questions",
    description:
      "Four of these are fixed positions from the brief. Changing an answer changes what the business is promising, so read twice.",
    appearsOn: "/faq and /",
    // The first four are fixed positions from the brief, including the one
    // that states what we do and do not guarantee.
    fields: OBJECTIONS.flatMap((item, i) => [
      {
        key: `faq.${i}.q`,
        label: `Question ${i + 1}`,
        kind: "line" as const,
        fallback: item.q,
        locked: i < 4,
      },
      {
        key: `faq.${i}.a`,
        label: `Answer ${i + 1}`,
        kind: "paragraph" as const,
        fallback: item.a,
        locked: i < 4,
      },
    ]),
  },
  {
    id: "closing",
    title: "Home — closing",
    description: "The final ask, after every objection has been handled.",
    appearsOn: "/",
    fields: [
      {
        key: "home.closing.title",
        label: "Heading",
        kind: "line",
        fallback: "Let marriage become more than a someday.",
      },
      {
        key: "home.closing.body",
        label: "Body",
        kind: "paragraph",
        fallback:
          "Begin with twelve private minutes. Leave with a clear reading of what comes next.",
      },
    ],
  },
];

export const ALL_FIELDS: ContentField[] = CONTENT_GROUPS.flatMap(
  (g) => g.fields,
);

const BY_KEY = new Map(ALL_FIELDS.map((f) => [f.key, f]));

export function fieldFor(key: string): ContentField | undefined {
  return BY_KEY.get(key);
}

export function isEditableKey(key: string): boolean {
  const field = BY_KEY.get(key);
  return Boolean(field) && !field!.locked;
}

/** Defaults, for a fresh database and for the "revert" action. */
export function defaultFor(key: string): string {
  return BY_KEY.get(key)?.fallback ?? "";
}
